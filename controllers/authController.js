'use strict'; //che do nghiem ngat

//const controller = require('../controllers/authController');
const controller = {};
const passport = require('./passport');
const models = require('../models');
const addActivity = require('./activityService'); // Đảm bảo đường dẫn đúng

// goi ham show khi vao login
controller.show = (req, res) => {
    // neu dang nhap roi, thi ko thien thi form Login nua
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    // neu chua dang nhap
    res.render('login', { loginMessage: req.flash('loginMessage'), reqUrl: req.query.reqUrl, registerMessage: req.flash('registerMessage') });
    // res.render('login');
}

// goi ham login sau khi post thong tin tu form login
// co ca reqUrl
controller.login = (req, res, next) => {
    let keepSignedIn = req.body.keepSignedIn;
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account';
    // lay gio hang ra
    // let cart = req.session.cart;
    passport.authenticate('local-login', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) { //nguoi dung chua dang nhap duoc, van giu trang cu
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        } 
        //neu DANG NHAP THANH CONG
        // Chuyen sang users/my-account
        req.logIn(user, async (error) => {
            if (error) { return next(error); }
            // luu session 24 gio neu dung keepSignIn
            req.session.cookie.maxAge = keepSignedIn ? (24 * 60 * 60 * 1000) : null;           

            // Ghi lại hoạt động đăng nhập
            await addActivity(user.id, 'User logged in');
            console.log(`userId: ${user.id}, action: User logged in`)
            return res.redirect(reqUrl);
        });
    })(req, res, next);
}




controller.logout = (req, res, next) => {    
    // dung logout cua passport
    req.logout((error) => {
        if (error) { return next(error); }     
        // neu thanh cong tra ve trang chu
        res.redirect('/')
    })
}

// middleware kiem tra login chua?
controller.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // neu chua dang nhap
    res.redirect(`/users/login?reqUrl=${req.originalUrl}`);
}

// kiem tra co phai admin ko
controller.isAdmin = (req, res, next) => {     
    if (req.isAuthenticated() && req.user.isAdmin) {
        return next();
    }
    res.status(403).send('Forbidden');
     
}

// local-register
controller.register = (req, res, next) => {
    let reqUrl = req.body.reqUrl ? req.body.reqUrl : '/users/my-account';
     
    passport.authenticate('local-register', (error, user) => {
        if (error) {
            return next(error);
        }
        if (!user) { //nguoi dung chua dang nhap duoc
            return res.redirect(`/users/login?reqUrl=${reqUrl}`);
        } 
        //neu DANG NHAP THANH CONG
        // Chuyen sang users/my-account
        req.logIn(user, (error) => {
            if (error) { return next(error); }
            // return res.redirect('/users/my-account');
            return res.redirect(reqUrl);
        });
    })(req, res, next);
}


controller.showForgotPassword = (req, res) => {
    res.render('forgot-password');
}


controller.forgotPassword = async (req, res) => {
    let email = req.body.email; //lay them name=email o trang forgot
    // kt email ton tai
    let user = await models.User.findOne({ where: { email }});
    if (user) {
        // tao link
        const { sign } = require('./jwt'); //lay ham sign tu jwt
        const host = req.header('host');
        const resetLink = `${req.protocol}://${host}/users/reset?token=${sign(email)}&email=${email}`;
        
        // gui mail
        const { sendForgotPasswordMail } = require('./mail');
        sendForgotPasswordMail(user, host, resetLink)
            .then((result) => { //neu thong bao thanh cong
                console.log('email has been sent');
                return res.render('forgot-password', { done: true });
            })
            .catch(error => {
                console.log(error.statusCode);
                return res.render('forgot-password', { message: 'An error has occured when sending to your email. Please check your email account!' });
            }) 

        // tb thanh cong
        // return res.render('forgot-password', { done: true });
    } else {
         // nguoc lai tb  email ko ton tai
        return res.render('forgot-password', { message: 'Email does not exist!' });
    }   
}

controller.showResetPassword = (req, res) => {
    let email = req.query.email;
    let token = req.query.token;
    let { verify } = require('./jwt');
    if(!token || !verify(token)) { //neu tonken ko co hay ko hop le
        return res.render('reset-password', { expired: true });
    } else {
        return res.render('reset-password', { email, token });
    }
    // res.render('reset-password');
}

// khi nguoi dung nhan submit
controller.resetPassword = async (req, res) => {
    let email = req.body.email;
    let token = req.body.token;
    let bcrypt = require('bcrypt');
    let password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8)); //truyen vao va ma hoa mk

    await models.User.update({ password }, { where: { email }});
    res.render('reset-password', { done: true });

}
module.exports = controller;