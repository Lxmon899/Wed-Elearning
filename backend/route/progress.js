const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// POST /api/progress - อัปเดตความคืบหน้า
// Body: { lessonId, watchedSeconds, completed }
// ==========================================
router.post('/', auth, async (req, res) => {
  try {
    const { lessonId, watchedSeconds, completed } = req.body;
    const userId = req.user.id;

    // Upsert = ถ้ามีอยู่แล้วให้อัปเดต ถ้าไม่มีให้สร้างใหม่
    const progress = await prisma.progress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId: parseInt(lessonId),
        },
      },
      update: {
        watchedSeconds: parseInt(watchedSeconds) || 0,
        completed: completed || false,
      },
      create: {
        userId,
        lessonId: parseInt(lessonId),
        watchedSeconds: parseInt(watchedSeconds) || 0,
        completed: completed || false,
      },
    });

    res.json({ message: 'บันทึกความคืบหน้าสำเร็จ', progress });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'บันทึกไม่สำเร็จ' });
  }
});

// ==========================================
// GET /api/courses/:id/progress - ดึง % ความคืบหน้าของคอร์ส
// ==========================================
router.get('/courses/:id', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;

    // นับจำนวนบทเรียนทั้งหมด
    const totalLessons = await prisma.lesson.count({
      where: { courseId },
    });

    // นับจำนวนบทเรียนที่จบแล้ว
    const completedLessons = await prisma.progress.count({
      where: {
        userId,
        completed: true,
        lesson: {
          courseId,
        },
      },
    });

    const percentage = totalLessons > 0 
      ? Math.round((completedLessons / totalLessons) * 100) 
      : 0;

    res.json({
      totalLessons,
      completedLessons,
      percentage,
    });
  } catch (error) {
    res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
  }
});

module.exports = router;
