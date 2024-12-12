const express = require('express');
const { check } = require('express-validator');
const authenticateToken = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize-admin');

const eventController = require('../controllers/event');
const router = express.Router();

router.get('/', authenticateToken, eventController.getEvents);
router.get('/:id', authenticateToken, eventController.getEventById);
router.post(
  '/',
  authenticateToken,
  authorizeAdmin,
  [
    check('title').notEmpty().withMessage('title is required'),
    check('title').isLength(10).withMessage('minimum title length is 10'),
    check('description').notEmpty().withMessage('description is required'),
    check('description')
      .isLength(10)
      .withMessage('minimum description length is 30'),
    check('location').notEmpty().withMessage('location is required'),
    check('startTime').notEmpty().withMessage('startTime is required'),
    check('startTime')
      .notEmpty()
      .withMessage('startTime is required')
      .isISO8601()
      .withMessage('startTime is invalid format'),
    check('endTime')
      .notEmpty()
      .withMessage('endTime is required')
      .isISO8601()
      .withMessage('endTime is invalid format'),
    check('endTime').notEmpty().withMessage('endTime is required'),
  ],

  eventController.addEvent
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
    check('location').notEmpty().withMessage('location is required'),
    check('date').notEmpty().withMessage('date is required'),
    check('date').isDate().withMessage('date is invalid format'),
  ],
  eventController.updateEvent
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeAdmin,
  eventController.deleteEvent
);

module.exports = router;
