'use strict'; //che do nghiem ngat

// Import Express framework
const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
// const { ensureAuthenticated, ensureAdmin } = require('../controllers/authorization');

router.get('/login', controller.show);
router.post('/login', controller.login);

router.get('/logout', controller.logout);
router.post('/register', controller.register)


router.get('/forgot', controller.showForgotPassword);
router.post('/forgot', controller.forgotPassword
);

router.get('/reset', controller.showResetPassword);
router.post('/reset', controller.resetPassword
);

// Route bảo vệ bằng middleware
router.get('/admin', controller.isLoggedIn, controller.isAdmin, (req, res) => {
    res.send('Welcome to the admin page');
});


module.exports = router;