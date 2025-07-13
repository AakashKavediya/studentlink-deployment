// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateUser = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret_here');
    req.user = decoded; // userId is available now
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = authenticateUser;
