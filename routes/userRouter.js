const express = require("express");
const router = express.Router();
const controller = require("../controllers/userController");
const authController = require("../controllers/authController");
// kiem tra nguoi dung co dang nhap ko truoc khi vao route
// neu co thi vao route tiep theo, 
// neu KO ve lai trang login+ reqUrl: http://localhost:3000/users/login?reqUrl=/users
// authController.js xem controller.isLoggedIn

// kiem tra login
router.use(authController.isLoggedIn)
// vao my account cua tung user
router.get('/my-account', controller.showActivity);


// kiem tra phan quyen admin
router.use(authController.isAdmin)

// show trang quan ly user nhe!
router.get("/", controller.show);
router.post('/', controller.addUser)
router.delete('/:id', controller.deleteUser);
router.put('/', controller.editUser)


module.exports = router;
