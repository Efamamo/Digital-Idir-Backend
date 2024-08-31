const { validationResult } = require("express-validator");
const fs = require("fs");

const User = require("../models/user");
const passwordService = require("../services/password-service");

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });

    return res.status(400).send({ errors: formattedErrors });
  }
  const { username, email, password, phoneNumber } = req.body;

  try {
    const hashedPassword = await passwordService.hashPassword(password);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      imageUrl: req.file.path,
      phoneNumber,
    });
    const user = await newUser.save();
    return res.json(user);
  } catch (e) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
    res.status(500).send({ error: e });
  }
};

const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).send({ error: "username not found" });
  }

  const match = await passwordService.comparePasswords(password, user.password);
  if (!match) {
    return res.status(401).send({ error: "invalid credentials" });
  }

  res.send("signin successfully");
};

const logout = (req, res) => {
  res.send();
};

exports.login = login;
exports.signup = signup;
exports.logout = logout;
