const express = require('express');
const cors = require('cors');
const authRoutes = require('./route/auth');
const courseRoutes = require('./route/courses');
const statsRoutes = require('./route/stats');
const adminRoutes = require('./route/admin');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors()); // อนุญาตให้ Frontend เรียกได้
app.use(express.json()); // อ่าน JSON จาก Body

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

// ทดสอบว่าเซิร์ฟเวอร์ทำงาน
app.get('/', (req, res) => {
  res.json({ message: 'E-Learning API is running!' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
