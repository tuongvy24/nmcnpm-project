const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");

// Định nghĩa mô hình
const { User, Activity, FriendRequest, Message } = require('../models');

// kiem tra co phai la admin ko moi duoc
router.use(authController.isLoggedIn, authController.isAdmin)
router.get('/', async (req, res) => {
    try {
        const users = await User.findAll();
        const activities = await Activity.findAll();
        const friendRequests = await FriendRequest.findAll({
            include: [
                { model: User, as: 'Requester', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });
        const messages = await Message.findAll({
            include: [
                { model: User, as: 'Sender', attributes: ['id', 'firstName', 'lastName'] },
                { model: User, as: 'Receiver', attributes: ['id', 'firstName', 'lastName'] }
            ]
        });
        
        // Tính số lượng hoạt động của mỗi user
        const userActivityCounts = {};
        activities.forEach(activity => {
            if (!userActivityCounts[activity.userId]) {
                userActivityCounts[activity.userId] = 0;
            }
            userActivityCounts[activity.userId]++;
        });
        // 
        // const users = [
        //     { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' },
        //     { firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com'}
        // ];
        // Hàm map lặp qua phần tử đầu tiên trong mảng users:
        // user là { firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com' }
        // Hàm arrow trả về 'John Doe'
        // console.log(userNames); // ['John Doe', 'Jane Smith']
        // 
        // ham map de tao mang cac userName moi cua mang users
        const userNames = users.map(user => `${user.firstName} ${user.lastName}`);
        const userIds = users.map(user => user.id);
        const userActivityData = users.map(user => userActivityCounts[user.id] || 0);

        // in kiem tra
        console.log(`userName: ${userNames}, userId: ${userIds}`)
        console.log(`userActivityData: ${userActivityData}`)

        res.render('index-dashboard', { 
          users, 
          activities, 
          friendRequests,
          messages,
          userNames,         
          userIds,
          userActivityData
          // userActivityData: JSON.stringify(userActivityData), // Chuyển thành JSON để sử dụng trong Chart.js
          // userNames: JSON.stringify(userNames) // Chuyển thành JSON để sử dụng trong Chart.js
        });       
    } catch (err) {
        console.error(err);
        res.status(500).send('Error retrieving data');
    }
});

module.exports = router;