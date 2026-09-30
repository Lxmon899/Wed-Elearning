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

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ให้เข้าถึงไฟล์ใน uploads ได้ผ่าน URL พร้อมรองรับ HTTP Range Request สำหรับ Streaming
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
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

app.get('/', (req, res) => {
  res.json({ message: 'E-Learning API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});