'use strict';

const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');
const models = require('../models');

//goi ham khi xac thuc t/cong va luu t/tin user vao session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

//ham goi boi passport.session de lay ttin cua user tu db
//va dua vao req.user
passport.deserializeUser(async (id, done) => {
  try {
        let user = await models.User.findOne({
            // attributes: ['id', 'email', 'firstName', 'lastName', 'isAdmin'],
            where: { id }
        });
        done(null, user); // truyen user ra
  } catch (error) {
        done(error, null);
  }
});

//ham xac thuc nguoi dung khi dang nhap
passport.use('local-login', new LocalStrategy({
    usernameField: 'email', //ten dnhap la email
    passwordField: 'password',
    passReqToCallback: true // cho phep truyen req vao call back de ktra user da dang nhap chua
}, async (req, email, password, done) => {
    if (email) { //neu co nhap email
        email = email.toLowerCase(); //chuyen dc email
    }
    try {
        if(!req.user) {
            //neu user chua dang nhap, kt voi thong tin trong csdl co hay ko
            let user = await models.User.findOne({ where: { email }});
            
            console.log("passport.js: ", user);
            if (!user) { //neu email chua ton tai
                return done(null, false, req.flash('loginMessage', 'Email khong ton tai nhe!'));
            }
            
            //neu mat khau ko dung
            // console.log('pass nhap:', password);
            // console.log('pass csdl:', user.password)
            // neu mat khau ko dung
            if (!bcrypt.compareSync(password, user.password)){
                return done(null, false, req.flash('loginMessage', 'Password khong dung'));
            }
            // DUNG -> cho phep dang nhap
            return done(null, user);
        }
        //da dang nhap rui, bo qua dang nhap
        done(null, req.user);

    } catch (error) {
        done(error);
    }
}));


passport.use('local-register', new LocalStrategy({
    usernameField: 'email', //ten dnhap la email
    passwordField: 'password',
    passReqToCallback: true // cho phep truyen req vao call back de ktra user da dang nhap chua
}, async (req, email, password, done) => {
    if (email) {
        email = email.toLowerCase(); //chuyen dc email
    }
    if (req.user) { //neu nguoi dung da dang nhap thi bo qua
        return done(null, req.user);
    }
    try {
        //neu user chua dang nhap, kt voi thong tin trong csdl co hay ko
        let user = await models.User.findOne({ where: { email }});
        
        
        if (user) { //neu email co ton tai roi registerMessage         

            return done(null, false, req.flash('registerMessage', 'Email is already taken!'));
        }
        // neu email chua dang ky
        user = await models.User.create({
            email: email,
            password: bcrypt.hashSync(password, bcrypt.genSaltSync(8)),
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            mobile: req.body.mobile
        });
        // thong bao dang ky thanh cong
        done(null, false, req.flash('registerMessage', 'You have registered successfully. Please login!'))
    } catch (error) {
        done(error);
    }
    
}));
module.exports = passport;