const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.computer.org/conferences/top-computer-science-events';

async function crawlData() {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const conferences = [];

        // Lặp qua các phần tử <h3>
        $('h3').each((index, element) => {
            // Lấy tiêu đề từ phần tử <h3> hiện tại
            const title = $(element).text().trim();

            // Lấy hai phần tử <p> kế tiếp của phần tử <h3> hiện tại
            const details_1 = $(element).next('p').text().trim();
            const details_2 = $(element).nextAll('p').eq(1).text().trim();

            // Kiểm tra xem details_1 và details_2 có rỗng không
            if (details_1 && details_2) {
                // Tạo một đối tượng conference từ thông tin đã trích xuất
                const conference = { title, details_1, details_2 };

                // Thêm conference vào mảng conferences
                conferences.push(conference);
            }
        });

        // In ra thông tin các hội nghị đã trích xuất
        conferences.forEach((conference, index) => {
            console.log(`Conference ${index + 1}:`);
            console.log('Title:', conference.title);
            console.log('Details_1:', conference.details_1);
            console.log('Details_2:', conference.details_2);
            console.log('-----------------------------------');
        });

        return conferences;
    } catch (error) {
        console.error('Error during scraping:', error);
        return [];
    }
}

crawlData();
