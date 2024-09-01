const express = require('express');
const { check } = require('express-validator');

const announcementController = require('../controllers/announcement');
const router = express.Router();

router.get('/', announcementController.getAnnouncements);
router.get('/:id', announcementController.getAnnouncementById);
router.post(
  '/',
  check('description').notEmpty().withMessage('description is required'),
  announcementController.addAnnouncement
);
router.patch(
  '/:id',
  check('description').notEmpty().withMessage('description is required'),
  announcementController.updateAnnouncement
);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
