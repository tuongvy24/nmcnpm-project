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

const url = 'https://www.computer.org/conferences/top-computer-science-events';

// ham crawle du lieu
async function crawlData() {
    try {
        const response = await axios.get(url); // gui url toi may chu web ko qua trinh duyet
        const $ = cheerio.load(response.data);

        const conferences = [];

        // lap qua phan tu  <h3>
        $('h3').each((index, element) => {
            const titleAndConference = $(element).text().trim();

            // website tu the a
            const website = $(element).find('a').attr('href');

            // tim dau ngoac "(" và ")"
            const startIndex = titleAndConference.indexOf('(');
            const endIndex = titleAndConference.lastIndexOf(')');

            // ko co ngoac ko title ko chon lay
            if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
                // title trong dau ngoac, conference con lai
                const conference = titleAndConference.slice(0, startIndex).trim();
                const title = titleAndConference.slice(startIndex + 1, endIndex).trim();
                
                const details_1 = $(element).next('p').text().trim();

                // tim "/"
                const slashIndex = details_1.indexOf('/');
                if (slashIndex !== -1) {
                    // lay date và location
                    const date = details_1.slice(0, slashIndex).trim();
                    const location = details_1.slice(slashIndex + 1).trim();
                    
                    // tim <p> thu 2 sau <h3> 
                    const remark = $(element).nextAll('p').eq(1).text().trim();

                    const conferenceObject = { title, conference, date, location, remark, website };

                    // them con vao mang conferences
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

        // console.log('Craler3: Final Conference Data:');
        // console.log('Craler3: Final Conference Data:');
        // console.log('Craler3: Final Conference Data:', conferences);
       
        return conferences;
    } catch (error) {
        console.error('Error during scraping:', error);
        return [];
    }
}

// luu vao database
async function saveDataToDatabase(data) {
    const client = await pool.connect(); 
    let insertedCount = 0;
    try {
        await client.query('BEGIN');
        
        for (const conference of data) {
            // kiem tra conference co it nhat 1 gia tri khac null va web title conference phai co gia tri
            // khi do thanh true --> cho dien vao db
            const hasNonNullValues = Object.values(conference).some(value => value !== null) && conference.website && conference.title && conference.conference;

            if (hasNonNullValues) {
                // kiem 1 conference voi web, title, conference co trong db chua?
                // kiem su ton tai, ko phai lay het
                const checkExistenceQuery = `
                    SELECT 1 FROM Conferences
                    WHERE website = $1 AND title = $2 AND conference = $3
                `;
                const checkExistenceParams = [conference.website, conference.title, conference.conference];
                const result = await client.query(checkExistenceQuery, checkExistenceParams);

                if (result.rowCount === 0) { //neu ko ton tai
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

