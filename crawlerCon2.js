// DANG SU DUNG// 
// https://www.lix.polytechnique.fr/~hermann/conf.php
// da luu du lieu crawler duoc vao database
// 

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



// // Gọi hàm crawlData và ghi dữ liệu vào file "data.js"
// crawlData()
//   .then(data => {
//     // Hiển thị dữ liệu dạng JSON
//     // console.log(JSON.stringify(data, null, 2));

//     // Ghi dữ liệu vào file "data.js"
//     const jsonData = JSON.stringify(data, null, 2);
//     fs.writeFileSync('data.js', `module.exports = ${jsonData};`, 'utf8');

//     console.log('Dữ liệu đã được lưu vào file "data.js" thành công.');
//   });


// Gọi hàm crawlData và ghi dữ liệu vào các file tương ứng
crawlData()
  .then(data => {
    // Duyệt qua từng nhóm dữ liệu và ghi vào các file
    data.forEach((group, index) => {
      const jsonData = JSON.stringify(group, null, 2);
      fs.writeFileSync(`data2_${index}.js`, `module.exports = ${jsonData};`, 'utf8');
      console.log(`Dữ liệu của nhóm ${index} đã được lưu vào file "data2_${index}.js" thành công.`);
    });
  });
