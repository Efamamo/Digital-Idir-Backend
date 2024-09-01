const News = require('../models/news');
const { validationResult } = require('express-validator');
const sendNotification = require('../cron/notification');

const getNews = async (req, res) => {
  try {
    const news = await News.find();
    res.json(news);
  } catch (e) {
    res.status(500).send(e);
  }
};

const getNewsById = async (req, res) => {
  const id = req.params.id;
  try {
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).send({ error: 'news not found' });
    }

    return res.json(news);
  } catch (e) {
    res.status(500).send(e);
  }
};

const addNews = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }

    return res.status(400).send({ errors: formattedErrors });
  }

  try {
    const { title, description } = req.body;
    const news = new News({
      title,
      description,
      imageUrl: req.file ? req.file.path : '',
    });

    const result = await news.save();

    sendNotification(news);
    return res.status(201).json(news);
  } catch (e) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
    res.status(500).send(e);
  }
};

const updateNews = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }
  const id = req.params.id;
  try {
    const news = await News.findById(id);
    if (!news) {
      return res.status(404).send({ error: 'news not found' });
    }
    const { title, description } = req.body;

    news.title = title;
    news.description = description;

    const n = await news.save();

    return res.json(n);
  } catch (e) {
    res.status(500).send(e);
  }
};

const deleteNews = async (req, res) => {
  const id = req.params.id;
  try {
    const news = await News.findByIdAndDelete(id);
    if (!news) {
      return res.status(404).send({ error: 'news not found' });
    }

    return res.status(204).json();
  } catch (e) {
    res.status(500).send(e);
  }
};

exports.addNews = addNews;
exports.getNews = getNews;
exports.getNewsById = getNewsById;
exports.updateNews = updateNews;
exports.deleteNews = deleteNews;
