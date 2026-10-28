const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma'); // ← เปลี่ยนตรงนี้!
const { createNotification } = require('../lib/notificationService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// สมัครสมาชิก
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    // ส่งแจ้งเตือนต้อนรับสมาชิกใหม่
    await createNotification({
      userId: user.id,
      title: '🎉 ยินดีต้อนรับสู่ CrimsonAcademy!',
      message: `สวัสดีคุณ ${user.name}! เริ่มต้นการเรียนรู้และสำรวจคอร์สเรียนชั้นนำได้ทันที`,
      type: 'info',
      link: '/',
    });

    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name, 
      message: 'สมัครสมาชิกสำเร็จ!' 
    });
  } catch (error) {
    // Prisma Error Code P2002 = Unique constraint violated
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'อีเมลนี้มีผู้ใช้งานแล้ว' });
    }
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const isValid = bcrypt.compareSync(password, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;