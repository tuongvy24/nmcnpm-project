

const fs = require('fs');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

// Hàm trích xuất thông tin từ cột a
function extractColumnA(data) {
  const $ = cheerio.load(data);

  // const title = $('.conf-title').text().trim();
  // const address = $('.el-row').text().trim(); //lay dia chi ra
  // const tag = $('.el-tag').text().trim(); // lay tag ra
  // const description = $('.conf-des').text().trim();
  // const additionalInfo = $('.conf-sub').text().trim();
  // return { title, address, tag, description, additionalInfo };

  const otherInfo = {};
  $('.el-row').each((index, element) => {
    otherInfo[`colA_${index}`] = $(element).text().trim();
  });
  return { ...otherInfo }
}

// Hàm trích xuất thông tin từ cột b
function extractColumnB(data) {
  const $ = cheerio.load(data);
  // const timer = $('.conf-timer').text().trim();
  
  // Lấy tất cả các phần tử div có class là "el-row"
    const otherInfo = {};
    $('.el-row').each((index, element) => {
        // Lấy nội dung của từng phần tử và gán vào cột tương ứng với index
        otherInfo[`colB_${index}`] = $(element).text().trim();
    });

    return { ...otherInfo };
}


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
      // Trích xuất thông tin từ cột a và b
      const columnAInfo = extractColumnA($(row).find('.el-table_1_column_1 .cell').html());
      const columnBInfo = extractColumnB($(row).find('.el-table_1_column_2 .cell').html());

      

      // Gộp thông tin từ cột a và b vào một đối tượng rowData
      Object.assign(rowData, columnAInfo, columnBInfo);

      // Thêm đối tượng rowData vào mảng data
      data.push(rowData);
    });

    // Đóng trình duyệt Puppeteer
    await browser.close();

    // Lưu dữ liệu vào file data2.js dưới dạng JSON
    fs.writeFileSync('data2.js', JSON.stringify(data, null, 2), 'utf-8');
    console.log('Dữ liệu đã được lưu vào file data2.js');
  } catch (error) {
    console.error('Đã có lỗi khi thực hiện crawl:', error);
  }
}

crawlData();
