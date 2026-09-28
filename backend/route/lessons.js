const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// GET /api/courses/:id/lessons - ดึงบทเรียนทั้งหมดของคอร์ส
// ==========================================
router.get('/:id/lessons', auth, async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const userId = req.user.id;

        // เช็คว่าลงทะเบียนคอร์สนี้แล้วหรือยัง
        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: { userId, courseId },
            },
        });

        if (!enrollment) {
            return res.status(403).json({ error: 'คุณยังไม่ได้ลงทะเบียนคอร์สนี้' });
        }

        // ดึงบทเรียนทั้งหมด + ความคืบหน้าของ user
        const lessons = await prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: {
                progresses: {
                    where: { userId },
                    select: {
                        completed: true,
                        watchedSeconds: true,
                    },
                },
            },
        });

        // แปลงข้อมูลให้ Frontend ใช้ง่าย
        const result = lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            videoUrl: lesson.videoUrl,
            duration: lesson.duration,
            order: lesson.order,
            completed: lesson.progresses[0]?.completed || false,
            watchedSeconds: lesson.progresses[0]?.watchedSeconds || 0,
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ไม่สามารถดึงบทเรียนได้' });
    }
});

module.exports = router;