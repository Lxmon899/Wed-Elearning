const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// GET /api/notifications
// ดึงการแจ้งเตือนของผู้ใช้ปัจจุบัน พร้อมนับ unreadCount
// ==========================================
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      }),
    ]);

    res.json({
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลการแจ้งเตือนได้' });
  }
});

// ==========================================
// PATCH /api/notifications/read-all
// ทำเครื่องหมายว่าอ่านทั้งหมดแล้ว
// ==========================================
router.patch('/read-all', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json({
      message: 'ทำเครื่องหมายว่าอ่านทั้งหมดเรียบร้อยแล้ว',
      updatedCount: result.count,
    });
  } catch (error) {
    console.error('Error marking all as read:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะการแจ้งเตือนได้' });
  }
});

// ==========================================
// PATCH /api/notifications/:id/read
// ทำเครื่องหมายว่าอ่านแล้วสำหรับแจ้งเตือนรายการเดียว
// ==========================================
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'รหัสแจ้งเตือนไม่ถูกต้อง' });
    }

    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบรายการแจ้งเตือนนี้' });
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json({
      message: 'อัปเดตสถานะแจ้งเตือนแล้ว',
      notification: updated,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดต' });
  }
});

// ==========================================
// DELETE /api/notifications/:id
// ลบรายการแจ้งเตือน
// ==========================================
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);

    if (isNaN(notificationId)) {
      return res.status(400).json({ error: 'รหัสแจ้งเตือนไม่ถูกต้อง' });
    }

    const existing = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบรายการแจ้งเตือนนี้' });
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({ message: 'ลบการแจ้งเตือนสำเร็จ' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: 'ไม่สามารถลบการแจ้งเตือนได้' });
  }
});

// ==========================================
// DELETE /api/notifications
// ลบการแจ้งเตือนทั้งหมดของผู้ใช้
// ==========================================
router.delete('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.deleteMany({
      where: { userId },
    });

    res.json({
      message: 'ลบการแจ้งเตือนทั้งหมดเรียบร้อยแล้ว',
      deletedCount: result.count,
    });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: 'ไม่สามารถลบการแจ้งเตือนได้' });
  }
});

module.exports = router;
