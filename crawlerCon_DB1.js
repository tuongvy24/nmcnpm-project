// DANG SU DUNG
// https://ccfddl.github.io/
// da luu du lieu crawler duoc vao database
// 

// update 27 April 2024
const { Pool } = require('pg');
const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// async function crawlData() {
//   try {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     await page.goto('https://ccfddl.github.io/');

//     // Lấy HTML từ trang web đã tải
//     const htmlContent = await page.content();

//     // Tạo một mảng để lưu trữ dữ liệu
//     const data = [];

//     // Load HTML vào Cheerio
//     const $ = cheerio.load(htmlContent);

//     // Trích xuất dữ liệu từ các hàng có class là "el-table__row" trong thẻ tbody
//     $('tbody .el-table__row').each((index, row) => {
//       // Tạo một đối tượng mới để lưu trữ dữ liệu của mỗi hàng
//       const rowData = {};
//       // Trích xuất thông tin từ các div có class là "el-row" trong hàng
//       $(row).find('.el-row').each((idx, div) => {
//         // Tạo key cho cột dựa trên index
//         const columnName = `col_${idx}`;
//         // Lấy nội dung của div và gán vào cột mới
//         const value = $(div).text().trim();
//         rowData[columnName] = value;
//       });
//       // Thêm đối tượng rowData vào mảng data
//       data.push(rowData);
//     });

//     // Đóng trình duyệt Puppeteer
//     await browser.close();

//     // Lưu dữ liệu vào file data2.js dưới dạng JSON
//     fs.writeFileSync('data2.js', JSON.stringify(data, null, 2), 'utf-8');
//     console.log('Dữ liệu đã được lưu vào file data2.js');
//   } catch (error) {
//     console.error('Đã có lỗi khi thực hiện crawl:', error);
//   }
// }

// crawlData();



// Thông tin kết nối đến cơ sở dữ liệu PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'CrawlerConDB',
    password: 'PhucTony',
    port: 5432,
});

// Hàm crawlData trả về một Promise
async function crawlData() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('https://ccfddl.github.io/');

        // Lấy HTML từ trang web đã tải
        const htmlContent = await page.content();

        // Tạo một mảng để lưu trữ dữ liệu
        const data = [];

        // Load HTML vào Cheerio
        const $ = cheerio.load(htmlContent);

        // Trích xuất dữ liệu từ các hàng có class là "el-table__row" trong thẻ tbody
        $('tbody .el-table__row').each((index, row) => {
            // Tạo một đối tượng mới để lưu trữ dữ liệu của mỗi hàng
            const rowData = {};
            // Trích xuất thông tin từ các div có class là "el-row" trong hàng
            $(row).find('.el-row').each((idx, div) => {
                // Tạo key cho cột dựa trên index
                // const columnName = `col_${idx}`;
                let columnName;
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
            // Thêm đối tượng rowData vào mảng data
            data.push(rowData);
        });

        // Đóng trình duyệt Puppeteer
        await browser.close();

        // Trả về dữ liệu
        return data;

    } catch (error) {
        console.error('Đã có lỗi khi thực hiện crawl:', error);
        throw error; // Ném lỗi để Promise bị reject
    }
}

// Hàm saveDataToDatabase trả về một Promise
async function saveDataToDatabase(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Thêm dữ liệu vào bảng Conferences
        for (const conference of data) {
            // const hasNonNullValues = Object.values(conference).some(value => value !== null) && conference.col_9 && conference.col_0 && conference.col_2;
            const hasNonNullValues = Object.values(conference).some(value => value !== null) && conference.website && conference.title && conference.conference;
            // // test
            // console.log('website: ', conference.website)
            if (hasNonNullValues) {
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
                    conference['deadline'] || conference['now-deadline'],
                    conference.date,
                    conference['running-date'],
                    conference['starting-date'],
                    conference['ending-date'], 
                    conference.notification,
                    conference.subformat || conference.remark,
                    1 // Tham chiếu đến bảng Weblists, với id = 1
                ];
                // console.log(queryParams)
                await client.query(queryText, queryParams);
            }
        }

        await client.query('COMMIT');
        console.log('Dữ liệu đã được lưu vào cơ sở dữ liệu PostgreSQL thành công.111');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Đã có lỗi khi lưu dữ liệu vào cơ sở dữ liệu PostgreSQL:', error);
        throw error; // Ném lỗi để Promise bị reject
    } finally {
        client.release();
    }
}

// Gọi hàm crawlData() và sau đó gọi hàm saveDataToDatabase(data)
crawlData()
    .then(data => {
        return saveDataToDatabase(data);
    })
    .then(() => {
        console.log('Dữ liệu đã được lưu vào cơ sở dữ liệu PostgreSQL thành công.');
    })
    .catch(error => {
        console.error('Đã có lỗi khi thực hiện crawl và lưu dữ liệu:', error);
    });
