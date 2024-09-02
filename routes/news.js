const express = require('express');
const { check } = require('express-validator');
const fileUpload = require('../middlewares/file-upload');
const authenticateToken = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize-admin');

const newsController = require('../controllers/news');
const router = express.Router();

router.get('/', authenticateToken, newsController.getNews);
router.get('/:id', authenticateToken, newsController.getNewsById);
router.post(
  '/',
  authenticateToken,
  authorizeAdmin,
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

  authenticateToken,
  authorizeAdmin,
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
router.delete(
  '/:id',
  authorizeAdmin,
  authenticateToken,
  newsController.deleteNews
);

module.exports = router;
