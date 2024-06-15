const controller = {};
const models = require("../models");
const sequelize = require('sequelize');
const Op = sequelize.Op;


// controller.init = async (req, res, next) => {
//   // lay categories dua ra view
//   let weblists = await models.Weblist.findAll({
//     include: [{ model: models.Conference }]
//   })
//   res.locals.weblists = weblists;

//   next();
// }

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
module.exports = controller;
