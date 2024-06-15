// model.js

const { Pool } = require('pg');
const puppeteer = require('puppeteer');
require("dotenv").config();
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

const pool = new Pool({
    user: 'nmcnpmprojectdb', 
    host: 'dpg-cpc9bke3e1ms739i77lg-a.singapore-postgres.render.com',    
    database: 'nmcnpmprojectdb',
    password: 'vQy4JE9KFjxdq3iGsHLvoFwrA5a3K1UJ',
    port: 5432,
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 20000,  // Increase timeout as needed
    idleTimeoutMillis: 30000       // Increase idle timeout as needed
});


async function crawlData() {
    try {        
        url = 'https://ccfddl.github.io/';

        // // puppeteer
        // const browser = await puppeteer.launch();
        // const page = await browser.newPage();
        // await page.goto(url);
        // const htmlContent = await page.content();
        // const $ = cheerio.load(htmlContent);
        

        // test moi ca 2 moi truong
        let browser;

        if (process.env.NODE_ENV === 'production') {
            // Puppeteer launch configuration for production (e.g., Docker)
            browser = await puppeteer.launch({
                args: [
                    '--disable-setuid-sandbox',
                    '--no-sandbox', 
                    '--single-process',
                    '--no-zygote',
                ],
                executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
            });
        } else {
            // Simplified Puppeteer launch configuration for local development
            browser = await puppeteer.launch();
        }

        const page = await browser.newPage();
        await page.goto(url);
        const htmlContent = await page.content();
        const $ = cheerio.load(htmlContent);


        const data = [];

        $('tbody .el-table__row').each((index, row) => {
            const rowData = {};
            $(row).find('.el-row').each((idx, div) => {
                let columnName;
                // Extracting data from HTML
                
                switch(idx) {
                case 0:
                    columnName = 'title';
                    break;
                case 1:                       
                        // Tách thông tin ngày và địa điểm từ cột col_1 bằng biểu thức chính quy
                    const col1Content = $(div).text().trim();
                    const dateRegex = /^(.*?\d{4})/; // Biểu thức chính quy để tìm ngày
                    const locationRegex = /\d{4}(.*)/; // Biểu thức chính quy để tìm địa điểm
                    const dateMatch = col1Content.match(dateRegex);
                    const locationMatch = col1Content.match(locationRegex);
                    rowData['date'] = dateMatch ? dateMatch[0].trim() : ''; 
                    rowData['location'] = locationMatch ? locationMatch[1].trim() : ''; 
                    break;
                case 2:
                    columnName = 'conference';
                    break;
                case 3:
                    columnName = 'remark';
                    break;
                case 8:
                    columnName = 'deadline';
                    break;
                case 9:                        
                    // Tách URL từ chuỗi "website: URL"
                    const websiteContent = $(div).text().trim();
                    const website = websiteContent.split('website: ')[1].trim();                       
                    rowData['website'] = website; // Lưu URL vào cột website
                    // console.log(rowData['website'])
                    break;
                default:
                    columnName = `col_${idx}`;
                }

                // Lấy nội dung của div và gán vào cột mới
                const value = $(div).text().trim();
                rowData[columnName] = value;
            });
            data.push(rowData);
        });

        await browser.close();
        console.log('Craler1: Final Conference Data:');
        console.log('Craler1: Final Conference Data:');
        console.log('Craler1: Final Conference Data:', data);
        return data;
    } catch (error) {
        console.error('Error while crawling data:', error);
        throw error;
    } 
}

async function saveDataToDatabase(data) {
    const client = await pool.connect();
    let insertedCount = 0;
    try {
        await client.query('BEGIN');

        for (const conference of data) {
            const hasNonNullValues = Object.values(conference).some(value => value !== null) && conference.website && conference.title && conference.conference;

            if (hasNonNullValues) {
                // Kiểm tra xem mục này đã tồn tại trong cơ sở dữ liệu chưa
                const checkExistenceQuery = `
                    SELECT 1 FROM Conferences
                    WHERE website = $1 AND title = $2 AND conference = $3
                `;
                const checkExistenceParams = [conference.website, conference.title, conference.conference];
                const result = await client.query(checkExistenceQuery, checkExistenceParams);

                if (result.rowCount === 0) {

                    let deadline = conference['deadline'] || conference['now-deadline'];
                    if (deadline) {
                        // Extract the date part within parentheses
                        const dateMatch = deadline.match(/\((.*?)\)/);
                        if (dateMatch && dateMatch[1]) {
                            const parsedDate = moment(dateMatch[1], 'YYYY-MM-DD HH:mm:ss ZZ').format('YYYY-MM-DD');
                            conference['deadline'] = parsedDate;
                        } else {
                            conference['deadline'] = null; // or set it to some default value
                        }
                    }


                    const queryText = `
                        INSERT INTO Conferences (website, title, conference, location, now_deadline, date, running_date, starting_date, ending_date, notification, subformat, weblist_id)
                        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
                        WHERE NOT EXISTS (
                            SELECT 1 FROM Conferences 
                            WHERE website = $1 AND title = $2
                        )
                    `;
                    const queryParams = [                 
                        conference.website,
                        conference.title,
                        conference.conference,
                        conference.location,
                        conference['deadline'], // || conference['now-deadline'],
                        conference.date,
                        conference['running-date'],
                        conference['starting-date'],
                        conference['ending-date'], 
                        conference.notification,
                        conference.subformat || conference.remark,
                        1 // Tham chiếu đến bảng Weblists, với id = 1
                    ];
                    await client.query(queryText, queryParams);
                    insertedCount++;
                }
            }
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error while saving data to database:', error);
        throw error;
    } finally {
        client.release();
    }
    // return rowsInserted;
    console.log(`HAM SaveDB ----so hang them vao: ${insertedCount}`)
    return insertedCount;
}

module.exports = {
    crawlData,
    saveDataToDatabase
};
