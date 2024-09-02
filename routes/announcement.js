const express = require('express');
const { check } = require('express-validator');

const announcementController = require('../controllers/announcement');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize-admin');

router.get('/', authenticateToken, announcementController.getAnnouncements);
router.get(
  '/:id',
  authenticateToken,
  announcementController.getAnnouncementById
);
router.post(
  '/',

  authenticateToken,
  authorizeAdmin,
  check('description').notEmpty().withMessage('description is required'),
  announcementController.addAnnouncement
);
router.patch(
  '/:id',
  authenticateToken,
  authorizeAdmin,
  check('description').notEmpty().withMessage('description is required'),
  announcementController.updateAnnouncement
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeAdmin,
  announcementController.deleteAnnouncement
);

module.exports = router;
