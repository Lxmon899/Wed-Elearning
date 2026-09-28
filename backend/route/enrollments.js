const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// POST /api/enrollments - ลงทะเบียนเรียน
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id; // ได้จาก Token ที่ auth middleware แปลให้

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId: parseInt(courseId),
      },
    });

    res.json({ message: 'ลงทะเบียนสำเร็จ!', enrollment });
  } catch (error) {
    // Prisma Error P2002 = ฝ่าฝืน Unique Constraint (ลงซ้ำ)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'คุณได้ลงทะเบียนคอร์สนี้แล้ว' });
    }
    // Prisma Error P2003 = Foreign Key ไม่มี (ไม่มีคอร์สนี้)
    if (error.code === 'P2003') {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }
    res.status(500).json({ error: 'ลงทะเบียนไม่สำเร็จ' });
  }
});

// ==========================================
// DELETE /api/enrollments/:courseId - ยกเลิกลงทะเบียน
// ==========================================
router.delete('/:courseId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);

    await prisma.enrollment.deleteMany({
      where: {
        userId,
        courseId,
      },
    });

    res.json({ message: 'ยกเลิกลงทะเบียนสำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: 'ยกเลิกไม่สำเร็จ' });
  }
});

// ==========================================
// GET /api/enrollments/my-courses - คอร์สที่ฉันลงไว้
// ==========================================
router.get('/my-courses', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const enrollments = await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true, // ← ดึงข้อมูลคอร์สมาด้วยเลย (Join อัตโนมัติ)
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // ดึงแค่ข้อมูลคอร์สออกมาส่งให้ Frontend
    const courses = enrollments.map((en) => en.course);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
  }
});

// ==========================================
// GET /api/enrollments/check/:courseId - เช็คว่าลงแล้วหรือยัง
// ==========================================
router.get('/check/:courseId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const courseId = parseInt(req.params.courseId);

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {  // ← ชื่อ index ที่ Prisma สร้างจาก @@unique
          userId,
          courseId,
        },
      },
    });

    res.json({ enrolled: !!enrollment }); // true ถ้ามี, false ถ้าไม่มี
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;