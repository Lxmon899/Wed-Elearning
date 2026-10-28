const express = require('express');
const multer = require('multer');
const upload = require('../lib/upload');
const auth = require('../middleware/auth');
const router = express.Router();

// ==========================================
// POST /api/upload/video - อัปโหลดวิดีโอ
// Form-data: key="video" value=<ไฟล์วิดีโอ>
// ==========================================
router.post('/video', auth, upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'กรุณาเลือกไฟล์วิดีโอ' });
        }

        // สร้าง URL ที่เข้าถึงไฟล์ได้
        const baseUrl = process.env.BACKEND_URL || 'http://localhost:3001';
        const videoUrl = `${baseUrl}/uploads/videos/${req.file.filename}`;

        res.json({
            message: 'อัปโหลดสำเร็จ!',
            videoUrl,
            filename: req.file.filename,
            size: req.file.size,
        });
    } catch (error) {
        res.status(500).json({ error: 'อัปโหลดไม่สำเร็จ' });
    }
});

// จัดการ Error จาก Multer (เช่น ไฟล์ใหญ่เกินไป)
router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'ไฟล์ใหญ่เกินไป (จำกัด 100 MB)' });
        }
    }
    if (error) {
        return res.status(400).json({ error: error.message });
    }
    next();
});

module.exports = router;