const express = require('express');
const cors = require('cors');
const app = express();

app.locals.pretty = true;

app.use(express.static('public'));
app.use(express.json()); 
app.use(express.urlencoded( {extended : false } )); 

const corsOptions = {
  origin: 'http://localhost:8080', // 허락하고자 하는 요청 주소
  credentials: true, // true로 하면 설정한 내용을 response 헤더에 추가 해줍니다.
};

app.use(cors(corsOptions));

module.exports = app;