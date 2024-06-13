'use strict';
const jwt = require('jsonwebtoken');
const JWT_SECRET = 'jkldjs';

function sign(email, expiresIn ="30m") {
    return jwt.sign(
        { email },
        process.env.JWT_SECRET || JWT_SECRET, 
        { expiresIn }
    )
}

// ham verify nhan token
function verify(token) {
    try {
        jwt.verify(token, process.env.JWT_SECRET || JWT_SECRET);
        return true;
    } catch (error) {
        return false;
    }
}
module.exports = { sign, verify };