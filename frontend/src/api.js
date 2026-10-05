const API_URL = 'http://localhost:3001/api';

// ฟังก์ชันเรียก API ต่างๆ
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

export const getCourses = async () => {
  const res = await fetch(`${API_URL}/courses`);
  return res.json();
};

export const getCourse = async (id) => {
  const res = await fetch(`${API_URL}/courses/${id}`);
  return res.json();
};

export const getStats = async () => {
  const res = await fetch(`${API_URL}/stats`);
  return res.json();
};

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Admin APIs
export const getAdminUsers = async () => {
  const res = await fetch(`${API_URL}/admin/users`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateUserRole = async (userId, role) => {
  const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ role }),
  });
  return res.json();
};

export const deleteUser = async (userId) => {
  const res = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const createCourse = async (courseData) => {
  const res = await fetch(`${API_URL}/courses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });
  return res.json();
};

export const updateCourse = async (courseId, courseData) => {
  const res = await fetch(`${API_URL}/courses/${courseId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });
  return res.json();
};

export const deleteCourse = async (courseId) => {
  const res = await fetch(`${API_URL}/courses/${courseId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const getInstructorCourses = async () => {
  const res = await fetch(`${API_URL}/courses/instructor/managed`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

// Profile APIs
export const getProfile = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateProfile = async (name) => {
  const res = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name }),
  });
  return res.json();
};

export const changePassword = async (currentPassword, newPassword) => {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return res.json();
};

export const enrollCourse = async (courseId) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/enroll`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  return res.json();
};

export const updateCourseProgress = async (courseId, data) => {
  const res = await fetch(`${API_URL}/courses/${courseId}/progress`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
};


