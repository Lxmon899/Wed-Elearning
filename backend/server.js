const express = require('express');
const cors = require('cors');
const authRoutes = require('./route/auth');
const courseRoutes = require('./route/courses');
const enrollmentRoutes = require('./route/enrollments');
const lessonRoutes = require('./route/lessons');
const progressRoutes = require('./route/progress');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/courses', lessonRoutes);   // ← เพิ่ม (path: /api/courses/:id/lessons)
app.use('/api/progress', progressRoutes); // ← เพิ่ม

app.get('/', (req, res) => {
  res.json({ message: 'E-Learning API is running!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});