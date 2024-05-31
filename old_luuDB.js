// 
// https://www.lix.polytechnique.fr/~hermann/conf.php
// da luu du lieu crawler duoc vao database
// 

const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// URL của trang web cần crawl
const url = 'https://www.lix.polytechnique.fr/~hermann/conf.php';
// const url = 'https://ccfddl.github.io/'
const { Pool } = require('pg');

// Hàm để crawl dữ liệu từ trang web
async function crawlData() {
  try {
    // Sử dụng thư viện axios để tải nội dung HTML của trang web
    const response = await axios.get(url);

    // Load HTML vào Cheerio
    const $ = cheerio.load(response.data);

    // Mảng chứa tên của các cột
    let columnNames = [];

    // Trích xuất tên của các cột từ thẻ <th> trong bảng
    $('.conference th').each((index, element) => {
      columnNames.push($(element).text().trim()); // Thêm tên cột vào mảng
    });

    // Đối tượng JSON để lưu trữ dữ liệu
    let conferenceData = [];

    // Trích xuất nội dung của bảng có class "conference"
    $('.conference').each((index, element) => {
      // Lấy nội dung của từng hàng trong bảng
      $(element).find('tr').each((index, row) => {
        let rowData = {};
        // Trích xuất nội dung của mỗi ô trong hàng và thêm vào đối tượng rowData
        $(row).find('td').each((index, cell) => {
          // Sử dụng tên cột tương ứng làm key
          let columnName = columnNames[index];
          let value = $(cell).text().trim();
          rowData[columnName] = value;
        });
        // Thêm đối tượng rowData vào mảng conferenceData
        conferenceData.push(rowData);
      });
    });

    return conferenceData; // Trả về dữ liệu

  } catch (error) {
    console.log('Đã có lỗi khi tải trang web:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}


// Thông tin kết nối đến cơ sở dữ liệu PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'CrawlerConDB',
    password: 'PhucTony',
    port: 5432,
});

async function saveDataToDatabase(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        for (const conference of data) {
            const queryText = `
                INSERT INTO Conferences (conference_name, city_country, deadline, date, notification, submission_format_comments)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            const queryParams = [
                conference.Conference,
                conference['City, Country'],
                conference.Deadline,
                conference.Date,
                conference.Notification,
                conference['Submission format and comments'],
            ];
            await client.query(queryText, queryParams);
        }

        await client.query('COMMIT');
        console.log('Dữ liệu đã được lưu vào cơ sở dữ liệu PostgreSQL thành công---->');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Đã có lỗi khi lưu dữ liệu vào cơ sở dữ liệu PostgreSQL:', error);
    } finally {
        client.release();
    }
}

crawlData()
    .then(data => {
        saveDataToDatabase(data);
    });
