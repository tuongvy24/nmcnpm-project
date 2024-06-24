const express = require('express');
const router = express.Router();
const { User, Activity, FriendRequest } = require('../models');

router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  console.log(`userId: ${userId}`) //in log kiem tra 
  try {
    const user = await User.findByPk(userId, {
      include: [
        { model: Activity, as: 'Activities' },
        { model: FriendRequest, as: 'SentRequests', include: ['Receiver'] },
        { model: FriendRequest, as: 'ReceivedRequests', include: ['Requester'] }
      ]
    });    

    const activityHistory = user.Activities.map(activity => ({
        action: activity.action,
        date: activity.createdAt
      }));
  
      // Chuẩn bị dữ liệu cho biểu đồ hoạt động
      const activityLabels = activityHistory.map(activity => activity.date.toLocaleDateString());
      console.log(`activityLabels: ${activityLabels}`)
      const activityData = activityHistory.map(activity => 1); // Giá trị hoạt động mẫu (1)
      console.log(`activityData: ${activityData}`)

      res.render('dashboard', {
        user,
        activityLabels,
        activityData
      });
  } catch (err) {
    console.error(err);
    res.status(400).send('Error loading dashboard');
  }
});

module.exports = router;
