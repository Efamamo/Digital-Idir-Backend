const express = require('express');
const Permission = require('../models/permission');

const router = express.Router();
const authenticateToken = require('../middlewares/authenticate');

router.get('/', authenticateToken, async (req, res) => {
  const permissions = await Permission.find();
  res.json(permissions);
});

module.exports = router;
