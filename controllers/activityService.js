const { Activity } = require('../models');

const addActivity = async (userId, action) => {
  try {
    await Activity.create({
      userId,
      action,
      createdAt: new Date()
    });
  } catch (error) {
    console.error('Error adding activity:', error);
  }
};

module.exports = addActivity;
