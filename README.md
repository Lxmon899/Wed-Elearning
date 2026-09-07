# 📚 Wed-Elearning (ระบบ E-Learning)

โปรเจกต์ระบบคอร์สเรียนออนไลน์ (E-Learning Platform) ประกอบด้วย **Backend (Node.js + Express + Prisma + SQLite)** และ **Frontend (React + Vite + Tailwind CSS)**

---

## 🛠️ ความต้องการของระบบ (Prerequisites)

- **Node.js**: เวอร์ชัน `18.x` ขึ้นไป (แนะนำ `20.x` หรือ `22.x`)
- **npm**: ติดตั้งพร้อมกับ Node.js

---

## 🚀 ขั้นตอนการติดตั้งและการใช้งาน (Setup Guide)

### 1. โคลนโปรเจกต์ (Clone Repository)
```bash
git clone <repository-url>
cd Wed-Elearning-main
```

---

### 2. ตั้งค่า Backend (`/backend`)

#### 2.1 เข้าโฟลเดอร์ Backend และติดตั้ง Dependencies
```bash
cd backend
npm install --ignore-scripts
```
> 💡 **หมายเหตุ**: หากเครื่องไม่มี Python/Visual Studio Build Tools แนะนำให้ใส่ `--ignore-scripts` เพื่อข้ามการคอมไพล์ Native Addon ของ C++

#### 2.2 ตั้งค่า Environment Variables (`.env`)
ตรวจสอบหรือสร้างไฟล์ `.env` ไว้ในโฟลเดอร์ `backend`:
```env
DATABASE_URL="file:./database.sqlite"
JWT_SECRET="my-super-secret-key-change-this-in-production"
```

#### 2.3 ตั้งค่าและเตรียมฐานข้อมูล (Prisma & SQLite)
```bash
# สร้างตารางข้อมูลใน SQLite
npx prisma db push

# (ตัวเลือกเสริม) ใส่ข้อมูลตัวอย่าง เช่น ผู้ใช้ Admin และ คอร์สเรียนตัวอย่าง
npm run seed
```

#### 2.4 เริ่มต้นทำงานเซิร์ฟเวอร์ Backend (Port 3001)
```bash
npm run dev
```
- API Server จะเริ่มทำงานที่: `http://localhost:3001`

---

### 3. ตั้งค่า Frontend (`/frontend`)

เปิด Terminal อีกหน้าต่างหนึ่ง แล้วทำตามขั้นตอนดังนี้:

#### 3.1 เข้าโฟลเดอร์ Frontend และติดตั้ง Dependencies
```bash
cd frontend
npm install
```

#### 3.2 เริ่มต้นทำงาน Frontend Dev Server (Port 5173)
```bash
npm run dev
```
- Web Application จะเริ่มทำงานที่: `http://localhost:5173`

---

## 🛠️ เครื่องมือเพิ่มเติม (Tools)

### 📊 ดูข้อมูลในฐานข้อมูลผ่าน Prisma Studio
หากต้องการเปิดหน้า GUI สำหรับดูและจัดการข้อมูลในฐานข้อมูล SQLite:
```bash
cd backend
npx prisma studio
```
- Access URL: `http://localhost:5555`

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```text
Wed-Elearning-main/
├── backend/                  # REST API Server
│   ├── lib/                  # Prisma Instance Connection
│   ├── middleware/           # Auth Middleware (JWT)
│   ├── prisma/               # Database Schema & Seed Data
│   │   ├── schema.prisma     # โครงสร้างตารางในฐานข้อมูล
│   │   └── seed.js           # ข้อมูลตัวอย่าง
│   ├── route/                # API Routes (Auth, Courses)
│   ├── server.js             # Entry point ของ Express Server
│   └── .env                  # Environment Config
├── frontend/                 # React Single Page Application (Vite)
│   ├── src/                  # Components, Pages, API Calls
│   └── vite.config.js        # Vite Configuration
└── README.md                 # คู่มือการติดตั้งโปรเจกต์
```
