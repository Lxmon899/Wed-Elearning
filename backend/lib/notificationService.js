const prisma = require('./prisma');

/**
 * สร้างการแจ้งเตือนสำหรับผู้ใช้ 1 คน
 */
async function createNotification({ userId, title, message, type = 'info', link = null }) {
  try {
    if (!userId || !title || !message) return null;
    return await prisma.notification.create({
      data: {
        userId: parseInt(userId),
        title,
        message,
        type,
        link,
      },
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}

/**
 * ส่งแจ้งเตือนหาผู้ใช้ทุกคน (เช่น ประกาศคอร์สใหม่)
 */
async function notifyAllUsers({ title, message, type = 'info', link = null, excludeUserId = null }) {
  try {
    const where = {};
    if (excludeUserId) {
      where.id = { not: parseInt(excludeUserId) };
    }
    const users = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (users.length === 0) return 0;

    const notificationsData = users.map((u) => ({
      userId: u.id,
      title,
      message,
      type,
      link,
    }));

    const result = await prisma.notification.createMany({
      data: notificationsData,
    });

    return result.count;
  } catch (error) {
    console.error('Failed to notify all users:', error);
    return 0;
  }
}

/**
 * ส่งแจ้งเตือนหานักเรียนทุกคนที่ลงทะเบียนในคอร์สใดคอร์สหนึ่ง
 */
async function notifyCourseStudents({ courseId, title, message, type = 'course', link = null }) {
  try {
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId: parseInt(courseId) },
      select: { userId: true },
    });

    if (enrollments.length === 0) return 0;

    const notificationsData = enrollments.map((e) => ({
      userId: e.userId,
      title,
      message,
      type,
      link,
    }));

    const result = await prisma.notification.createMany({
      data: notificationsData,
    });

    return result.count;
  } catch (error) {
    console.error('Failed to notify course students:', error);
    return 0;
  }
}

module.exports = {
  createNotification,
  notifyAllUsers,
  notifyCourseStudents,
};
