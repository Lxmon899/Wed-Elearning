require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./route/auth');
const courseRoutes = require('./route/courses');
const enrollmentRoutes = require('./route/enrollments');
const lessonRoutes = require('./route/lessons');
const progressRoutes = require('./route/progress');
const uploadRoutes = require('./route/upload');
const quizRoutes = require('./route/quiz');
const notificationRoutes = require('./route/notifications');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // อนุญาต requests ที่ไม่มี origin (เช่น curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// ให้เข้าถึงไฟล์ใน uploads ได้ผ่าน URL พร้อมรองรับ HTTP Range Request สำหรับ Streaming
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOAD_DIR, {
  acceptRanges: true,
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.mp4') || filePath.endsWith('.webm') || filePath.endsWith('.ogg')) {
      res.setHeader('Accept-Ranges', 'bytes');
    }
  },
}));

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', lessonRoutes);
app.use('/api/courses', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'E-Learning API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});