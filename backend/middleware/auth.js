const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'my-super-secret-key-change-this-in-production';

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน', code: 'UNAUTHORIZED' });
  }

  const token = authHeader.split(' ')[1];
  
  if (!token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน', code: 'UNAUTHORIZED' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ', code: 'TOKEN_EXPIRED' });
  }
};