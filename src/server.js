import express from 'express';
import bodyParser from 'body-parser';//thư viện này giúp ta lấy được các tham số từ client sử dụng cho chúng ta
import viewEngine from './config/viewEngine';
import initWebRouters from './route/web';
import cors from 'cors';
const path = require('path');

require('dotenv').config(); //giúp ta chạy được lệnh process.env.'thamso';

import connectDB from './config/connectDB'
let app = express();
app.use(cors({ credentials: true, origin: true }));

app.use(express.static(path.join(__dirname + '/public')));


//config app

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

viewEngine(app);
initWebRouters(app);

connectDB();
let port = process.env.PORT || 6969
//if PORT = undefined thì port = 6969

//để app chạy thì phải dùng lệnh app.listen
app.listen(port, () =>{
    //calback 
    console.log("backend is running with port " + port)
});