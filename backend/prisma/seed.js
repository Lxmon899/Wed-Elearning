const prisma = require('../lib/prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 กำลังรีเซ็ตและใส่ข้อมูลตัวอย่างคอร์สเรียนทั้งหมด...');

  // ล้างข้อมูลเก่าก่อน
  await prisma.notification.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.choice.deleteMany();
  await prisma.question.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  // 1. สร้าง Admin & Student ตัวอย่าง
  const passwordHash = bcrypt.hashSync('123456', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      password: passwordHash,
      name: 'ผู้ดูแลระบบ (Admin)',
      role: 'admin',
    },
  });

  const student = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      password: passwordHash,
      name: 'นักเรียน ตัวอย่าง',
      role: 'student',
    },
  });

  const videoUrls = [
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  ];

  // 2. ข้อมูลคอร์สเรียนทั้งหมด
  const coursesData = [
    {
      title: 'React สำหรับมือใหม่ (React 18 & Hooks)',
      description: 'เรียนรู้พื้นฐาน React 18, JSX, Props, State, Component Lifecycle และ Custom Hooks ตั้งแต่เริ่มต้นจนสร้างเว็บแอปพลิเคชันได้จริง',
      instructor: 'อ.สมชาย ใจดี',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
      price: 0,
      lessons: [
        { title: 'บทที่ 1: ปูพื้นฐาน React และ JSX Syntax', videoUrl: videoUrls[0], duration: 15, order: 1 },
        { title: 'บทที่ 2: การจัดการ State ด้วย useState & useEffect', videoUrl: videoUrls[1], duration: 20, order: 2 },
        { title: 'บทที่ 3: การส่งผ่านข้อมูลด้วย Props & Component Reusability', videoUrl: videoUrls[2], duration: 15, order: 3 },
      ],
      questions: [
        {
          text: 'ข้อใดคือจุดเด่นหลักของ React?',
          explanation: 'React ใช้ Virtual DOM ในการอัปเดต UI เฉพาะส่วนที่มีการเปลี่ยนแปลง เพิ่มประสิทธิภาพการทำงาน',
          order: 1,
          choices: [
            { text: 'Virtual DOM ทำให้การเรนเดอร์รวดเร็ว', isCorrect: true, order: 1 },
            { text: 'ใช้สำหรับจัดการฐานข้อมูล SQL Direct', isCorrect: false, order: 2 },
            { text: 'เขียนได้เฉพาะภาษา C++', isCorrect: false, order: 3 },
            { text: 'ทำงานบน Server เท่านั้น', isCorrect: false, order: 4 },
          ],
        },
        {
          text: 'Hook ตัวใดที่ใช้สำหรับจัดการข้อมูลสถานะ (State) ใน Functional Component?',
          explanation: 'useState คือ Hook หลักสำหรับสร้างและอัปเดต State ใน React Component',
          order: 2,
          choices: [
            { text: 'useEffect', isCorrect: false, order: 1 },
            { text: 'useState', isCorrect: true, order: 2 },
            { text: 'useContext', isCorrect: false, order: 3 },
            { text: 'useMemo', isCorrect: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: 'Node.js & Express Backend Masterclass',
      description: 'สร้าง RESTful API ประสิทธิภาพสูงด้วย Node.js, Express.js, Prisma ORM, และระบบ Authentication ด้วย JSON Web Token (JWT)',
      instructor: 'อ.สมหญิง รอบรู้',
      thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
      price: 499,
      lessons: [
        { title: 'บทที่ 1: เริ่มต้นเขียน Server ด้วย Node.js & HTTP Module', videoUrl: videoUrls[3], duration: 15, order: 1 },
        { title: 'บทที่ 2: สร้าง Routing & Controller ด้วย Express.js', videoUrl: videoUrls[4], duration: 25, order: 2 },
        { title: 'บทที่ 3: ระบบรักษาความปลอดภัย Auth & JWT Token', videoUrl: videoUrls[0], duration: 30, order: 3 },
      ],
      questions: [
        {
          text: 'Express.js คืออะไรในระบบพัฒนาเว็บ?',
          explanation: 'Express.js เป็น Minimal Web Framework สำหรับ Node.js ที่ช่วยให้จัดการ Routing และ Middleware ได้ง่าย',
          order: 1,
          choices: [
            { text: 'Database Management System', isCorrect: false, order: 1 },
            { text: 'Web Application Framework สำหรับ Node.js', isCorrect: true, order: 2 },
            { text: 'CSS Preprocessor', isCorrect: false, order: 3 },
            { text: 'Package Manager', isCorrect: false, order: 4 },
          ],
        },
        {
          text: 'JWT (JSON Web Token) นิยมใช้ทำอะไรมากที่สุด?',
          explanation: 'JWT ใช้เป็น Token ในการระบุตัวตน (Authentication) และการอนุญาตเข้าถึงระบบ (Authorization)',
          order: 2,
          choices: [
            { text: 'จัดเก็บรูปภาพในฐานข้อมูล', isCorrect: false, order: 1 },
            { text: 'ตรวจสอบตัวตนและการส่งข้อมูลความปลอดภัยแบบ Stateless', isCorrect: true, order: 2 },
            { text: 'คอมไพล์โค้ด JavaScript', isCorrect: false, order: 3 },
            { text: 'ส่งอีเมลอัตโนมัติ', isCorrect: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: 'Python for Data Science & AI',
      description: 'ก้าวสู่สายงาน Data Science ด้วย Python, NumPy, Pandas, Data Visualization และโมเดล Machine Learning เบื้องต้น',
      instructor: 'อ.ดร.วิชัย วิเคราะห์',
      thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800',
      price: 590,
      lessons: [
        { title: 'บทที่ 1: พื้นฐานภาษา Python สำหรับการวิเคราะห์ข้อมูล', videoUrl: videoUrls[1], duration: 20, order: 1 },
        { title: 'บทที่ 2: การจัดการและทำความสะอาดข้อมูลด้วย Pandas', videoUrl: videoUrls[2], duration: 25, order: 2 },
        { title: 'บทที่ 3: การแสดงผลข้อมูลด้วย Matplotlib & Seaborn', videoUrl: videoUrls[3], duration: 20, order: 3 },
      ],
      questions: [
        {
          text: 'Library ใดใน Python ที่ได้รับความนิยมสูงสุดในการจัดการข้อมูลในรูปแบบ DataFrame?',
          explanation: 'Pandas มีโครงสร้างข้อมูล DataFrame ที่ออกแบบมาสำหรับการจัดการและวิเคราะห์ข้อมูลตารางโดยเฉพาะ',
          order: 1,
          choices: [
            { text: 'NumPy', isCorrect: false, order: 1 },
            { text: 'Pandas', isCorrect: true, order: 2 },
            { text: 'Flask', isCorrect: false, order: 3 },
            { text: 'PyGame', isCorrect: false, order: 4 },
          ],
        },
      ],
    },
    {
      title: 'Modern Web Design & Tailwind CSS v3',
      description: 'ดีไซน์เว็บไซต์ยุคใหม่ที่สวยงาม Responsive รองรับทุกหน้าจอด้วย Utility-First CSS จาก Tailwind CSS',
      instructor: 'อ.ณัฐกร ดีไซน์',
      thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
      price: 0,
      lessons: [
        { title: 'บทที่ 1: รู้จักกับ Utility-First CSS และการติดตั้ง Tailwind', videoUrl: videoUrls[4], duration: 15, order: 1 },
        { title: 'บทที่ 2: ออกแบบ Responsive Design สำหรับ Mobile & Desktop', videoUrl: videoUrls[0], duration: 20, order: 2 },
        { title: 'บทที่ 3: การทำ Animation & Glassmorphism สุดพรีเมียม', videoUrl: videoUrls[1], duration: 25, order: 3 },
      ],
      questions: [
        {
          text: 'แนวคิดหลักของ Tailwind CSS คืออะไร?',
          explanation: 'Tailwind CSS ใช้แนวคิด Utility-First ที่ให้ Class สำเร็จรูปขนาดเล็กนำมาร้อยเรียงสร้าง UI ได้ยืดหยุ่น',
          order: 1,
          choices: [
            { text: 'Utility-First Framework', isCorrect: true, order: 1 },
            { text: 'BEM Naming Convention', isCorrect: false, order: 2 },
            { text: 'Inline Styling strictly', isCorrect: false, order: 3 },
            { text: 'Server-Side Rendering', isCorrect: false, order: 4 },
          ],
        },
      ],
    },
  ];

  // 3. วนลูปสร้าง Course, Lessons และ Questions ใน DB
  for (const cData of coursesData) {
    const { lessons, questions, ...courseFields } = cData;

    const createdCourse = await prisma.course.create({
      data: {
        ...courseFields,
        lessons: {
          create: lessons,
        },
      },
    });

    // สร้างคำถาม & ตัวเลือก
    for (const qData of questions) {
      const { choices, ...qFields } = qData;
      await prisma.question.create({
        data: {
          ...qFields,
          courseId: createdCourse.id,
          choices: {
            create: choices,
          },
        },
      });
    }

    // ลงทะเบียนคอร์สเรียนให้ student ตัวอย่าง
    await prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: createdCourse.id,
      },
    });
  }

  // สร้างแจ้งเตือนตัวอย่างให้ student
  await prisma.notification.createMany({
    data: [
      {
        userId: student.id,
        title: '🎉 คอร์สใหม่เปิดตัว!',
        message: 'React 18 & Next.js Fullstack พร้อมให้เรียนรู้แล้ววันนี้!',
        type: 'course',
        link: '/',
        isRead: false,
      },
      {
        userId: student.id,
        title: '🔥 ไฟลุก! Streak 5 วันติด',
        message: 'เรียนอีก 15 นาทีเพื่อรับเหรียญรางวัลประจำสัปดาห์',
        type: 'info',
        link: '/my-courses',
        isRead: false,
      },
      {
        userId: student.id,
        title: '🏆 ใบรับรองการจบหลักสูตร',
        message: 'ยินดีด้วย! คุณผ่านการทดสอบหลักสูตรเรียบร้อยแล้ว ดาวน์โหลดใบ Certificate ได้เลย',
        type: 'certificate',
        link: '/certificates',
        isRead: true,
      },
    ],
  });

  console.log('✅ สร้างข้อมูลคอร์ส บทเรียน แบบทดสอบ และการแจ้งเตือนเรียบร้อยแล้ว!');
  console.log('🔑 รหัสผ่านทดสอบ:');
  console.log('   - Admin: admin@demo.com / 123456');
  console.log('   - Student: student@demo.com / 123456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });