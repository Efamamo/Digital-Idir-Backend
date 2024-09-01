const express = require('express');
const { check } = require('express-validator');

const memorialController = require('../controllers/memorial');
const router = express.Router();

router.get('/', memorialController.getMemorials);
router.get('/:id', memorialController.getMemorialById);
router.post(
  '/',
  [
    check('name').notEmpty().withMessage('name is required'),
    check('dateOfBirth').isDate().withMessage('dateOfBirth is invalid'),
    check('dateOfPassing').isDate().withMessage('dateOfPassing is invalid'),
  ],
  memorialController.addMemorial
);
router.patch(
  '/:id',
  [
    check('name').notEmpty().withMessage('name is required'),
    check('dateOfBirth').isDate().withMessage('dateOfBirth is invalid'),
    check('dateOfPassing').isDate().withMessage('dateOfPassing is invalid'),
  ],
  memorialController.updateMemorial
);
router.delete('/:id', memorialController.deleteMemorial);

module.exports = router;
