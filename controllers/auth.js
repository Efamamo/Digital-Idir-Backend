const { validationResult } = require("express-validator");
const fs = require("fs");
const jwt = require('jsonwebtoken')

const User = require("../models/user");
const Refresh = require("../models/refresh")
const passwordService = require("../services/password-service");
const jwtService = require("../services/jwt-service");

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
    return res.status(201).json(user);
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
    return res.status(401).send({ error: "invalid credentials" });
  }

  const match = await passwordService.comparePasswords(password, user.password);
  if (!match) {
    return res.status(401).send({ error: "invalid credentials" });
  }

  const token = jwtService.generateToken(user);
  const refreshToken = jwtService.generateRefreshToken(user)

  try{
    const newRefresh = new Refresh({
        token: refreshToken
    })
    await newRefresh.save()
    res.status(201).send({accessToken: token, refreshToken: refreshToken})

  }catch(e){
    res.status(500).send(e)
  }
  
};

const refresh = async (req, res) => {
    const token = req.body.token;
    if (!token){
        return res.status(401).send()
    }
    try{
        const t = await Refresh.findOne({token})
        if (!t){
            return res.status(403).send()
        }
        jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
            if (err) return res.status(403).send()
            const accessToken = jwtService.generateToken(user)
        res.json({accessToken: accessToken})
        })

    }catch(e){
        res.status(500).send(e)
    }
}

const logout = async (req, res) => {
    const token = req.body.token;
    if (!token){
        return res.status(401).send()
    }
    try{
        const t = await Refresh.findOneAndDelete({token})
        if (!t){
            return res.status(403).send()
        }
        res.status(204).send()

    }catch(e){
        res.status(500).send(e)
    }
};

exports.login = login;
exports.signup = signup;
exports.logout = logout;
exports.refresh = refresh
