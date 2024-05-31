const axios = require('axios');
const cheerio = require('cheerio');
const { Pool } = require('pg');

// Cấu hình kết nối cơ sở dữ liệu PostgreSQL
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

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
// Biến toàn cục để lưu trữ số hàng đã được chèn vào cơ sở dữ liệu
// let insertedCount = 0;
// URL của trang web để crawl dữ liệu
const url = 'https://www.computer.org/conferences/top-computer-science-events';

// Hàm để crawl dữ liệu từ trang web
async function crawlData() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const conferences = [];

        // Lặp qua các phần tử <h3>
        $('h3').each((index, element) => {
            // Lấy tiêu đề từ phần tử <h3> hiện tại
            const titleAndConference = $(element).text().trim();

            // Lấy giá trị href từ thẻ a
            const website = $(element).find('a').attr('href');

            // Tìm vị trí của dấu ngoặc kép "(" và ")"
            const startIndex = titleAndConference.indexOf('(');
            const endIndex = titleAndConference.lastIndexOf(')');

            // Kiểm tra xem có đủ cặp dấu ngoặc kép hay không
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                // Tách chuỗi thành title và conference
                const conference = titleAndConference.slice(0, startIndex).trim();
                const title = titleAndConference.slice(startIndex + 1, endIndex).trim();

                // Lấy phần nội dung từ details_1
                const details_1 = $(element).next('p').text().trim();

                // Tìm vị trí của dấu "/"
                const slashIndex = details_1.indexOf('/');
                if (slashIndex !== -1) {
                    // Tách chuỗi thành date và location
                    const date = details_1.slice(0, slashIndex).trim();
                    const location = details_1.slice(slashIndex + 1).trim();
                    
                    // Lấy hai phần tử <p> kế tiếp của phần tử <h3> hiện tại
                    const remark = $(element).nextAll('p').eq(1).text().trim();

                    // Tạo một đối tượng conference từ thông tin đã trích xuất
                    const conferenceObject = { title, conference, date, location, remark, website };

                    // Thêm conference vào mảng conferences
                    conferences.push(conferenceObject);
                }
            }
        });

        // // In ra thông tin các hội nghị đã trích xuất
        // conferences.forEach((conference, index) => {
        //     console.log(`Conference ${index + 1}:`);
        //     console.log('Title:', conference.title);
        //     console.log('Conference:', conference.conference);
        //     console.log('Date:', conference.date);
        //     console.log('Location:', conference.location);
        //     console.log('Details_2:', conference.remark);
        //     console.log('Website:', conference.website);
        //     console.log('-----------------------------------');
        // });
       
        return conferences;
    } catch (error) {
        console.error('Error during scraping:', error);
        return [];
    }
}

// Hàm để lưu dữ liệu vào cơ sở dữ liệu
async function saveDataToDatabase(data) {
    const client = await pool.connect(); 
    let insertedCount = 0;
    try {
        await client.query('BEGIN');

        // Thêm dữ liệu vào bảng Conferences
        for (const conference of data) {
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
                    const insertQuery = `
                        INSERT INTO Conferences (website, title, conference, location, now_deadline, date, running_date, starting_date, ending_date, notification, subformat, weblist_id)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    `;
                    const insertParams = [
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
                        3 // Tham chiếu đến bảng Weblists, với id = 3
                    ];
                    await client.query(insertQuery, insertParams);
                    insertedCount++;
                }
            }
        }

        await client.query('COMMIT');
        console.log('HAM GOC SAVEDB --Dữ liệu 3 đã được lưu vào cơ sở dữ liệu PostgreSQL thành công.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Đã có lỗi khi lưu dữ liệu vào cơ sở dữ liệu PostgreSQL:', error);
    } finally {
        client.release();
    }

    // return rowsInserted;
    console.log(`HAM SaveDB ----so hang them vao: ${insertedCount}`)
    return insertedCount;
}

// // Gọi hàm crawlData
// crawlData().catch(error => {
//     console.error('Error while processing data:', error);
// });


module.exports = {
    crawlData,
    saveDataToDatabase, 
    // get insertedCount() {
    //     return insertedCount;
    // }
};

