const express = require('express');
const Role = require('../models/role');
const { check, validationResult } = require('express-validator');

const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');

router.get('/', authenticateToken, async (req, res) => {
  const roles = await Role.find();
  res.json(roles);
});

router.post(
  '/',
  authenticateToken,
  [
    check('role_name').notEmpty().withMessage('role_name is required'),
    check('permissions').notEmpty().withMessage('permissions is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = {};
      errors.array().forEach((error) => {
        formattedErrors[error.path] = error.msg;
      });

      return res.status(400).send({ errors: formattedErrors });
    }

    const { role_name, permissions, description } = req.body;
    const role = await Role.findOne({ role_name });
    if (role) {
      return res
        .status(409)
        .json({ errors: [{ role_name: 'role_namealready exists' }] });
    }

    const newRole = new Role({
      role_name,
      permissions,
      description,
    });

    await newRole.save();
    res.json(newRole);
  }
);

module.exports = router;
