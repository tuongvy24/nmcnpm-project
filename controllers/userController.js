const controller = {};
const models = require("../models");
const sequelize = require('sequelize');
const Op = sequelize.Op;
const { User, Activity, FriendRequest } = require('../models');

// 
// phan nay controller cua admin de quan ly user
// 
controller.show = async (req, res) => {
  // chuc nang tim kiem
  let keyword = req.query.keyword || '';
  // console.log(`keyword: ${keyword}`)
  let options = {
      // attributes: ['id', 'title', 'description', 'imagePath', 'summary', 'createdAt'],
      // include: [{model: models.Comment }],
      order: [["id", "DESC"]],
      where: {}  
  };

  // SEARCH CHO NHIEU TRUONG - OR
  if (keyword.trim() != '') {
    options.where[Op.or] = [
        { email: { [Op.iLike]: `%${keyword}%` } },
        { firstName: { [Op.iLike]: `%${keyword}%` } },
        { lastName: { [Op.iLike]: `%${keyword}%`}}
    ];
  }

  let users = await models.User.findAll(options);

  // chuc nang phan trang
  // chuc nang phan trang. neu ko la 1, neu co thi parseInt, tu 1 trơ lên, ko am
  let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page))
  let limit = 5; // 1 trang co 2 blog
  let offset = limit* (page -1);
  let selectedUsers = users.slice(offset, offset + limit);

  // dua bien pagination ra view
  res.locals.pagination = {
      page: page,
      limit: limit,
      totalRows: users.length,
      queryParams: req.query
  }

  res.locals.users = selectedUsers;    
  res.render("user-management");
};

controller.addUser = async (req, res) => {
  console.log(req.body) // kiem tra du lieu tu user gui len

  let { firstName, lastName, email, mobile, isAdmin } = req.body;
  try {
    await models.User.create({ firstName, lastName, email, mobile, isAdmin: isAdmin ? true : false });
    res.redirect('/users');
  } catch (error) {
    console.error(error)
    res.send('Can not add user');
  }

  
};

controller.deleteUser = async (req, res) => {
  let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);
  try {
    await models.User.destroy({ where: { id } });
    // res.redirect('/users');
    res.send("User deleted!")
  } catch(error) {
    console.error(error)
    res.send("can not delete user!");
  }
}

controller.editUser = async (req, res) => {
  let { id, firstName, lastName, email, mobile, isAdmin } = req.body;
   try {
      await models.User.update({ firstName, lastName, mobile, isAdmin: isAdmin ? true : false }, { where: { id } });
      // res.redirect('/users');
      res.send('User updated!')
    } catch(error) {
      console.error(error)
      res.send("can not edit user!");
    }
}



// 
// Phan nay cua user: dashboard, lich su hoat dong, dia chi...
// 
// ham dung truy xuat va show lich su hoat dong
controller. showActivity = async (req, res) => {
  const userId = req.user.id; // set req.user
  try {
    const activities = await models.Activity.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

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

      res.render('my-account', {
        user,
        activityLabels,
        activityData, 
        activities
      });


    // res.json(activities);
    // res.render('my-account', { activities });
  } catch (error) {
    console.error('Error retrieving activities:', error);
    res.status(500).send('Internal Server Error');
  }
}

module.exports = controller;
