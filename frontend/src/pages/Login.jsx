import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await login(email, password);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert('เข้าสู่ระบบสำเร็จ!');
      navigate('/');
      window.location.reload();
    } else {
      alert(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">เข้าสู่ระบบ</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1">อีเมล</label>
          <input 
            type="email" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@demo.com"
            required 
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-1">รหัสผ่าน</label>
          <input 
            type="password" 
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            placeholder="123456"
            required 
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          เข้าสู่ระบบ
        </button>
      </form>
      <p className="mt-4 text-center text-gray-600">
        ยังไม่มีบัญชี? <Link to="/register" className="text-blue-600 hover:underline">สมัครสมาชิก</Link>
      </p>
    </div>
  );
}

export default Login;