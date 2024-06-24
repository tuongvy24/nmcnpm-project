const express = require('express');
const router = express.Router();
const { User, FriendRequest } = require('../models');
const authController = require("../controllers/authController");

// xac thuc nguoi dung truoc khi vao routes
router.use(authController.isLoggedIn);
// Gửi yêu cầu kết bạn
router.post('/send-request', async (req, res) => {
    const { requesterId, receiverId } = req.body;
    try {
        const friendRequest = await FriendRequest.create({ requesterId, receiverId });
        res.status(200).json(friendRequest);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Chấp nhận yêu cầu kết bạn
router.post('/accept-request', async (req, res) => {
    const { requestId } = req.body;
    try {
        const friendRequest = await FriendRequest.findByPk(requestId);
        if (friendRequest) {
            friendRequest.status = 'accepted';
            await friendRequest.save();
            res.status(200).json(friendRequest);
        } else {
            res.status(404).json({ error: 'Yêu cầu không tồn tại' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Từ chối yêu cầu kết bạn
router.post('/reject-request', async (req, res) => {
    const { requestId } = req.body;
    try {
        const friendRequest = await FriendRequest.findByPk(requestId);
        if (friendRequest) {
            friendRequest.status = 'rejected';
            await friendRequest.save();
            res.status(200).json(friendRequest);
        } else {
            res.status(404).json({ error: 'Yêu cầu không tồn tại' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Hiển thị lịch sử hoạt động
router.get('/activity-history', async (req, res) => {
    const userId = req.user.id; // Assuming user is logged in and user ID is available in req.user
    try {
        const activities = await Activity.findAll({ where: { userId } });
        res.render('activityHistory', { activities });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/friend-requests', async (req, res) => {
    const userId = req.user.id;
    try {
        const receivedRequests = await FriendRequest.findAll({ where: { receiverId: userId, status: 'pending' } });
        res.render('friendRequests', { userId, receivedRequests });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
