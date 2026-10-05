const express = require('express');
const prisma = require('../lib/prisma');
const router = express.Router();

// ดึงสถิติรวมของระบบ
router.get('/', async (req, res) => {
  try {
    // นับจำนวนคอร์สทั้งหมด
    const totalCourses = await prisma.course.count();

    // นับจำนวนผู้เรียน (user ที่มี role = student)
    const totalStudents = await prisma.user.count({
      where: { role: 'student' },
    });

    // นับจำนวนผู้สอน (ดึง instructor ที่ไม่ซ้ำจากตาราง courses)
    const instructors = await prisma.course.findMany({
      select: { instructor: true },
      distinct: ['instructor'],
    });
    const totalInstructors = instructors.length;

    // นับจำนวนการลงทะเบียนทั้งหมด
    const totalEnrollments = await prisma.enrollment.count();

    res.json({
      totalCourses,
      totalStudents,
      totalInstructors,
      totalEnrollments,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสถิติได้' });
  }
});

module.exports = router;
