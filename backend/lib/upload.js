const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ใช้ UPLOAD_DIR env var สำหรับ persistent volume บน Railway/Render
// ตัวอย่าง: UPLOAD_DIR=/data/uploads
const UPLOAD_DIR = process.env.UPLOAD_DIR
    ? path.join(process.env.UPLOAD_DIR, 'videos')
    : path.join(__dirname, '..', 'uploads', 'videos');

// สร้างโฟลเดอร์อัตโนมัติถ้ายังไม่มี
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// ตั้งค่าที่เก็บไฟล์ + ตั้งชื่อไฟล์
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        // ตั้งชื่อไฟล์เป็น: timestamp-ชื่อเดิม (ป้องกันซ้ำ และแปลงอักขระพิเศษ/ช่องว่าง)
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const safeName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, '_');
        const uniqueName = `${Date.now()}-${safeName}${ext}`;
        cb(null, uniqueName);
    },
});

// ตรวจสอบว่าเป็นไฟล์วิดีโอจริงๆ
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true); // อนุญาต
    } else {
        cb(new Error('อนุญาตเฉพาะไฟล์วิดีโอ (MP4, WEBM, OGG) เท่านั้น'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // จำกัด 100 MB
    },
});

module.exports = upload;