const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 กำลังใส่ข้อมูลตัวอย่าง...');

  // สร้าง Admin
  const adminPassword = bcrypt.hashSync('123456', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: adminPassword,
      name: 'ผู้ดูแลระบบ',
      role: 'admin',
    },
  });

  // สร้างคอร์สตัวอย่าง
  const courses = [
    {
      title: 'React สำหรับมือใหม่',
      description: 'เรียนรู้พื้นฐาน React, JSX, Props, State และ Hooks ตั้งแต่ศูนย์',
      instructor: 'อ.สมชาย ใจดี',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      price: 0,
    },
    {
      title: 'Node.js Backend Masterclass',
      description: 'สร้าง REST API ด้วย Express.js, เชื่อมต่อ Database, และระบบ Authentication',
      instructor: 'อ.สมหญิง รอบรู้',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
      price: 499,
    },
    {
      title: 'ออกแบบ Database ให้เทพ',
      description: 'เรียนรู้ Normalization, ER Diagram, SQL และการออกแบบ Schema ที่มีประสิทธิภาพ',
      instructor: 'อ.สมปอง เก่งกาจ',
      thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
      price: 299,
    },
  ];

  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: courses.indexOf(course) + 1 },
      update: {},
      create: course,
    });
  }

  console.log('✅ Seed สำเร็จ!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });