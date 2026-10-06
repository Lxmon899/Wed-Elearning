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

export const updateCourse = async (id, courseData) => {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(courseData),
  });
  return res.json();
};

export const deleteCourse = async (id) => {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
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
export const getLessons = async (courseId, manage = false) => {
  const url = manage
    ? `${API_URL}/courses/${courseId}/lessons?manage=true`
    : `${API_URL}/courses/${courseId}/lessons`;
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

export const getLesson = async (lessonId) => {
  const res = await fetch(`${API_URL}/courses/lessons/${lessonId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

export const updateLesson = async (lessonId, lessonData) => {
  const res = await fetch(`${API_URL}/courses/lessons/${lessonId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(lessonData),
  });
  return res.json();
};

export const deleteLesson = async (lessonId) => {
  const res = await fetch(`${API_URL}/courses/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const reorderLessons = async (courseId, orderedLessonIds) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/lessons-reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ orderedLessonIds }),
  });
  return res.json();
};

// ==========================================
// Progress
// ==========================================
export const updateProgress = async (lessonId, watchedSeconds, completed = false, force = false) => {
  const res = await fetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`
    },
    body: JSON.stringify({ lessonId, watchedSeconds, completed, force }),
  });
  return res.json();
};

export const getCourseProgress = async (courseId) => {
  const res = await fetch(`${API_URL}/progress/courses/${courseId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

export const getLessonProgress = async (lessonId) => {
  const res = await fetch(`${API_URL}/progress/lessons/${lessonId}`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  });
  return res.json();
};

export const getUserProgressSummary = async () => {
  const res = await fetch(`${API_URL}/progress/summary`, {
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

// ==========================================
// Quiz
// ==========================================
export const getCourseQuiz = async (courseId, manage = false) => {
  const headers = {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const url = manage
    ? `${API_URL}/courses/${courseId}/quiz?manage=true`
    : `${API_URL}/courses/${courseId}/quiz`;
  const res = await fetch(url, { headers });
  return res.json();
};

export const submitCourseQuiz = async (courseId, answers) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ answers }),
  });
  return res.json();
};

export const getQuizAttempts = async (courseId) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/quiz/attempts`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return res.json();
};

export const createQuizQuestion = async (courseId, questionData) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/quiz/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(questionData),
  });
  return res.json();
};

export const updateQuizQuestion = async (questionId, questionData) => {
  const res = await fetch(`${API_URL}/courses/quiz/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(questionData),
  });
  return res.json();
};

export const deleteQuizQuestion = async (questionId) => {
  const res = await fetch(`${API_URL}/courses/quiz/questions/${questionId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  return res.json();
};