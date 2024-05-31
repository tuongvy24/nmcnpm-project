const axios = require('axios');
const cheerio = require('cheerio');

async function printHTML(url) {
    try {
        // Sử dụng thư viện axios để tải nội dung HTML của trang web
        const response = await axios.get(url);

        // Load HTML vào Cheerio
        const $ = cheerio.load(response.data);

        // In HTML trả về
        console.log('HTML trả về từ trang web:', $.html());
    } catch (error) {
        console.error('Đã có lỗi khi tải trang web:', error);
    }
}

const url = 'https://www.computer.org/conferences/top-computer-science-events';
printHTML(url);
