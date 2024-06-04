const controller = {};
const models = require("../models");

controller.init = async (req, res, next) => {
  // lay categories dua ra view
  let weblists = await models.Weblist.findAll({
    include: [{ model: models.Conference }]
  })
  res.locals.weblists = weblists;

  next();
}

controller.show = async (req, res) => {
  res.locals.users = await models.User.findAll({
    attributes: [
      "id",
      "imagePath",
      "username",
      "firstName",
      "lastName",
      "mobile",
      "isAdmin",
    ],
    // order: [["createdAt", "DESC"]],
    // mac dinh ASC
  });
  res.render("user-management");
};



controller.addUser = async (req, res) => {
  console.log(req.body) // kiem tra du lieu tu user gui len

  let { firstName, lastName, username, mobile, isAdmin } = req.body;
  try {
    await models.User.create({ firstName, lastName, username, mobile, isAdmin: isAdmin ? true : false });
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
  let { id, firstName, lastName, username, mobile, isAdmin } = req.body;
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
