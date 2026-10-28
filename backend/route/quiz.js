const express = require('express');
const prisma = require('../lib/prisma');
const auth = require('../middleware/auth');
const jwt = require('jsonwebtoken');
const { createNotification } = require('../lib/notificationService');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

// Helper to get user from token if available without failing
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch {
      // ignore invalid token in optional auth
    }
  }
  next();
};

// ==========================================
// GET /api/courses/:courseId/quiz
// ดึงคำถามและตัวเลือกสำหรับคอร์ส (ซ่อน isCorrect ไว้เพื่อป้องกันการโกง)
// ==========================================
router.get('/:courseId/quiz', optionalAuth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'courseId ไม่ถูกต้อง' });
    }

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, title: true }
    });

    if (!course) {
      return res.status(404).json({ error: 'ไม่พบคอร์สเรียนนี้' });
    }

    const isManager = req.user && (req.user.role === 'admin' || req.user.role === 'instructor' || req.query.manage === 'true');

    const questions = await prisma.question.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        choices: {
          select: {
            id: true,
            questionId: true,
            text: true,
            order: true,
            ...(isManager && { isCorrect: true }),
          },
          orderBy: { order: 'asc' }
        }
      }
    });

    let lastAttempt = null;
    let bestAttempt = null;
    let allAttempts = [];

    if (req.user?.id) {
      allAttempts = await prisma.quizAttempt.findMany({
        where: {
          courseId,
          userId: req.user.id
        },
        orderBy: { createdAt: 'desc' }
      });

      if (allAttempts.length > 0) {
        lastAttempt = allAttempts[0];
        // หาคะแนนสูงสุด
        bestAttempt = allAttempts.reduce((max, cur) => cur.score > max.score ? cur : max, allAttempts[0]);
      }
    }

    res.json({
      courseId,
      courseTitle: course.title,
      totalQuestions: questions.length,
      questions,
      lastAttempt,
      bestAttempt,
      attemptCount: allAttempts.length
    });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลแบบทดสอบได้' });
  }
});

// ==========================================
// POST /api/courses/:courseId/quiz/submit
// ส่งคำตอบแบบทดสอบ ตรวจคำตอบ คำนวณคะแนน และบันทึก QuizAttempt
// Body: { answers: { [questionId]: choiceId } }
// ==========================================
router.post('/:courseId/quiz/submit', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user.id;
    const { answers } = req.body; // e.g. { "1": 3, "2": 5 } or array

    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'courseId ไม่ถูกต้อง' });
    }

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({ error: 'กรุณาส่งคำตอบที่ถูกต้อง' });
    }

    // ดึงคำถามและตัวเลือกทั้งหมดของคอร์สพร้อมเฉลย
    const questions = await prisma.question.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: {
        choices: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (questions.length === 0) {
      return res.status(400).json({ error: 'คอร์สนี้ยังไม่มีแบบทดสอบ' });
    }

    let score = 0;
    const totalQuestions = questions.length;

    // Normalize answers to map
    // answers might be { "1": 2 } or array [{ questionId: 1, choiceId: 2 }]
    const answersMap = {};
    if (Array.isArray(answers)) {
      answers.forEach(item => {
        if (item.questionId) answersMap[item.questionId] = item.choiceId;
      });
    } else {
      Object.entries(answers).forEach(([qId, cId]) => {
        answersMap[parseInt(qId)] = parseInt(cId);
      });
    }

    // ตรวจแต่ละข้อ
    const detailedResults = questions.map(q => {
      const selectedChoiceId = answersMap[q.id];
      const selectedChoice = q.choices.find(c => c.id === selectedChoiceId);
      const correctChoice = q.choices.find(c => c.isCorrect);

      const isCorrect = selectedChoice ? Boolean(selectedChoice.isCorrect) : false;
      if (isCorrect) {
        score += 1;
      }

      return {
        questionId: q.id,
        questionText: q.text,
        explanation: q.explanation,
        selectedChoiceId: selectedChoiceId || null,
        selectedChoiceText: selectedChoice?.text || 'ไม่ได้ตอบ',
        correctChoiceId: correctChoice?.id || null,
        correctChoiceText: correctChoice?.text || '',
        isCorrect,
        choices: q.choices.map(c => ({
          id: c.id,
          text: c.text,
          isCorrect: c.isCorrect,
          isSelected: c.id === selectedChoiceId
        }))
      };
    });

    const percentage = Math.round((score / totalQuestions) * 100);
    // เกณฑ์ผ่าน: 70% ขึ้นไป
    const passed = percentage >= 70;

    // บันทึกลง quiz_attempts
    const attempt = await prisma.quizAttempt.create({
      data: {
        userId,
        courseId,
        score,
        totalQuestions,
        passed
      }
    });

    // ส่งการแจ้งเตือนเมื่อสอบผ่าน
    if (passed) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true }
      });
      await createNotification({
        userId,
        title: '🏆 ยินดีด้วย! คุณผ่านแบบทดสอบแล้ว',
        message: `คุณทำคะแนนได้ ${score}/${totalQuestions} (${percentage}%) ในคอร์ส "${course?.title || 'แบบทดสอบ'}" และได้รับใบประกาศนียบัตรแล้ว!`,
        type: 'certificate',
        link: '/certificates',
      });
    }

    res.json({
      message: passed ? 'ยินดีด้วย! คุณผ่านแบบทดสอบแล้ว' : 'คุณยังไม่ผ่านเกณฑ์แบบทดสอบ สามารถลองใหม่ได้',
      attemptId: attempt.id,
      score,
      totalQuestions,
      percentage,
      passed,
      createdAt: attempt.createdAt,
      results: detailedResults
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการตรวจคำตอบ' });
  }
});

// ==========================================
// GET /api/courses/:courseId/quiz/attempts
// ประวัติการทำแบบทดสอบของผู้ใช้ในคอร์สนี้
// ==========================================
router.get('/:courseId/quiz/attempts', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const userId = req.user.id;

    if (isNaN(courseId)) {
      return res.status(400).json({ error: 'courseId ไม่ถูกต้อง' });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        courseId,
        userId
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(attempts);
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ error: 'ไม่สามารถดึงประวัติการทำแบบทดสอบได้' });
  }
});

// ==========================================
// POST /api/courses/:courseId/quiz/questions
// เพิ่มคำถามใหม่และตัวเลือก (สำหรับผู้สอน/แอดมิน)
// ==========================================
router.post('/:courseId/quiz/questions', auth, async (req, res) => {
  try {
    const courseId = parseInt(req.params.courseId);
    const { text, explanation, order = 0, choices = [] } = req.body;

    if (!text || choices.length < 2) {
      return res.status(400).json({ error: 'ต้องมีคำถามและตัวเลือกอย่างน้อย 2 ตัวเลือก' });
    }

    const hasCorrectChoice = choices.some(c => c.isCorrect);
    if (!hasCorrectChoice) {
      return res.status(400).json({ error: 'ต้องระบุตัวเลือกที่ถูกต้องอย่างน้อย 1 ตัวเลือก' });
    }

    const question = await prisma.question.create({
      data: {
        courseId,
        text,
        explanation,
        order: parseInt(order) || 0,
        choices: {
          create: choices.map((c, idx) => ({
            text: c.text,
            isCorrect: Boolean(c.isCorrect),
            order: c.order !== undefined ? c.order : idx
          }))
        }
      },
      include: {
        choices: true
      }
    });

    res.status(201).json({ message: 'สร้างคำถามสำเร็จ', question });
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: 'ไม่สามารถสร้างคำถามได้' });
  }
});

// ==========================================
// PUT /api/courses/quiz/questions/:questionId
// หรือ PUT /api/courses/:courseId/quiz/questions/:questionId
// แก้ไขคำถามและตัวเลือก (สำหรับผู้สอน/แอดมิน)
// ==========================================
const updateQuestionHandler = async (req, res) => {
  try {
    const questionId = parseInt(req.params.questionId);
    const { text, explanation, order, choices } = req.body;

    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'questionId ไม่ถูกต้อง' });
    }

    const existing = await prisma.question.findUnique({
      where: { id: questionId },
      include: { choices: true }
    });

    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบคำถามที่ต้องการแก้ไข' });
    }

    if (text !== undefined && !text.trim()) {
      return res.status(400).json({ error: 'ข้อความคำถามต้องไม่ว่างเปล่า' });
    }

    if (choices && Array.isArray(choices)) {
      const validChoices = choices.filter(c => c.text && c.text.trim() !== '');
      if (validChoices.length < 2) {
        return res.status(400).json({ error: 'ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก' });
      }
      const hasCorrect = validChoices.some(c => c.isCorrect);
      if (!hasCorrect) {
        return res.status(400).json({ error: 'ต้องระบุตัวเลือกที่ถูกต้องอย่างน้อย 1 ตัวเลือก' });
      }
    }

    await prisma.$transaction(async (tx) => {
      // อัปเดตข้อความคำถามและคำอธิบาย
      await tx.question.update({
        where: { id: questionId },
        data: {
          ...(text !== undefined && { text: text.trim() }),
          ...(explanation !== undefined && { explanation: explanation ? explanation.trim() : null }),
          ...(order !== undefined && { order: parseInt(order) || 0 }),
        }
      });

      // ถ้ามีการส่ง choices มาด้วย ให้แทนที่ choices เก่า
      if (choices && Array.isArray(choices)) {
        await tx.choice.deleteMany({
          where: { questionId }
        });

        await tx.choice.createMany({
          data: choices.filter(c => c.text && c.text.trim() !== '').map((c, idx) => ({
            questionId,
            text: c.text.trim(),
            isCorrect: Boolean(c.isCorrect),
            order: c.order !== undefined ? c.order : idx + 1
          }))
        });
      }
    });

    const updatedQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        choices: {
          orderBy: { order: 'asc' }
        }
      }
    });

    res.json({ message: 'แก้ไขคำถามสำเร็จ', question: updatedQuestion });
  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'ไม่สามารถแก้ไขคำถามได้' });
  }
};

router.put('/quiz/questions/:questionId', auth, updateQuestionHandler);
router.put('/:courseId/quiz/questions/:questionId', auth, updateQuestionHandler);

// ==========================================
// DELETE /api/courses/quiz/questions/:questionId
// หรือ DELETE /api/courses/:courseId/quiz/questions/:questionId
// ลบคำถามแบบทดสอบ (สำหรับผู้สอน/แอดมิน)
// ==========================================
const deleteQuestionHandler = async (req, res) => {
  try {
    const questionId = parseInt(req.params.questionId);

    if (isNaN(questionId)) {
      return res.status(400).json({ error: 'questionId ไม่ถูกต้อง' });
    }

    const existing = await prisma.question.findUnique({
      where: { id: questionId }
    });

    if (!existing) {
      return res.status(404).json({ error: 'ไม่พบคำถามที่ต้องการลบ' });
    }

    await prisma.question.delete({
      where: { id: questionId }
    });

    res.json({ message: 'ลบคำถามสำเร็จ' });
  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'ไม่สามารถลบคำถามได้' });
  }
};

router.delete('/quiz/questions/:questionId', auth, deleteQuestionHandler);
router.delete('/:courseId/quiz/questions/:questionId', auth, deleteQuestionHandler);

module.exports = router;
