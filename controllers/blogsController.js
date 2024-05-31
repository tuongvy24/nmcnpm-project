'use strict'

const controller ={}
const models = require('../models')
const sequelize = require('sequelize')
const Op = sequelize.Op;
// const { crawlData, saveDataToDatabase } = require('./crawler2');

controller.init = async (req, res, next) => {
      // lay categories dua ra view
    let weblists = await models.Weblist.findAll({

        include: [{ model: models.Conference }]
    })
    res.locals.weblists = weblists;

    // let categories = await models.Category.findAll({
    //     include: [{ model: models.Blog}]
    // });
    // res.locals.categories = categories;

      // lay tags dua ra view
    // let tags = await models.Tag.findAll()
    // res.locals.tags = tags;


    // // let tags = await models.Tag.findAll();
    // // res.locals.tags = tags;
    next();
}

controller.viewList = async (req, res) => {
    // let category = isNaN(req.query.category) ? 0 : parseInt(req.query.category);
    let webId = isNaN(req.query.id) ? 0 : parseInt(req.query.id);

    // chuc nang tim kiem
    let keyword = req.query.keyword || '';

    // bao dam chi sort theo price, newest, popular thoi
    let sort = ['location', 'date', 'now_deadline'].includes(req.query.sort) ? req.query.sort : 'location';

    let options = {
        // attributes: ['id', 'title', 'description', 'imagePath', 'summary', 'createdAt'],
        // include: [{model: models.Comment }],
        where: {}  
    };
    //     // neu co category      
    if (webId > 0) {
        options.where.weblist_id = webId;
        console.log(options)
    }

    // // blog - tag quan he n-n
    // if (tagId > 0) {
    //     options.include.push({ model: models.Tag, where: { id: tagId }});
    // }

    // if (keyword.trim() != '') {
    //     options.where.title = { [Op.iLike]: `%${keyword}%`}
    // }

    // SEARCH CHO NHIEU TRUONG - OR
     if (keyword.trim() != '') {
        options.where[Op.or] = [
            { title: { [Op.iLike]: `%${keyword}%` } },
            { conference: { [Op.iLike]: `%${keyword}%` } },
            { location: { [Op.iLike]: `%${keyword}%`}}
        ];
    }
    
    // chuc nang sort
    // mac dinh theo gia tien price
    // 
    switch (sort) {
        case 'location':
        options.order = [['location', 'ASC']];
        break;
        case 'date':
        options.order = [['date', 'ASC']];
        break;
        default:
        options.order = [['now_deadline', 'ASC']];
    }
    res.locals.sort = sort;
    // remove tham so sort di, tranh sort 2 lan
    res.locals.originalUrl = removeParam('sort', req.originalUrl);
    // neu query chua co gi, thi them ?
    if (Object.keys(req.query).length == 0) {
        res.locals.originalUrl = res.locals.originalUrl + "?";
    }

    // lay blogs dua ra view
    let conferences = await models.Conference.findAll(options); 
    // res.locals.conferences = conferences;
    // console.log(conferences)
    

    // chuc nang phan trang
    // chuc nang phan trang. neu ko la 1, neu co thi parseInt, tu 1 trơ lên, ko am
    let page = isNaN(req.query.page) ? 1 : Math.max(1, parseInt(req.query.page))
    let limit = 10; // 1 trang co 2 blog
    let offset = limit* (page -1);
    let selectedCons = conferences.slice(offset, offset + limit);

    // dua bien pagination ra view
    res.locals.pagination = {
        page: page,
        limit: limit,
        totalRows: conferences.length,
        queryParams: req.query
    }

    // res.locals.blogs = selectedBlogs;
    res.locals.conferences = selectedCons;

    res.render('index');
    // res.send('to homepage')
}

controller.viewDetails = async (req, res) => {
    let id = isNaN(req.params.id) ? 0 : parseInt(req.params.id);

    let conference = await models.Conference.findOne({
        // attributes: ['id', 'name', 'stars', 'oldPrice', 'price', 'summary', 'description', 'specification'],
        where: { id },
        include: [
            { model: models.Weblist },
            // { model: models.User },
            // { model: models.Tag }
        ]   
    });

    // dua ra view
    res.locals.conference = conference;
    res.render('details');
}


// const { crawlData, saveDataToDatabase } = require('./crawler2');
controller.addWeblist = async (req, res) => {
    const selectedWebsite = req.body.selectedWebsite;
    let crawlData, saveDataToDatabase; // Di chuyển khai báo ra ngoài khối switch
    console.log('req.body', req.body.selectedWebsite)
    // Xử lý dựa trên trang web đã chọn
    switch(selectedWebsite) {
        case '1':
            // Gọi hàm crawl từ file crawler1.js
            const crawler1 = require('./crawler1');
            crawlData = crawler1.crawlData; // Gán hàm crawl từ crawler1.js vào biến crawlData
            saveDataToDatabase = crawler1.saveDataToDatabase;
            break;
        case '2':
            // Gọi hàm crawl từ file crawler2.js
            const crawler2 = require('./crawler2');
            crawlData = crawler2.crawlData; // Gán hàm crawl từ crawler2.js vào biến crawlData
            saveDataToDatabase = crawler2.saveDataToDatabase;
            break;
        // case '3':
        //     // Gọi hàm crawl từ file crawler3.js
        //     const crawler3 = require('./crawler3');
        //     await crawler3.crawlAndSaveData();
        //     break;
        // Thêm các trường hợp khác nếu cần
        default:
            console.log('Trang web không hợp lệ');
            break;
    }


    async function processData() {
        try {
            const data = await crawlData();
            await saveDataToDatabase(data);

            console.log('Data1 has been saved to the database successfully.');
        } catch (error) {
            console.error('Error while processing data:', error);
        }
    }

    processData();
    
    res.render('crawler', { tb: "Da them du lieu thanh cong!" })
    // res.redirect('/weblists');
}


// ham xoa param, cho chuc nang sort
// search tren mang
// 
function removeParam(key, sourceURL) {
    var rtn = sourceURL.split("?")[0],
        param,
        params_arr = [],
        queryString = (sourceURL.indexOf("?") !== -1) ? sourceURL.split("?")[1] : "";
    if (queryString !== "") {
        params_arr = queryString.split("&");
        for (var i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split("=")[0];
            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        if (params_arr.length) rtn = rtn + "?" + params_arr.join("&");
    }
    return rtn;
}

module.exports = controller;