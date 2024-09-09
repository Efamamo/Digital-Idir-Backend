const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
require('./services/passport-setup');
require('./cron/reminder');
require('./cron/return-item');
require('./cron/payment-notification');
const authRouter = require('./routes/auth');
const eventRouter = require('./routes/event');
const newsRouter = require('./routes/news');
const announcementRouter = require('./routes/announcement');
const memorialRouter = require('./routes/memorial');
const itemRouter = require('./routes/item');
const transactionRouter = require('./routes/transaction');

mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log('Connected To The DataBase');
  })
  .catch((e) => {
    console.log(e);
  });

const app = express();
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(
  cors({
    origin: 'http://localhost:5173', // The origin of your frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Allow cookies to be sent with the request
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/announcements', announcementRouter);
app.use('/api/v1/memorials', memorialRouter);
app.use('/api/v1/items', itemRouter);
app.use('/api/v1/transactions', transactionRouter);

app.listen(5000);
