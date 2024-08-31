require("dotenv").config()
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET; 

function generateToken(user) {
    
    const payload = {
        id: user._id,
        username: user.username
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '15m' });
    return token;
}

function generateRefreshToken(user){
    const payload = {
        id: user._id,
        username: user.username
    };
    const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET);
    return token

    
}




exports.generateToken = generateToken
exports.generateRefreshToken = generateRefreshToken