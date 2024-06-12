'use strict'; //che do nghiem ngat

// Import Express framework
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
// lay tu validator.js
const { body, getErrorMessage } = require('../controllers/validator');


router.get('/login', controller.show);

// kiem tra email password tu server
router.post('/login', 
    // body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
    // body('password').trim().notEmpty().withMessage('password is required!'),
    // (req, res, next) => {
    //     let message = getErrorMessage(req);
    //     if (message) {
    //         return res.render('login', { loginMessage: message })
    //     }
    //     next();
    // },
    controller.login);

router.get('/logout', controller.logout);
router.post('/register', 
    // body('firstName').trim().notEmpty().withMessage('first name is required!'),
    // body('lastName').trim().notEmpty().withMessage('last name is required!'),
    // body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
    // body('password').trim().notEmpty().withMessage('password is required!'),
    // body('password').matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/).withMessage('Password must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters'),
    // body('confirmPassword').custom((confirmPassword, { req }) => {
    //     if (confirmPassword != req.body.password) {
    //         throw new Error('Passwords not match!');
    //     }
    //     return true;
    // }),
    // (req, res, next) => {
    //     let message = getErrorMessage(req);
    //     if (message) {
    //         return res.render('login', { loginMessage: message })
    //     }
    //     next();
    // },
    controller.register)


router.get('/forgot', controller.showForgotPassword);
router.post('/forgot', 
    // body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),    
    // (req, res, next) => {
    //     let message = getErrorMessage(req);
    //     if (message) {
    //         return res.render('forgot-password', { message })
    //     }
    //     next();
    // },
    controller.forgotPassword
);

router.get('/reset', controller.showResetPassword);
// router.post('/reset',
//     body('email').trim().notEmpty().withMessage('Email is required!').isEmail().withMessage('Invalid email address!'),
//     body('password').trim().notEmpty().withMessage('password is required!'),
//     body('password').matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/).withMessage('Password must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters'),
//     body('confirmPassword').custom((confirmPassword, { req }) => {
//         if (confirmPassword != req.body.password) {
//             throw new Error('Passwords not match!');
//         }
//         return true;
//     }),
//     (req, res, next) => {
//         let message = getErrorMessage(req);
//         if (message) {
//             return res.render('forgot-password', { message })
//         }
//         next();
//     },
//     controller.resetPassword
// );

module.exports = router;