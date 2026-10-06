const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// POST /api/progress - อัปเดตความคืบหน้า
// Body: { lessonId, watchedSeconds, completed, force }
// ==========================================
router.post('/', auth, async (req, res) => {
    try {
        const { lessonId, watchedSeconds, completed, force } = req.body;
        const userId = req.user.id;
        const parsedLessonId = parseInt(lessonId);

        if (isNaN(parsedLessonId)) {
            return res.status(400).json({ error: 'lessonId ไม่ถูกต้อง' });
        }

        // ดึง progress เดิมและ lesson เพื่อเช็ค duration
        const [existingProgress, lesson] = await Promise.all([
            prisma.progress.findUnique({
                where: {
                    userId_lessonId: {
                        userId,
                        lessonId: parsedLessonId,
                    },
                },
            }),
            prisma.lesson.findUnique({
                where: { id: parsedLessonId },
            }),
        ]);

        let isCompleted = false;

        if (force) {
            // ถ้าส่ง force: true มา ให้ยึดตาม completed ที่ส่งมา (ใช้กรณี user กดสวิตช์เรียนจบ/ยังไม่จบเอง)
            isCompleted = Boolean(completed);
        } else {
            // กรณีปกติ:
            // 1. ถ้าส่ง completed: true มา -> true
            // 2. ถ้าเคย completed: true อยู่แล้ว -> รักษาไว้เป็น true (ไม่ถอยกลับเป็น false)
            // 3. ถ้า watchedSeconds เกือบจบวิดีโอ (>= duration - 3 วินาที) -> true
            const wasCompleted = existingProgress?.completed || false;
            const parsedSeconds = parseInt(watchedSeconds) || 0;
            const isNearEnd = lesson?.duration && parsedSeconds > 0 && parsedSeconds >= Math.max(1, lesson.duration - 3);

            isCompleted = Boolean(completed) || wasCompleted || isNearEnd;
        }

        const progress = await prisma.progress.upsert({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId: parsedLessonId,
                },
            },
            update: {
                watchedSeconds: parseInt(watchedSeconds) || 0,
                completed: isCompleted,
            },
            create: {
                userId,
                lessonId: parsedLessonId,
                watchedSeconds: parseInt(watchedSeconds) || 0,
                completed: isCompleted,
            },
        });

        res.json({ message: 'บันทึกความคืบหน้าสำเร็จ', progress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'บันทึกไม่สำเร็จ' });
    }
});

// ==========================================
// GET /api/progress/summary - สรุปสถิติการเรียนจริงของผู้ใช้
// ==========================================
router.get('/summary', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. หาเวลาเรียนรวมทั้งหมด (watchedSeconds)
        const totalProgress = await prisma.progress.aggregate({
            where: { userId },
            _sum: { watchedSeconds: true },
        });

        const totalWatchedSeconds = totalProgress._sum.watchedSeconds || 0;

        // 2. หาคอร์สที่ลงทะเบียนทั้งหมด
        const enrollments = await prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // 3. คำนวณความคืบหน้าของแต่ละคอร์ส
        let completedCoursesCount = 0;
        const coursesProgress = [];

        for (const en of enrollments) {
            const course = en.course;
            const totalLessons = course.lessons.length;
            const completedLessons = await prisma.progress.count({
                where: {
                    userId,
                    completed: true,
                    lesson: { courseId: course.id },
                },
            });

            const percentage = totalLessons > 0
                ? Math.round((completedLessons / totalLessons) * 100)
                : 0;

            if (percentage >= 100) {
                completedCoursesCount++;
            }

            coursesProgress.push({
                courseId: course.id,
                course,
                totalLessons,
                completedLessons,
                percentage,
            });
        }

        // 4. หาคอร์สและบทเรียนล่าสุดที่มีการเข้าเรียน (Active Course)
        const lastProgress = await prisma.progress.findFirst({
            where: { userId },
            include: {
                lesson: {
                    include: {
                        course: true,
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        let activeCourseData = null;
        if (lastProgress && lastProgress.lesson) {
            const currentCourseProg = coursesProgress.find(cp => cp.courseId === lastProgress.lesson.courseId);
            activeCourseData = {
                course: lastProgress.lesson.course,
                lesson: lastProgress.lesson,
                watchedSeconds: lastProgress.watchedSeconds,
                completed: lastProgress.completed,
                coursePercentage: currentCourseProg ? currentCourseProg.percentage : 0,
                updatedAt: lastProgress.updatedAt,
            };
        } else if (enrollments.length > 0) {
            // ถ้ายังไม่มี progress แต่ลงทะเบียนไว้แล้ว ให้เอาคอร์สแรก
            const firstCourse = enrollments[0].course;
            const firstLesson = firstCourse.lessons[0] || null;
            activeCourseData = {
                course: firstCourse,
                lesson: firstLesson,
                watchedSeconds: 0,
                completed: false,
                coursePercentage: 0,
                updatedAt: enrollments[0].createdAt,
            };
        }

        res.json({
            totalWatchedSeconds,
            enrolledCoursesCount: enrollments.length,
            completedCoursesCount,
            certificatesCount: completedCoursesCount,
            activeCourse: activeCourseData,
        });
    } catch (error) {
        console.error('Error fetching user progress summary:', error);
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสรุปได้' });
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

        // หาบทเรียนล่าสุดที่เข้าเรียน
        const lastProgress = await prisma.progress.findFirst({
            where: {
                userId,
                lesson: { courseId },
            },
            orderBy: { updatedAt: 'desc' },
        });

        const percentage = totalLessons > 0
            ? Math.round((completedLessons / totalLessons) * 100)
            : 0;

        res.json({
            totalLessons,
            completedLessons,
            percentage,
            lastLesson: lastProgress ? { id: lastProgress.lessonId } : null,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ดึงข้อมูลไม่สำเร็จ' });
    }
});

// ==========================================
// GET /api/progress/lessons/:lessonId - ดึงความคืบหน้าของบทเรียน
// ==========================================
router.get('/lessons/:lessonId', auth, async (req, res) => {
    try {
        const lessonId = parseInt(req.params.lessonId);
        const userId = req.user.id;

        const progress = await prisma.progress.findUnique({
            where: {
                userId_lessonId: {
                    userId,
                    lessonId,
                },
            },
        });

        res.json(progress || { watchedSeconds: 0, completed: false });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'ดึงความคืบหน้าไม่สำเร็จ' });
    }
});

module.exports = router;