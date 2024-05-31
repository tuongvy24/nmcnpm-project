'use strict'
const express = require('express')
const router = express.Router();
const controller = require('../controllers/crawlersController');
// const controller2 = require('../controllers/blogsController');

// router.use(controller2.init);
router.get('/', controller.viewList);
// router.get('/:id', controller.viewDetails);

router.post('/', controller.addWeblist)


module.exports = router;