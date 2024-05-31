// DANG SU DUNG
// https://ccfddl.github.io/
// luu du lieu vao data2.js. CAN LUU VAO DB
// 
const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

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
        const columnName = `col_${idx}`;
        // Lấy nội dung của div và gán vào cột mới
        const value = $(div).text().trim();
        rowData[columnName] = value;
      });
      // Thêm đối tượng rowData vào mảng data
      data.push(rowData);
    });

    // Đóng trình duyệt Puppeteer
    await browser.close();

    // Lưu dữ liệu vào file data2.js dưới dạng JSON
    fs.writeFileSync('data1.js', JSON.stringify(data, null, 2), 'utf-8');
    console.log('Dữ liệu đã được lưu vào file data2.js');
  } catch (error) {
    console.error('Đã có lỗi khi thực hiện crawl:', error);
  }
}

crawlData();
