const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma'); // ← เปลี่ยนตรงนี้!
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

  const { auth } = require('../middleware/auth');

// ดึงข้อมูลโปรไฟล์ของฉัน (รวมคอร์สที่กำลังเรียนและเรียนจบแล้ว)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้' });
    }

    const enrollmentRows = await prisma.$queryRawUnsafe(
      `SELECT e.id, e.user_id as userId, e.course_id as courseId, e.status, e.progress,
              e.is_reviewing as isReviewing, e.review_progress as reviewProgress, e.created_at as createdAt,
              c.id as c_id, c.title as c_title, c.description as c_description, c.instructor as c_instructor,
              c.thumbnail as c_thumbnail, c.price as c_price, c.duration as c_duration
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?
       ORDER BY e.created_at DESC`,
      req.user.id
    );

    const formattedEnrollments = enrollmentRows.map(row => ({
      id: row.id,
      userId: row.userId,
      courseId: row.courseId,
      status: row.status || 'in_progress',
      progress: row.progress || 0,
      isReviewing: Boolean(row.isReviewing),
      reviewProgress: row.reviewProgress || 0,
      createdAt: row.createdAt,
      course: {
        id: row.c_id,
        title: row.c_title,
        description: row.c_description,
        instructor: row.c_instructor,
        thumbnail: row.c_thumbnail,
        price: row.c_price,
        duration: row.c_duration,
      },
    }));

    const inProgressCourses = formattedEnrollments.filter(e => e.status !== 'completed');
    const completedCourses = formattedEnrollments.filter(e => e.status === 'completed');

    res.json({
      ...user,
      enrollments: formattedEnrollments,
      inProgressCourses,
      completedCourses,
      totalEnrollments: formattedEnrollments.length,
      inProgressCount: inProgressCourses.length,
      completedCount: completedCourses.length,
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลโปรไฟล์' });
  }
});

// อัปเดตข้อมูลส่วนตัว (เช่น ชื่อ)
router.put('/profile', auth, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อ' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: name.trim() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // สร้าง Token ใหม่พร้อมข้อมูลที่อัปเดต
    const token = jwt.sign(
      {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'อัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว',
      user: updatedUser,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถอัปเดตโปรไฟล์ได้' });
  }
});

// เปลี่ยนรหัสผ่าน
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'กรุณากรอกรหัสผ่านเดิมและรหัสผ่านใหม่' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' });
    }

    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedNewPassword },
    });

    res.json({ message: 'เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว' });
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถเปลี่ยนรหัสผ่านได้' });
  }
});

module.exports = router;