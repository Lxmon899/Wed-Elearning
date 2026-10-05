const express = require('express');
const prisma = require('../lib/prisma');
const { auth, requireRole } = require('../middleware/auth');
const router = express.Router();

// ===== ทุก Route ต้อง Login + เป็น Admin =====

// ดึงรายชื่อ User ทั้งหมด (เฉพาะ admin)
router.get('/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' });
  }
});

// เปลี่ยน Role ของ User (เฉพาะ admin)
// เช่น เปลี่ยนจาก student → instructor
router.patch('/users/:id/role', auth, requireRole('admin'), async (req, res) => {
  try {
    const { role } = req.body;
    const userId = parseInt(req.params.id);

    // ตรวจสอบ role ที่อนุญาต
    const allowedRoles = ['student', 'instructor', 'admin'];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({
        error: `Role ไม่ถูกต้อง — ใช้ได้เฉพาะ: ${allowedRoles.join(', ')}`,
      });
    }

    // ป้องกันไม่ให้ admin ลด role ตัวเอง
    if (req.user.id === userId && role !== 'admin') {
      return res.status(400).json({ error: 'ไม่สามารถเปลี่ยน Role ของตัวเองได้' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    res.json({ message: `เปลี่ยน Role เป็น ${role} สำเร็จ`, user });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }
    res.status(500).json({ error: 'เปลี่ยน Role ไม่สำเร็จ' });
  }
});

// ลบ User (เฉพาะ admin)
router.delete('/users/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // ป้องกันไม่ให้ admin ลบตัวเอง
    if (req.user.id === userId) {
      return res.status(400).json({ error: 'ไม่สามารถลบบัญชีตัวเองได้' });
    }

    // ลบ enrollment ที่เกี่ยวข้องก่อน แล้วค่อยลบ user
    await prisma.enrollment.deleteMany({
      where: { userId },
    });

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'ไม่พบผู้ใช้นี้' });
    }
    res.status(500).json({ error: 'ลบผู้ใช้ไม่สำเร็จ' });
  }
});

module.exports = router;
