const express = require('express');
const router = express.Router();
const { User, Message } = require('../models');

// Gửi tin nhắn
router.post('/send', async (req, res) => {
    const { senderId, receiverId, content } = req.body;
    try {
        const message = await Message.create({ senderId, receiverId, content });
        // res.status(200).json(message);
        // res.render('inbox')
        // res.redirect('/users/inbox')
        res.redirect('/messages/inbox');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy tin nhắn
// Hiển thị tin nhắn
router.get('/inbox', async (req, res) => {
    const userId = req.user.id; // Assuming user is logged in and user ID is available in req.user
    try {
        const messages = await Message.findAll({
            where: { receiverId: userId },
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.render('inbox', { userId, messages });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports = router;
