const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.ACCESS_TOKEN_SECRET; // Your secret key for signing the token

// Middleware to check if the user is an admin
function authorizeAdmin(req, res, next) {
  // Retrieve token from headers (Assuming it's sent as a Bearer token)
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: 'Access denied. No token provided.' });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, SECRET_KEY);

    // Check if the user is an admin
    if (decoded.isAdmin) {
      // Attach user info to request object if needed
      req.user = decoded;
      next(); // Proceed to the next middleware or route handler
    } else {
      res.status(403).json({ message: 'Access denied. You are not an admin.' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = authorizeAdmin;
