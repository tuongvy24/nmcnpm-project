'use strict'

const controller ={}
const models = require('../models')
const sequelize = require('sequelize')
const Op = sequelize.Op; 
const lastCrawlResults = require('./cronJobs'); // Import kết quả từ cron job



// view ds web o combo box the select trang index
controller.viewList = async (req, res) => {      

    let weblists = await models.Weblist.findAll({
        include: [{ model: models.Conference }]
    })
    res.locals.weblists = weblists;
    res.locals.crawlResults = lastCrawlResults; // Truyền kết quả vào view
    // req.io.emit('crawlResultsUpdated', lastCrawlResults);

    console.log('Controller: -----lastCrawlResults: ', lastCrawlResults)


    const successMessage = req.flash('success')
    const errorMessage = req.flash('error');
    res.render('index', { successMessage: successMessage, errorMessage: errorMessage });
    // res.render('index', { successMessage: successMessage });   
}

// Middleware để xóa req.flash sau mỗi lần submit
const clearFlash = (req, res) => {
    req.flash = {}; // Xóa tất cả các flash messages
    // next(); // Chuyển tiếp để xử lý các yêu cầu tiếp theo
};

// dung de crawl du lieu hoi nghi tu cac trang web 
controller.addWeblist = async (req, res) => {
    const selectedWebsite = req.body.selectedWebsite;
    let crawlData, saveDataToDatabase; // Di chuyển khai báo ra ngoài khối switch
    let insertedCount = 0;
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
        case '3':
            // Gọi hàm crawl từ file crawler3.js
            const crawler3 = require('./crawler3');
            crawlData = crawler3.crawlData; // Gán hàm crawl từ crawler2.js vào biến crawlData
            saveDataToDatabase = crawler3.saveDataToDatabase;
            // insertedCount = crawler3.insertedCount;
            break;
        // Thêm các trường hợp khác nếu cần
        default:
            console.log('Trang web không hợp lệ');
            break;
    }


    async function processData() {
        try {
            const data = await crawlData();
            insertedCount = await saveDataToDatabase(data);

            console.log(`in ProcessData() Data CONTROLLER has been saved to the database successfully. ${insertedCount}`);
            // req.flash('success', `Da them du lieu thanh cong nhe! so hang duoc them moi: ${insertedCount}`);

        } catch (error) {
            console.error('Error while processing data:', error);
            req.flash('error', `Error while processing data: ${error}`)
        }
    }

   
    await processData();
    
    // console.log(`OUT so hang them vao CONTROLLER: ${insertedCount}`)
    req.flash('success', `Da them du lieu thanh cong nhe! so hang duoc them moi: ${insertedCount}`)
    await clearFlash(req, res); // Gọi middleware để xóa req.flash
    res.redirect('/home');

}
module.exports = controller;