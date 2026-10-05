const express = require('express');
const prisma = require('../lib/prisma');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// ===== Public Routes (ไม่ต้อง Login) =====

// ดึงคอร์สทั้งหมด
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' }, // เรียงจากใหม่ → เก่า
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคอร์สได้' });
  }
});

// ===== Protected Routes (ต้อง Login + เช็ค Role) =====

// ดึงคอร์สที่อาจารย์ท่านนี้จัดการ (หรือทั้งหมดถ้าเป็น admin)
router.get('/instructor/managed', auth, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const isInstructorOnly = req.user.role === 'instructor';
    const whereClause = isInstructorOnly ? { instructor: req.user.name } : {};

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalStudents = courses.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0);

    res.json({
      courses,
      stats: {
        totalCourses: courses.length,
        totalStudents,
      },
    });
  } catch (error) {
    console.error('Error fetching instructor courses:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคอร์สของผู้สอนได้' });
  }
});

// ดึงคอร์สตาม ID
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!course) {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// สร้างคอร์สใหม่ (เฉพาะ admin หรือ instructor)
router.post('/', auth, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const { title, description, instructor, thumbnail, price, duration } = req.body;

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor: req.user.role === 'instructor' ? req.user.name : (instructor || req.user.name),
        thumbnail,
        price: parseFloat(price) || 0,
        duration: duration || '3 ชม. 30 นาที',
      },
    });

    res.json({ id: course.id, message: 'สร้างคอร์สสำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: 'สร้างคอร์สไม่สำเร็จ' });
  }
});

// แก้ไขคอร์ส (เฉพาะ admin หรือ instructor เจ้าของคอร์ส)
router.put('/:id', auth, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }

    if (req.user.role === 'instructor' && existing.instructor !== req.user.name) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์แก้ไขคอร์สของผู้สอนท่านอื่น' });
    }

    const { title, description, instructor, thumbnail, price, duration } = req.body;

    const course = await prisma.course.update({
      where: { id: courseId },
      data: {
        title,
        description,
        instructor: req.user.role === 'instructor' ? req.user.name : (instructor || existing.instructor),
        thumbnail,
        price: parseFloat(price) || 0,
        ...(duration ? { duration } : {}),
      },
    });

    res.json({ id: course.id, message: 'แก้ไขคอร์สสำเร็จ' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }
    res.status(500).json({ error: 'แก้ไขคอร์สไม่สำเร็จ' });
  }
});

// ลบคอร์ส (เฉพาะ admin หรือ instructor เจ้าของคอร์ส)
router.delete('/:id', auth, requireRole('admin', 'instructor'), async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const existing = await prisma.course.findUnique({ where: { id: courseId } });
    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }

    if (req.user.role === 'instructor' && existing.instructor !== req.user.name) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ลบคอร์สของผู้สอนท่านอื่น' });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    res.json({ message: 'ลบคอร์สสำเร็จ' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }
    res.status(500).json({ error: 'ลบคอร์สไม่สำเร็จ' });
  }
});

// ลงทะเบียนเรียนคอร์ส (Enroll)
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;

    // เช็คว่ามีคอร์สนี้อยู่ไหม
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }

    // เช็คว่าเคยลงทะเบียนไว้หรือยัง
    const existing = await prisma.$queryRawUnsafe(
      `SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?`,
      userId,
      courseId
    );

    if (existing && existing.length > 0) {
      return res.status(400).json({ error: 'คุณได้ลงทะเบียนคอร์สนี้แล้ว' });
    }

    await prisma.$executeRawUnsafe(
      `INSERT INTO enrollments (user_id, course_id, status, progress, created_at) VALUES (?, ?, ?, ?, datetime('now'))`,
      userId,
      courseId,
      'in_progress',
      15
    );

    res.json({ message: 'ลงทะเบียนเรียนสำเร็จ', enrollment: { userId, courseId, status: 'in_progress', progress: 15, course } });
  } catch (error) {
    console.error('Enroll error:', error);
    res.status(500).json({ error: 'ลงทะเบียนเรียนไม่สำเร็จ' });
  }
});

// อัปเดตสถานะคอร์ส (เช่น สลับระหว่างกำลังเรียน ↔ เรียนจบแล้ว หรือเริ่มเรียนซ้ำ/ทบทวน)
router.patch('/:id/progress', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const userId = req.user.id;
    const { status, progress, isReviewing, reviewProgress } = req.body;

    const fields = [];
    const values = [];

    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (progress !== undefined) {
      fields.push('progress = ?');
      values.push(parseInt(progress));
    }
    if (isReviewing !== undefined) {
      fields.push('is_reviewing = ?');
      values.push(isReviewing ? 1 : 0);
    }
    if (reviewProgress !== undefined) {
      fields.push('review_progress = ?');
      values.push(parseInt(reviewProgress));
    }

    if (fields.length > 0) {
      values.push(userId, courseId);
      await prisma.$executeRawUnsafe(
        `UPDATE enrollments SET ${fields.join(', ')} WHERE user_id = ? AND course_id = ?`,
        ...values
      );
    }

    res.json({
      message: 'อัปเดตสถานะการเรียนสำเร็จ',
      enrollment: { userId, courseId, status, progress, isReviewing, reviewProgress }
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะการเรียนได้' });
  }
});

module.exports = router;