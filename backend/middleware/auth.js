const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware: ตรวจสอบว่า Login แล้วหรือยัง (ใช้ได้ทุก role)
const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token ไม่ถูกต้องหรือหมดอายุ' });
  }
};

// Middleware: ตรวจสอบ Role — ใช้หลัง auth เสมอ
// ตัวอย่างการใช้: router.post('/', auth, requireRole('admin'), handler)
// รองรับหลาย role: requireRole('admin', 'instructor')
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบก่อน' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `สิทธิ์ไม่เพียงพอ — ต้องเป็น ${allowedRoles.join(' หรือ ')} เท่านั้น`,
      });
    }

    next();
  };
};

module.exports = { auth, requireRole };