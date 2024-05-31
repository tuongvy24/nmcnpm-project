const { Pool } = require('pg');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// URL của trang web cần crawl
const url = 'https://www.lix.polytechnique.fr/~hermann/conf.php';

// Hàm để crawl dữ liệu từ trang web
async function crawlData() {
  try {
    // Sử dụng thư viện axios để tải nội dung HTML của trang web
    const response = await axios.get(url);

    // Load HTML vào Cheerio
    const $ = cheerio.load(response.data);

    // Mảng để lưu trữ các nhóm dữ liệu
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

    return conferenceData; // Trả về dữ liệu

  } catch (error) {
    console.log('Đã có lỗi khi tải trang web:', error);
    return []; // Trả về mảng rỗng nếu có lỗi
  }
}

// Thêm dữ liệu vào hai bảng Weblists và Conferences
async function saveDataToDatabase(data) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Thêm dữ liệu vào bảng Weblists
        const weblistQueryText = `
            INSERT INTO Weblists (id, web_name)
            VALUES ($1, $2)
        `;
        const weblistQueryParams = [1, 'https://www.lix.polytechnique.fr/~hermann/conf.php'];
        await client.query(weblistQueryText, weblistQueryParams);

        // Thêm dữ liệu vào bảng Conferences
        for (const group of data) {
            for (const conference of group) {
                const queryText = `
                    INSERT INTO Conferences (website, title, conference, location, now_deadline, date, notification, subformat, weblist_id)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                `;
                const queryParams = [
                    conference.website,
                    conference.title,
                    conference.conference,
                    conference.location,
                    conference['deadline'] || conference['now-deadline'],
                    conference.date,
                    conference.notification,
                    conference.subformat,
                    1 // Tham chiếu đến bảng Weblists, với id = 1
                ];
                await client.query(queryText, queryParams);
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
}

// Thông tin kết nối đến cơ sở dữ liệu PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'CrawlerConDB',
    password: 'PhucTony',
    port: 5432,
});

// Gọi hàm crawlData và ghi dữ liệu vào cơ sở dữ liệu
crawlData()
  .then(data => {
    saveDataToDatabase(data);
  });
