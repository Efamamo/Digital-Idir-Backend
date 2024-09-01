const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const path = require('path');
require('./services/passport-setup');
require('./cron/reminder');
const authRouter = require('./routes/auth');
const eventRouter = require('./routes/event');
const newsRouter = require('./routes/news');
const announcementRouter = require('./routes/announcement');

mongoose
  .connect('mongodb://localhost:27017/digital-idir')
  .then(() => {
    console.log('Connected To The DataBase');
  })
  .catch((e) => {
    console.log(e);
  });

const app = express();
app.use('/uploads/images', express.static(path.join('uploads', 'images')));
app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/events', eventRouter);
app.use('/api/v1/news', newsRouter);
app.use('/api/v1/announcements', announcementRouter);

app.listen(5000);
