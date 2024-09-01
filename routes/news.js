const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middlewares/file-upload');

const newsController = require('../controllers/news');
const router = express.Router();

router.get('/', newsController.getNews);
router.get('/:id', newsController.getNewsById);
router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').notEmpty().withMessage('title is required'),
    check('title').isLength(10).withMessage('minimum title length is 10'),
    check('description').notEmpty().withMessage('description is required'),
    check('description')
      .isLength(10)
      .withMessage('minimum description length is 30'),
  ],
  newsController.addNews
);
router.patch(
  '/:id',
  [
    check('title').notEmpty().withMessage('title is required'),
    check('title').isLength(10).withMessage('minimum title length is 10'),
    check('description').notEmpty().withMessage('description is required'),
    check('description')
      .isLength(10)
      .withMessage('minimum description length is 30'),
  ],
  newsController.updateNews
);
router.delete('/:id', newsController.deleteNews);

module.exports = router;
