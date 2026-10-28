const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// ==========================================
// Token & Auth Helpers
// ==========================================

// ดึง Token โดยกรองค่า null / undefined ที่เป็น string ออกด้วย
export const getToken = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    return null;
  }
  return token;
};

let isHandlingUnauthorized = false;

/**
 * เคลียร์ Token และข้อมูล Session พร้อมแจ้งเตือนระบบ
 * @param {Object} options - { redirect: boolean, expired: boolean }
 */
export const logout = (options = { redirect: true, expired: false }) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  // แจ้งเตือนทุก Component ผ่าน Custom Event
  window.dispatchEvent(new CustomEvent('auth:expired', { detail: { expired: options.expired } }));
  window.dispatchEvent(new CustomEvent('auth:logout'));

  if (options.redirect) {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const fullPath = currentPath + currentSearch;

    // จำ path ปัจจุบันไว้เพื่อให้กลับมาหลัง login ใหม่ (ยกเว้นหน้า login/register)
    if (!currentPath.includes('/login') && !currentPath.includes('/register') && fullPath !== '/') {
      try {
        sessionStorage.setItem('redirectAfterLogin', fullPath);
      } catch (e) {
        // ignore
      }
    }

    const redirectTarget = options.expired ? '/login?expired=1' : '/login';
    if (!window.location.pathname.includes('/login')) {
      window.location.href = redirectTarget;
    }
  }
};

/**
 * จัดการเมื่อ Token หมดอายุหรือไม่ถูกต้อง (HTTP 401)
 */
export const handleUnauthorized = () => {
  if (isHandlingUnauthorized) return;
  isHandlingUnauthorized = true;

  logout({ redirect: true, expired: true });

  setTimeout(() => {
    isHandlingUnauthorized = false;
  }, 2500);
};

/**
 * ฟังก์ชันกลางสำหรับเรียก API
 * - แทรก Authorization Header อัตโนมัติเมื่อมี Token
 * - ดักจับ 401 เพื่อ Auto Logout อัตโนมัติ
 */
export const apiFetch = async (url, options = {}) => {
  const token = getToken();
  const headers = { ...(options.headers || {}) };

  // ส่ง Token เฉพาะเมื่อมี token จริงๆ และยังไม่ได้ระบุ Header Authorization มา
  if (token && !headers['Authorization'] && !headers['authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(url, { ...options, headers });

    // ดักจับ 401 สำหรับทุก endpoint ยกเว้น login/register
    if (res.status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      handleUnauthorized();
    }

    return res;
  } catch (err) {
    console.error('API Fetch error:', err);
    throw err;
  }
};

// ==========================================
// Auth
// ==========================================
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

// ==========================================
// Courses
// ==========================================
export const getCourses = async () => {
  const res = await apiFetch(`${API_URL}/courses`);
  return res.json();
};

export const getCourse = async (id) => {
  const res = await apiFetch(`${API_URL}/courses/${id}`);
  return res.json();
};

export const createCourse = async (courseData) => {
  const res = await apiFetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  return res.json();
};

export const updateCourse = async (id, courseData) => {
  const res = await apiFetch(`${API_URL}/courses/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(courseData),
  });
  return res.json();
};

export const deleteCourse = async (id) => {
  const res = await apiFetch(`${API_URL}/courses/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

// ==========================================
// Enrollments
// ==========================================
export const enrollCourse = async (courseId) => {
  const res = await apiFetch(`${API_URL}/enrollments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ courseId }),
  });
  return res.json();
};

// เช็คว่าลงทะเบียนแล้วหรือยัง
export const checkEnrollment = async (courseId) => {
  if (!getToken()) return { enrolled: false };
  const res = await apiFetch(`${API_URL}/enrollments/check/${courseId}`);
  return res.json();
};

// ดูคอร์สที่ลงทะเบียนไว้
export const getMyCourses = async () => {
  if (!getToken()) return [];
  const res = await apiFetch(`${API_URL}/enrollments/my-courses`);
  return res.json();
};

// ยกเลิกลงทะเบียน
export const unenrollCourse = async (courseId) => {
  const res = await apiFetch(`${API_URL}/enrollments/${courseId}`, {
    method: 'DELETE',
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
  const res = await apiFetch(url);
  return res.json();
};

export const getLesson = async (lessonId) => {
  const res = await apiFetch(`${API_URL}/courses/lessons/${lessonId}`);
  return res.json();
};

export const updateLesson = async (lessonId, lessonData) => {
  const res = await apiFetch(`${API_URL}/courses/lessons/${lessonId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lessonData),
  });
  return res.json();
};

export const deleteLesson = async (lessonId) => {
  const res = await apiFetch(`${API_URL}/courses/lessons/${lessonId}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const reorderLessons = async (courseId, orderedLessonIds) => {
  const res = await apiFetch(`${API_URL}/courses/${courseId}/lessons-reorder`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ orderedLessonIds }),
  });
  return res.json();
};

// ==========================================
// Progress
// ==========================================
export const updateProgress = async (lessonId, watchedSeconds, completed = false, force = false) => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lessonId, watchedSeconds, completed, force }),
  });
  return res.json();
};

export const getCourseProgress = async (courseId) => {
  if (!getToken()) return { percentage: 0, completedLessons: 0, totalLessons: 0 };
  const res = await apiFetch(`${API_URL}/progress/courses/${courseId}`);
  return res.json();
};

export const getLessonProgress = async (lessonId) => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/progress/lessons/${lessonId}`);
  return res.json();
};

export const getUserProgressSummary = async () => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/progress/summary`);
  return res.json();
};

// ==========================================
// Upload
// ==========================================
export const uploadVideo = async (file) => {
  const formData = new FormData();
  formData.append('video', file);

  const res = await apiFetch(`${API_URL}/upload/video`, {
    method: 'POST',
    // ไม่ใส่ Content-Type เพื่อให้ Browser สร้าง Boundary ให้อัตโนมัติ
    body: formData,
  });
  return res.json();
};

// ==========================================
// Create Lesson
// ==========================================
export const createLesson = async (courseId, lessonData) => {
  const res = await apiFetch(`${API_URL}/courses/${courseId}/lessons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(lessonData),
  });
  return res.json();
};

// ==========================================
// Quiz
// ==========================================
export const getCourseQuiz = async (courseId, manage = false) => {
  const url = manage
    ? `${API_URL}/courses/${courseId}/quiz?manage=true`
    : `${API_URL}/courses/${courseId}/quiz`;
  const res = await apiFetch(url);
  return res.json();
};

export const submitCourseQuiz = async (courseId, answers) => {
  const res = await apiFetch(`${API_URL}/courses/${courseId}/quiz/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });
  return res.json();
};

export const getQuizAttempts = async (courseId) => {
  const res = await apiFetch(`${API_URL}/courses/${courseId}/quiz/attempts`);
  return res.json();
};

export const createQuizQuestion = async (courseId, questionData) => {
  const res = await apiFetch(`${API_URL}/courses/${courseId}/quiz/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });
  return res.json();
};

export const updateQuizQuestion = async (questionId, questionData) => {
  const res = await apiFetch(`${API_URL}/courses/quiz/questions/${questionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(questionData),
  });
  return res.json();
};

export const deleteQuizQuestion = async (questionId) => {
  const res = await apiFetch(`${API_URL}/courses/quiz/questions/${questionId}`, {
    method: 'DELETE',
  });
  return res.json();
};

// ==========================================
// Notifications API
// ==========================================
export const getNotifications = async () => {
  if (!getToken()) return { notifications: [], unreadCount: 0 };
  const res = await apiFetch(`${API_URL}/notifications`);
  return res.json();
};

export const markNotificationAsRead = async (id) => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/notifications/${id}/read`, {
    method: 'PATCH',
  });
  return res.json();
};

export const markAllNotificationsAsRead = async () => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/notifications/read-all`, {
    method: 'PATCH',
  });
  return res.json();
};

export const deleteNotification = async (id) => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/notifications/${id}`, {
    method: 'DELETE',
  });
  return res.json();
};

export const clearAllNotifications = async () => {
  if (!getToken()) return null;
  const res = await apiFetch(`${API_URL}/notifications`, {
    method: 'DELETE',
  });
  return res.json();
};