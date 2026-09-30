const express = require('express');
const prisma = require('../lib/prisma'); // ← เปลี่ยนตรงนี้!
const auth = require('../middleware/auth');
const router = express.Router();

// ดึงคอร์สทั้งหมด
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { id: 'desc' }, // เรียงจากใหม่ → เก่า
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            questions: true,
          },
        },
      },
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคอร์สได้' });
  }
});

// ดึงคอร์สตาม ID
router.get('/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'รหัสคอร์สไม่ถูกต้อง' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            duration: true,
            order: true,
          },
        },
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            questions: true,
          },
        },
      },
    });

    if (!course) {
      return res.status(404).json({ error: 'ไม่พบคอร์สนี้' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

// สร้างคอร์สใหม่ (ต้อง Login)
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, instructor, thumbnail, price } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อคอร์ส' });
    }

    const course = await prisma.course.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        instructor: instructor ? instructor.trim() : req.user.name || 'อาจารย์ผู้สอน',
        thumbnail: thumbnail ? thumbnail.trim() : null,
        price: parseFloat(price) || 0,
      },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            questions: true,
          },
        },
      },
    });

    res.json({ id: course.id, course, message: 'สร้างคอร์สสำเร็จ' });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ error: 'สร้างคอร์สไม่สำเร็จ' });
  }
});

// แก้ไขข้อมูลคอร์ส
router.put('/:id', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    const { title, description, instructor, thumbnail, price } = req.body;

    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'รหัสคอร์สไม่ถูกต้อง' });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'ไม่พบคอร์สที่ต้องการแก้ไข' });
    }

    const updated = await prisma.course.update({
      where: { id: courseId },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(instructor !== undefined && { instructor: instructor.trim() }),
        ...(thumbnail !== undefined && { thumbnail: thumbnail ? thumbnail.trim() : null }),
        ...(price !== undefined && { price: parseFloat(price) || 0 }),
      },
      include: {
        _count: {
          select: {
            lessons: true,
            enrollments: true,
            questions: true,
          },
        },
      },
    });

    res.json({ message: 'อัปเดตคอร์สสำเร็จ', course: updated });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ error: 'แก้ไขคอร์สไม่สำเร็จ' });
  }
});

// ลบคอร์ส
router.delete('/:id', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.id);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'รหัสคอร์สไม่ถูกต้อง' });
    }

    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!existingCourse) {
      return res.status(404).json({ error: 'ไม่พบคอร์สที่ต้องการลบ' });
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    res.json({ message: 'ลบคอร์สสำเร็จ' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ error: 'ลบคอร์สไม่สำเร็จ' });
  }
});

module.exports = router;