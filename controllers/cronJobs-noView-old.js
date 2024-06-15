const cron = require('node-cron');
const crawler1 = require('./crawler1');
const crawler2 = require('./crawler2');
const crawler3 = require('./crawler3');

async function processCrawl(crawler) {
    try {
        const data = await crawler.crawlData();
        const insertedCount = await crawler.saveDataToDatabase(data);
        console.log(`Data has been saved successfully. Inserted rows: ${insertedCount}`);
    } catch (error) {
        console.error('Error while processing data:', error);
    }
}

// Schedule tasks to be run on the server
cron.schedule('0 */1 * * *', () => {
    console.log('Running crawler1 every 1 hour');
    processCrawl(crawler1);
});

cron.schedule('0 */2 * * *', () => {
    console.log('Running crawler2 every 2 hours');
    processCrawl(crawler2);
});

cron.schedule('0 */3 * * *', () => {
    console.log('Running crawler3 every 3 hours');
    processCrawl(crawler3);
});
