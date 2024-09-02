const { validationResult } = require('express-validator');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const User = require('../models/user');
const Refresh = require('../models/refresh');
const passwordService = require('../services/password-service');
const jwtService = require('../services/jwt-service');
const sendVerification = require('../cron/verification');
const sendPasswordResetLink = require('../cron/reset-link');
const { use } = require('passport');

const signup = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }

    return res.status(400).send({ errors: formattedErrors });
  }
  const { username, email, password, phoneNumber } = req.body;

  try {
    u = await User.findOne({ email });

    if (u) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          console.log(err);
        });
      }

      return res.status(409).send({ error: `email ${email} is taken` });
    }

    const hashedPassword = await passwordService.hashPassword(password);
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      imageUrl: req.file ? req.file.path : '',
      phoneNumber,
      verificationToken: crypto.randomBytes(32).toString('hex'),
      tokenExpiration: Date.now() + 3600000,
    });

    sendVerification(newUser);

    const user = await newUser.save();
    return res.status(201).send({ message: 'verify your email' });
  } catch (e) {
    console.log(e);
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
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

  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).send({ error: 'invalid credentials' });
  }

  if (!user.password) {
    return res.status(400).send({ error: 'user can only login using google' });
  }

  if (!user.isVerified) {
    return res.status(400).send({ error: 'email not verified' });
  }

  const match = await passwordService.comparePasswords(password, user.password);
  if (!match) {
    return res.status(401).send({ error: 'invalid credentials' });
  }

  const token = jwtService.generateToken(user);
  const refreshToken = jwtService.generateRefreshToken(user);

  try {
    const newRefresh = new Refresh({
      token: refreshToken,
    });
    await newRefresh.save();
    res.status(201).send({ accessToken: token, refreshToken: refreshToken });
  } catch (e) {
    res.status(500).send(e);
  }
};

const refresh = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).send();
  }
  try {
    const t = await Refresh.findOne({ token });
    if (!t) {
      return res.status(403).send();
    }
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) return res.status(403).send();
      const accessToken = jwtService.generateToken(user);
      res.json({ accessToken: accessToken });
    });
  } catch (e) {
    res.status(500).send(e);
  }
};

const logout = async (req, res) => {
  const token = req.body.token;
  if (!token) {
    return res.status(401).send();
  }
  try {
    const t = await Refresh.findOneAndDelete({ token });
    if (!t) {
      return res.status(403).send();
    }
    res.status(204).send();
  } catch (e) {
    res.status(500).send(e);
  }
};

const googleCallback = (req, res) => {
  if (req.user) {
    const { user, accessToken, refreshToken } = req.user;

    if (accessToken && refreshToken) {
      res.json({
        accessToken,
        refreshToken,
      });
    } else {
      res.json(user);
    }
  } else {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const verifyToken = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      tokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.tokenExpiration = undefined;
    await user.save();

    res.send('Email successfully verified');
  } catch (error) {
    res.status(500).send('Internal server error');
  }
};

const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }

    return res.status(400).send({ errors: formattedErrors });
  }

  const { username, phoneNumber } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          console.log(err);
        });
      }

      return res
        .status(404)
        .send({ error: 'user with given userid not found' });
    }

    user.username = username;
    user.phoneNumber = phoneNumber;

    if (req.file) {
      user.imageUrl = req.file.path;
    }

    await user.save();
    return res.status(204).send();
  } catch (e) {
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        console.log(err);
      });
    }
    res.status(500).send({ error: e });
  }
};

const changePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }

  const { oldPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    const match = await passwordService.comparePasswords(
      oldPassword,
      user.password
    );
    if (!match) {
      return res.status(401).send({ error: 'old Password is incorrect' });
    }

    const hashedPassword = await passwordService.hashPassword(newPassword);

    user.password = hashedPassword;
    await user.save();

    return res.status(204).send();
  } catch (e) {
    res.status(500).send({ error: e });
  }
};

const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).send('User not found');
  }

  // Generate a token
  const token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now

  await user.save();

  await sendPasswordResetLink(token, user);

  res.send('Password reset email sent');
};

const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = {};
    errors.array().forEach((error) => {
      formattedErrors[error.path] = error.msg;
    });

    return res.status(400).send({ errors: formattedErrors });
  }
  const token = req.query.token;
  const { newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).send('Invalid or expired token');
  }

  // Hash the new password and save it
  user.password = await passwordService.hashPassword(newPassword);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();

  res.send('Password has been reset');
};

exports.login = login;
exports.signup = signup;
exports.logout = logout;
exports.refresh = refresh;
exports.googleCallback = googleCallback;
exports.verifyToken = verifyToken;
exports.updateProfile = updateProfile;
exports.changePassword = changePassword;
exports.forgotPassword = forgotPassword;
exports.resetPassword = resetPassword;
