const cron = require('node-cron');
const crawler1 = require('./crawler1');
const crawler2 = require('./crawler2');
const crawler3 = require('./crawler3');

// const io = require('socket.io')(); // Import socket.io and initialize it

let lastCrawlResults = {
    crawler1: '',
    crawler2: '',
    crawler3: ''
};

// io.on('connection', (socket) => {
//     console.log('A user connected');
//     // Send initial crawl results when a user connects (if needed)
//     socket.emit('crawlResultsUpdated', lastCrawlResults);
// });

// Hàm xử lý việc crawl dữ liệu
async function processCrawl(crawler, key) {
    try {
        const data = await crawler.crawlData();
        const insertedCount = await crawler.saveDataToDatabase(data);
        lastCrawlResults[key] = `CronJobs.js: Data has been saved successfully. Inserted rows: ${insertedCount}`;
        console.log(lastCrawlResults[key]);

        // Emit updated crawl results via Socket.IO
        // io.emit('crawlResultsUpdated', lastCrawlResults);
    } catch (error) {
        lastCrawlResults[key] = `CronJobs.js: Error while processing data: ${error.message}`;
        console.error(lastCrawlResults[key]);

        // Emit updated crawl results (including error message) via Socket.IO
        // io.emit('crawlResultsUpdated', lastCrawlResults);
    }
}

// Định kỳ chạy các crawler mỗi phút
cron.schedule('*/1 * * * *', () => {
    console.log('Running crawler1 every 1 minute');
    processCrawl(crawler1, 'crawler1');
});

// cron.schedule('*/3 * * * *', () => {
//     console.log('Running crawler2 every 3 minute');
//     processCrawl(crawler2, 'crawler2');
// });

cron.schedule('*/3 * * * *', () => {
    console.log('Running crawler3 every 3 minute');
    processCrawl(crawler3, 'crawler3');
});

// module.exports = { io, lastCrawlResults };
module.exports = lastCrawlResults;
