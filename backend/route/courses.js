const express = require('express');
const prisma = require('../lib/prisma'); // ← เปลี่ยนตรงนี้!
const auth = require('../middleware/auth');
const router = express.Router();

// ดึงคอร์สทั้งหมด
router.get('/', async (req, res) => {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { id: 'desc' }, // เรียงจากใหม่ → เก่า
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลคอร์สได้' });
  }
});

// ดึงคอร์สตาม ID
router.get('/:id', async (req, res) => {
  try {
    const course = await prisma.course.findUnique({
      where: { id: parseInt(req.params.id) },
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

    const course = await prisma.course.create({
      data: {
        title,
        description,
        instructor,
        thumbnail,
        price: parseFloat(price) || 0,
      },
    });

    res.json({ id: course.id, message: 'สร้างคอร์สสำเร็จ' });
  } catch (error) {
    res.status(500).json({ error: 'สร้างคอร์สไม่สำเร็จ' });
  }
});

module.exports = router;