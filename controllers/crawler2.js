const { Pool } = require('pg');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');


// const pool = new Pool({
//     user: 'postgres',
//     host: '127.0.0.1',
//     database: 'CrawlerConDB',
//     password: 'PhucTony',
//     port: 5432,
// });
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
// Biến toàn cục để lưu trữ số hàng đã được chèn vào cơ sở dữ liệu
// let insertedCount = 0;
// URL của trang web cần crawl
const url = 'https://www.lix.polytechnique.fr/~hermann/conf.php';
// async function crawlData() {
//     try {
//         const browser = await puppeteer.launch();
//         const page = await browser.newPage();
//         await page.goto('https://ccfddl.github.io/');
//         const htmlContent = await page.content();
//         const $ = cheerio.load(htmlContent);
//         const data = [];
//         $('tbody .el-table__row').each((index, row) => {
//             const rowData = {};
//             $(row).find('.el-row').each((idx, div) => {
//                 let columnName;
//                 // Extracting data from HTML
//                 // ...
//                 switch(idx) {
//                 case 0:
//                     columnName = 'title';
//                     break;
//                 case 1:                       
//                         // Tách thông tin ngày và địa điểm từ cột col_1 bằng biểu thức chính quy
//                     const col1Content = $(div).text().trim();
//                     const dateRegex = /^(.*?\d{4})/; // Biểu thức chính quy để tìm ngày
//                     const locationRegex = /\d{4}(.*)/; // Biểu thức chính quy để tìm địa điểm
//                     const dateMatch = col1Content.match(dateRegex);
//                     const locationMatch = col1Content.match(locationRegex);
//                     rowData['date'] = dateMatch ? dateMatch[0].trim() : ''; 
//                     rowData['location'] = locationMatch ? locationMatch[1].trim() : ''; 
//                     break;
//                 case 2:
//                     columnName = 'conference';
//                     break;
//                 case 3:
//                     columnName = 'remark';
//                     break;
//                 case 8:
//                     columnName = 'deadline';
//                     break;
//                 case 9:                        
//                     // Tách URL từ chuỗi "website: URL"
//                     const websiteContent = $(div).text().trim();
//                     const website = websiteContent.split('website: ')[1].trim();                       
//                     rowData['website'] = website; // Lưu URL vào cột website
//                     // console.log(rowData['website'])
//                     break;
//                 default:
//                     columnName = `col_${idx}`;
//                 }

//                 // Lấy nội dung của div và gán vào cột mới
//                 const value = $(div).text().trim();
//                 rowData[columnName] = value;
//             });
//             data.push(rowData);
//         });
//         await browser.close();
//         return data;
//     } catch (error) {
//         console.error('Error while crawling data:', error);
//         throw error;
//     }
// }

async function crawlData() {
  try {
    // Sử dụng thư viện axios để tải nội dung HTML của trang web
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const conferenceData = [];

    // Trích xuất nội dung từ mỗi bảng có class "conference"
    $('.conference').each((index, element) => {
      const rowData = [];

      // Lấy nội dung của từng hàng trong bảng
      $(element).find('tr').each((index, row) => {
        let rowDataItem = {};
        // Trích xuất nội dung của mỗi ô trong hàng và thêm vào đối tượng rowDataItem
        $(row).find('td').each((index, cell) => {
          let columnName = $(cell).attr('class');
          let value = $(cell).html().trim();
          // Kiểm tra nếu là cột "Conference" thì trích xuất các thông tin
          if (columnName === 'confname') {
            const href = $(cell).find('a').attr('href');
            const title = $(cell).find('a').text().trim();
            const ten_hoi_nghi = $(cell).find('.tooltiptext').text().trim();
            rowDataItem['website'] = href;
            rowDataItem['title'] = title;
            rowDataItem['conference'] = ten_hoi_nghi;
          }
          else {
            // Nếu không phải cột "Conference" thì giữ nguyên nội dung
            rowDataItem[columnName] = value;
          }
        });
        // Thêm đối tượng rowDataItem vào mảng rowData
        rowData.push(rowDataItem);
      });

      // Thêm mảng rowData vào mảng conferenceData
      conferenceData.push(rowData);
    });

    // debug data
    console.log('Final Conference Data:', conferenceData);
    return conferenceData; // Trả về dữ liệu

  } catch (error) {
    console.log('Đã có lỗi khi tải trang web:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}


async function saveDataToDatabase(data) {
    const client = await pool.connect();
    let insertedCount = 0;
    try {
        await client.query('BEGIN');

        // Thêm dữ liệu vào bảng Conferences
        for (const group of data) {
            for (const conference of group) {
                 // Kiểm tra nếu có ít nhất một giá trị khác null trong conference object       
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
                      2 // Tham chiếu đến bảng Weblists, với id = 1
                  ];
                  await client.query(queryText, queryParams);
                  insertedCount++;
                }
              }
            }
        }

        await client.query('COMMIT');
        console.log('Dữ liệu đã được lưu vào cơ sở dữ liệu PostgreSQL thành công.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Đã có lỗi khi lưu dữ liệu vào cơ sở dữ liệu PostgreSQL:', error);
    } finally {
        client.release();
    }
    // return rowsInserted;
    console.log(`HAM SaveDB craw2 ----so hang them vao: ${insertedCount}`)
    return insertedCount;
}



// // // Gọi hàm crawlData để kiểm tra
// crawlData().then(data => {
//     // Bạn có thể thêm bất kỳ xử lý nào khác ở đây nếu cần
//     saveDataToDatabase(data); // Lưu dữ liệu vào cơ sở dữ liệu sau khi in ra console
// });

module.exports = {
    crawlData,
    saveDataToDatabase
};
