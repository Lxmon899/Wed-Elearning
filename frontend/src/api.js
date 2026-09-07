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