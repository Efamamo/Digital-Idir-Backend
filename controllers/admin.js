const Admin = require('../models/admin');
const { validationResult } = require('express-validator');
const { hashPassword } = require('../services/password-service');
const getAdmins = async (req, res) => {
  const admins = await Admin.find();
  res.json(admins);
};

const addAdmin = async (req, res) => {
  const { username, email, password, phoneNumber, roles } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  let admin = await Admin.findOne({ email });

  if (admin) {
    return res.status(409).json({ error: 'email is taken' });
  }

  admin = await Admin.findOne({ phoneNumber });

  if (admin) {
    return res.status(409).json({ error: 'phoneNumber is taken' });
  }

  const hashedPassword = await hashPassword(password);

  const newAdmin = new Admin({
    username,
    email,
    password: hashedPassword,
    phoneNumber,
    roles,
  });

  await newAdmin.save();

  res.json(newAdmin);
};
exports.addAdmin = addAdmin;
exports.getAdmins = getAdmins;
