const API_URL = 'http://localhost:3001/api';
const getToken = () => localStorage.getItem('token');
// ฟังก์ชันเรียก API ต่างๆ
// Auth
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
};

export const register = async (email, password, name) => {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  return res.json();
};
// Courses
export const getCourses = async () => {
  const res = await fetch(`${API_URL}/courses`);
  return res.json();
};

export const getCourse = async (id) => {
  const res = await fetch(`${API_URL}/courses/${id}`);
  return res.json();
};

export const createCourse = async (courseData) => {
  const res = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(courseData),
  });
  return res.json();
};
// Enrollments
export const enrollCourse = async (courseId) => {
  const res = await fetch(`${API_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`  // ← ส่ง Token ไปด้วย
    },
    body: JSON.stringify({ courseId }),
  });
  return res.json();
};
// เช็คว่าลงทะเบียนแล้วหรือยัง
export const checkEnrollment = async (courseId) => {
  const res = await fetch(`${API_URL}/enrollments/check/${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};
// ดูคอร์สที่ลงทะเบียนไว้
export const getMyCourses = async () => {
  const res = await fetch(`${API_URL}/enrollments/my-courses`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

// ยกเลิกลงทะเบียน
export const unenrollCourse = async (courseId) => {
  const res = await fetch(`${API_URL}/enrollments/${courseId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

// ==========================================
// Lessons
// ==========================================
export const getLessons = async (courseId) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/lessons`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

// ==========================================
// Progress
// ==========================================
export const updateProgress = async (lessonId, watchedSeconds, completed = false) => {
  const res = await fetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ lessonId, watchedSeconds, completed }),
  });
  return res.json();
};

export const getCourseProgress = async (courseId) => {
  const res = await fetch(`${API_URL}/progress/courses/${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

// ==========================================
// Upload
// ==========================================
export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('video', file); // ชื่อ 'video' ต้องตรงกับ upload.single('video')

  const res = await fetch(`${API_URL}/upload/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      // ❌ อย่าใส่ 'Content-Type': 'multipart/form-data' 
      // Browser จะใส่ให้เองพร้อม Boundary
    },
    body: formData,
  });
  return res.json();
};

// ==========================================
// Create Lesson
// ==========================================
export const createLesson = async (courseId, lessonData) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(lessonData),
  });
  return res.json();
};