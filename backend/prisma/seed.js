const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 กำลังใส่ข้อมูลตัวอย่าง...');

  // ล้างข้อมูลเก่าก่อน (เพื่อไม่ให้ซ้ำ)
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // สร้าง Admin
  const adminPassword = bcrypt.hashSync('123456', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: adminPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'admin',
    },
  });

  // สร้างคอร์สตัวอย่าง
  const course1 = await prisma.course.create({
    data: {
      title: 'React สำหรับมือใหม่',
      description: 'เรียนรู้พื้นฐาน React, JSX, Props, State และ Hooks ตั้งแต่ศูนย์',
      instructor: 'อ.สมชาย ใจดี',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      price: 0,
    },
  });

  const course2 = await prisma.course.create({
    data: {
      title: 'Node.js Backend Masterclass',
      description: 'สร้าง REST API ด้วย Express.js, เชื่อมต่อ Database, และระบบ Authentication',
      instructor: 'อ.สมหญิง รอบรู้',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
      price: 499,
    },
  });

  // สร้างบทเรียนสำหรับคอร์ส React
  await prisma.lesson.createMany({
    data: [
      {
        title: 'บทที่ 1: แนะนำ React',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        duration: 596, // ~10 นาที
        order: 1,
        courseId: course1.id,
      },
      {
        title: 'บทที่ 2: JSX และ Component',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        duration: 653, // ~11 นาที
        order: 2,
        courseId: course1.id,
      },
      {
        title: 'บทที่ 3: State และ Props',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        duration: 15, // 15 วินาที (สั้นๆ ไว้เทส)
        order: 3,
        courseId: course1.id,
      },
    ],
  });

  // สร้างบทเรียนสำหรับคอร์ส Node.js
  await prisma.lesson.createMany({
    data: [
      {
        title: 'บทที่ 1: ติดตั้ง Node.js',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        duration: 15,
        order: 1,
        courseId: course2.id,
      },
      {
        title: 'บทที่ 2: Express.js เบื้องต้น',
        videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        duration: 60,
        order: 2,
        courseId: course2.id,
      },
    ],
  });

  console.log('✅ Seed สำเร็จ!');
  console.log('📧 ทดสอบ Login: admin@demo.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });