require('dotenv').config();
const { DEVURL, PORT } = process.env;
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(cookieParser());

app.use('/', require('./Routes/index'));
app.use('/post', require('./Routes/post'));
app.use('/comment', require('./Routes/comment'));
app.use('/member', require('./Routes/member'));

app.listen(PORT, (err) => {
  if (err) return console.log(err);
  console.log('서버가 구동되었습니다.');
  console.log(DEVURL);
});
