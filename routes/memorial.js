const express = require('express');
const { check } = require('express-validator');
const authenticateToken = require('../middlewares/authenticate');
const authorizeAdmin = require('../middlewares/authorize-admin');
const memorialController = require('../controllers/memorial');
const fileUpload = require('../middlewares/file-upload');
const router = express.Router();

router.get('/', authenticateToken, memorialController.getMemorials);
router.get('/:id', authenticateToken, memorialController.getMemorialById);
router.post(
  '/',
  authenticateToken,
  authorizeAdmin,
  fileUpload.single('image'),

  [
    check('name').notEmpty().withMessage('name is required'),
    check('dateOfBirth').isDate().withMessage('dateOfBirth is invalid'),
    check('dateOfPassing').isDate().withMessage('dateOfPassing is invalid'),
  ],
  memorialController.addMemorial
);
router.patch(
  '/:id',

  authenticateToken,
  authorizeAdmin,
  fileUpload.single('image'),

  [
    check('name').notEmpty().withMessage('name is required'),
    check('dateOfBirth').isDate().withMessage('dateOfBirth is invalid'),
    check('dateOfPassing').isDate().withMessage('dateOfPassing is invalid'),
  ],
  memorialController.updateMemorial
);
router.delete(
  '/:id',
  authenticateToken,
  authorizeAdmin,
  memorialController.deleteMemorial
);

module.exports = router;
