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
        if (isNaN(courseId)) {
            return res.status(400).json({ error: 'courseId ไม่ถูกต้อง' });
        }
        const userId = req.user.id;

        // เช็คว่าผู้ใช้เป็น admin หรือจัดการในฐานะผู้สอนหรือไม่
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const isAdmin = user?.role === 'admin';
        const isManage = req.query.manage === 'true';

        if (!isAdmin && !isManage) {
            // เช็คว่าลงทะเบียนคอร์สนี้แล้วหรือยัง
            const enrollment = await prisma.enrollment.findUnique({
                where: {
                    userId_courseId: { userId, courseId },
                },
            });

            if (!enrollment) {
                return res.status(403).json({ error: 'คุณยังไม่ได้ลงทะเบียนคอร์สนี้' });
            }
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
            courseId: lesson.courseId,
            completed: lesson.progresses[0]?.completed || false,
            watchedSeconds: lesson.progresses[0]?.watchedSeconds || 0,
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ไม่สามารถดึงบทเรียนได้' });
    }
});

// ==========================================
// GET /api/courses/lessons/:lessonId - ดึงบทเรียนเดี่ยว
// ==========================================
router.get('/lessons/:lessonId', auth, async (req, res) => {
    try {
        const lessonId = parseInt(req.params.lessonId);
        if (isNaN(lessonId)) {
            return res.status(400).json({ error: 'lessonId ไม่ถูกต้อง' });
        }

        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    select: { id: true, title: true, instructor: true },
                },
            },
        });

        if (!lesson) {
            return res.status(404).json({ error: 'ไม่พบบทเรียนนี้' });
        }

        res.json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลบทเรียนได้' });
    }
});

// ==========================================
// POST /api/courses/:id/lessons - สร้างบทเรียนใหม่
// ==========================================
router.post('/:id/lessons', auth, async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        if (isNaN(courseId)) {
            return res.status(400).json({ error: 'courseId ไม่ถูกต้อง' });
        }
        const { title, videoUrl, duration, order } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'กรุณาระบุชื่อบทเรียน' });
        }

        if (!videoUrl || !videoUrl.trim()) {
            return res.status(400).json({ error: 'กรุณาระบุไฟล์หรือ URL วิดีโอ' });
        }

        let lessonOrder = order !== undefined ? parseInt(order) : null;
        if (lessonOrder === null || isNaN(lessonOrder)) {
            const lastLesson = await prisma.lesson.findFirst({
                where: { courseId },
                orderBy: { order: 'desc' },
            });
            lessonOrder = lastLesson ? lastLesson.order + 1 : 1;
        }

        const lesson = await prisma.lesson.create({
            data: {
                title: title.trim(),
                videoUrl: videoUrl.trim(),
                duration: duration ? parseInt(duration) : null,
                order: lessonOrder,
                courseId,
            },
        });

        res.json({ message: 'สร้างบทเรียนสำเร็จ', lesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'สร้างบทเรียนไม่สำเร็จ' });
    }
});

// ==========================================
// PUT /api/courses/lessons/:lessonId & PUT /api/courses/:id/lessons/:lessonId
// แก้ไขบทเรียน
// ==========================================
const handleUpdateLesson = async (req, res) => {
    try {
        const lessonId = parseInt(req.params.lessonId || req.params.id);
        if (isNaN(lessonId)) {
            return res.status(400).json({ error: 'lessonId ไม่ถูกต้อง' });
        }

        const { title, videoUrl, duration, order } = req.body;

        const existingLesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!existingLesson) {
            return res.status(404).json({ error: 'ไม่พบบทเรียนที่ต้องการแก้ไข' });
        }

        const updateData = {};
        if (title !== undefined && title.trim()) updateData.title = title.trim();
        if (videoUrl !== undefined && videoUrl.trim()) updateData.videoUrl = videoUrl.trim();
        if (duration !== undefined) updateData.duration = duration ? parseInt(duration) : null;
        if (order !== undefined) updateData.order = parseInt(order);

        const updatedLesson = await prisma.lesson.update({
            where: { id: lessonId },
            data: updateData,
        });

        res.json({ message: 'อัปเดตบทเรียนสำเร็จ', lesson: updatedLesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'แก้ไขบทเรียนไม่สำเร็จ' });
    }
};

router.put('/lessons/:lessonId', auth, handleUpdateLesson);
router.put('/:id/lessons/:lessonId', auth, handleUpdateLesson);

// ==========================================
// DELETE /api/courses/lessons/:lessonId & DELETE /api/courses/:id/lessons/:lessonId
// ลบบทเรียน
// ==========================================
const handleDeleteLesson = async (req, res) => {
    try {
        const lessonId = parseInt(req.params.lessonId || req.params.id);
        if (isNaN(lessonId)) {
            return res.status(400).json({ error: 'lessonId ไม่ถูกต้อง' });
        }

        const existingLesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!existingLesson) {
            return res.status(404).json({ error: 'ไม่พบบทเรียนที่ต้องการลบ' });
        }

        // ล้าง progress ที่ผูกกับบทเรียนนี้
        await prisma.progress.deleteMany({
            where: { lessonId },
        });

        // อัปเดตคำถามที่มี lessonId ให้เป็น null
        await prisma.question.updateMany({
            where: { lessonId },
            data: { lessonId: null },
        });

        await prisma.lesson.delete({
            where: { id: lessonId },
        });

        res.json({ message: 'ลบบทเรียนเรียบร้อยแล้ว' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ลบบทเรียนไม่สำเร็จ' });
    }
};

router.delete('/lessons/:lessonId', auth, handleDeleteLesson);
router.delete('/:id/lessons/:lessonId', auth, handleDeleteLesson);

// ==========================================
// PUT /api/courses/:id/lessons-reorder - สลับลำดับบทเรียน
// ==========================================
router.put('/:id/lessons-reorder', auth, async (req, res) => {
    try {
        const courseId = parseInt(req.params.id);
        const { orderedLessonIds } = req.body;

        if (!Array.isArray(orderedLessonIds)) {
            return res.status(400).json({ error: 'orderedLessonIds ต้องเป็น Array ของ Lesson ID' });
        }

        // อัปเดต order ของแต่ละ lesson ตามลำดับใน array
        await prisma.$transaction(
            orderedLessonIds.map((id, index) =>
                prisma.lesson.update({
                    where: { id: parseInt(id) },
                    data: { order: index + 1 },
                })
            )
        );

        const updatedLessons = await prisma.lesson.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
        });

        res.json({ message: 'จัดเรียงลำดับบทเรียนสำเร็จ', lessons: updatedLessons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'จัดเรียงลำดับบทเรียนไม่สำเร็จ' });
    }
});

module.exports = router;