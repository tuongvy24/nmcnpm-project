'use strict';
require('dotenv').config(); // Load biến môi trường từ tệp .env

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const flash = require('connect-flash');

const { createPagination } = require('express-handlebars-paginate');
const models = require('./models')

// cau hinh public static folder
app.use(express.static(__dirname + '/html'));


// cau hinh su dung express handlebar
app.engine('hbs', expressHandlebars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
         // bo sung de lay brand len view
        allowProtoPropertiesByDefault: true
    }, 
    helpers: {
        // createStarList,
        createPagination, 
        formatDate: (date) => {
            return date.toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric"
            });
        }
    }
}));

app.set('view engine', 'hbs');

//cau hinh doc du lieu post tu body. dung them comment... cho app.post
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// app.get('/', (req, res) => {
//   res.send('GET request to the homepage')
// })

//cau hinh su dung session cho gio hang
app.use(session({
  secret: process.env.SESSION_SECRET,
//   secret: process.env.SESSION_SECRET,
//   store: new redisStore({ client: redisClient }), //dung redis
  resave: false,
  saveUninitialized: false,
//   cookie: {
//     httpOnly: true,
//     maxAge: 20 * 60 * 1000 //thoi gian ton tai 20 phut
//   }
}));

//su dung connect-flash
app.use(flash());

app.get('/', (req, res) => {
    res.redirect('/home')
    // res.render('index');
});
app.use('/home', require('./routes/crawlersRouter'))
app.use('/weblists', require('./routes/blogsRouter'));
app.use("/users", require("./routes/userRouter"));


app.listen(port, () => console.log(`Example app listening on port http://localhost:${port}`))