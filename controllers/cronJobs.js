const cron = require('node-cron');
const crawler1 = require('./crawler1');
const crawler2 = require('./crawler2');
const crawler3 = require('./crawler3');
const { sendEmail } = require('./mail-updateCon'); // Import the sendEmail function

// const io = require('socket.io')(); // Import socket.io and initialize it
const defaultEmailAddress = 'vonhanphuc@gmail.com'; // Define the default email address

let lastCrawlResults = {
    crawler1: '',
    crawler2: '',
    crawler3: ''
};


// Hàm xử lý việc crawl dữ liệu
async function processCrawl(crawler, key) {
    try {
        const data = await crawler.crawlData();
        const insertedCount = await crawler.saveDataToDatabase(data);
        lastCrawlResults[key] = `CronJobs.js: Data has been saved successfully. Inserted rows: ${insertedCount}`;
        console.log('CronJobs.js: lastCrawlResults[key]: ', lastCrawlResults[key]);

         // Send email notification
         const subject = `Crawler ${key} Results`;
         const htmlContent = `<p>${lastCrawlResults[key]}</p>`;
         await sendEmail(defaultEmailAddress, subject, htmlContent);
    } catch (error) {
        lastCrawlResults[key] = `CronJobs.js: Error while processing data: ${error.message}`;
        console.error(lastCrawlResults[key]);

        // Send email notification with error
        const subject = `Crawler ${key} Error`;
        const htmlContent = `<p>${lastCrawlResults[key]}</p>`;
        await sendEmail(defaultEmailAddress, subject, htmlContent);
    } finally {
        // Reset the email variables after sending the email
        subject = '';
        htmlContent = '';
    }
}

// Định kỳ chạy các crawler mỗi phút: '*/1 * * * *'
// uplen server de 60 min nhe
cron.schedule('*/60 * * * *', () => {
    console.log('Running crawler1 every 1 minute');
    processCrawl(crawler1, 'crawler1');
});

// cron.schedule('*/3 * * * *', () => {
//     console.log('Running crawler2 every 3 minute');
//     processCrawl(crawler2, 'crawler2');
// });

// Định kỳ chạy các crawler mỗi phút: '*/1 * * * *'
cron.schedule('*/60 * * * *', () => {
    console.log('Running crawler3 every 3 minute');
    processCrawl(crawler3, 'crawler3');
});

// module.exports = { io, lastCrawlResults };
module.exports = lastCrawlResults;
