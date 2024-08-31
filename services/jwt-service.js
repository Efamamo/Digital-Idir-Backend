const jwt = require('jsonwebtoken');

const SECRET_KEY = 'wsdfgnj,.okjhbvcxxdfghjkl,hjg'; 

function generateToken(user) {
    
    const payload = {
        id: user._id,
        username: user.username
    };

    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
    return token;
}


exports.generateToken = generateToken