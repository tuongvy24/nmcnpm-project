'use strict';
require('dotenv').config(); // Load biến môi trường từ tệp .env

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const expressHandlebars = require('express-handlebars');
const session = require('express-session');

const { createPagination } = require('express-handlebars-paginate');
const models = require('./models')

// cronJbos de lay du lieu dinh ky
const { crawlResultsUpdated } = require('./controllers/cronJobs'); // Import the cron jobs
// socket.io de cap nhat du lieu realtime
  
 

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);

// khai bao passport
const passport = require('./controllers/passport');
const flash = require('connect-flash');

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

// Make io accessible globally
global.io = io;
// Khi một client kết nối
io.on('connection', (socket) => {
    console.log('A user connected');
    // 
    // Lắng nghe sự kiện 'message' từ client
    socket.on('message', (message) => {
      console.log('Received message: ' + message);
      message = message + '. gui tu server nhe'
      // 
      // Gửi lại tin nhắn tới tất cả client crawlResultsUpdated
      
      io.emit('message', message);
    });
    io.emit('crawlResultsUpdated', crawlResultsUpdated);

    
   
  
    // Khi một client ngắt kết nối
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
});

//cau hinh doc du lieu post tu body. dung them comment... cho app.post
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//cau hinh su dung session cho gio hang
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
}));


//cau hinh su dung passport
app.use(passport.initialize());
app.use(passport.session());

//su dung connect-flash
app.use(flash());

app.use((req, res, next) => {    
    // nguoi dung da dang nhap chua 
    res.locals.isLoggedIn = req.isAuthenticated();  
    next();
});
  
app.get('/', (req, res) => {
    res.redirect('/home')   
});

app.use('/home', require('./routes/crawlersRouter'))
app.use('/weblists', require('./routes/websRouter')); //ds hoi nghi
app.use("/users", require("./routes/authRouter")); // xac thuc nguoi dung truoc
app.use("/users", require("./routes/userRouter")); // them xoa sua thong tin user


server.listen(port, () => console.log(`Example app listening on port http://localhost:${port}`))

