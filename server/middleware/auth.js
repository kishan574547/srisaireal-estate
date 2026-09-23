const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  const jwtSecret = process.env.JWT_SECRET || 'srisai_real_estate_super_secret_key_2024';

  try {
    const decoded = jwt.verify(token, jwtSecret);
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Unauthorized: Invalid or expired token' });
  }
};

module.exports = authMiddleware;