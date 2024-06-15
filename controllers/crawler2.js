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


async function crawlData() {
  try {
    // Sử dụng thư viện axios để tải nội dung HTML của trang web
    // const response = await axios.get(url);
    const response = await axios.get(url, {
        timeout: 50000, // Timeout 50 giây
        headers: {
            'User-Agent': 'Your User Agent' // Thêm user-agent để giả mạo là trình duyệt khi gửi yêu cầu
        }
    });
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
    
    console.log('Craler2: Final Conference Data:');
    console.log('Craler2: Final Conference Data:');
    console.log('Craler2: Final Conference Data:', conferenceData);
    return conferenceData; // Trả về dữ liệu

  } catch (error) {
    // console.log('Đã có lỗi khi tải trang web:', error);
    // return []; // Trả về mảng rỗng nếu có lỗi
    if (axios.isAxiosError(error)) {
        if (error.code === 'ETIMEDOUT') {
            console.error('Timeout khi kết nối đến server.');
        } else {
            console.error('Lỗi kết nối:', error.message);
        }
    } else {
        console.error('Lỗi khác:', error.message);
    }
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
