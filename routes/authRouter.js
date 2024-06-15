'use strict'; //che do nghiem ngat

// Import Express framework
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
// lay tu validator.js
// const { body, getErrorMessage } = require('../controllers/validator');


router.get('/login', controller.show);
router.post('/login',controller.login);

router.get('/logout', controller.logout);
router.post('/register', controller.register)


router.get('/forgot', controller.showForgotPassword);
router.post('/forgot', controller.forgotPassword
);

router.get('/reset', controller.showResetPassword);
router.post('/reset', controller.resetPassword
);

module.exports = router;