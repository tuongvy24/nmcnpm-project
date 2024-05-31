// nay phat sinh loi icon not found

let models = require('./models'); //luu y ../models do models nam o ngoai
models.sequelize.sync().then(() => {
    // res.send('table created roi nhe!!!');
    console.log('tao bang thanh cong');
})
