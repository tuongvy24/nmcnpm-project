const cron = require('node-cron');
const crawler1 = require('./crawler1');
const crawler2 = require('./crawler2');
const crawler3 = require('./crawler3');

let lastCrawlResults = {
    crawler1: '',
    crawler2: '',
    crawler3: ''
};

// Function to process crawl data
async function processCrawl(crawler, key) {
    try {
        const data = await crawler.crawlData();
        const insertedCount = await crawler.saveDataToDatabase(data);
        lastCrawlResults[key] = `CronJobs.js: Data has been saved successfully. Inserted rows: ${insertedCount}`;
        console.log('cronJobs.js: lastCrawlResults[key]: ', lastCrawlResults[key]);

        // Emit updated crawl results via Socket.IO
        if (global.io) {
            console.log('conJob.js: Emitting updated crawl results via Socket.IO');            
            global.io.emit('crawlResultsUpdated', lastCrawlResults);
        }
    } catch (error) {
        lastCrawlResults[key] = `CronJobs.js: Error while processing data: ${error.message}`;
        console.error(lastCrawlResults[key]);

        // Emit updated crawl results (including error message) via Socket.IO
        if (global.io) {
            console.log('conJob.js: Emitting error via Socket.IO');
            global.io.emit('crawlResultsUpdated', lastCrawlResults);
        }
    }
}

// Schedule crawlers to run periodically
cron.schedule('*/1 * * * *', () => {
    console.log('Running crawler1 every 1 minute');
    processCrawl(crawler1, 'crawler1');
});

cron.schedule('*/3 * * * *', () => {
    console.log('Running crawler3 every 3 minutes');
    processCrawl(crawler3, 'crawler3');
});

module.exports = lastCrawlResults;
