const jwt = require('jsonwebtoken');

// Secret key for signing the token
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET;

// Middleware to validate the token
function authenticateToken(req, res, next) {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // If no token, return unauthorized

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.sendStatus(403); // If invalid token, return forbidden

    // Attach user to request object
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  });
}

module.exports = authenticateToken;
