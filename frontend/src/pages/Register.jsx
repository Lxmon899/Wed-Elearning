import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = await register(form.email, form.password, form.name);
    if (data.error) {
      alert(data.error);
    } else {
      alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
      navigate('/login');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 border rounded-xl shadow-lg bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">สมัครสมาชิก</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input 
          className="w-full p-3 border rounded-lg"
          placeholder="ชื่อ-นามสกุล"
          value={form.name}
          onChange={e => setForm({...form, name: e.target.value})}
          required
        />
        <input 
          className="w-full p-3 border rounded-lg"
          type="email" 
          placeholder="อีเมล"
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          required
        />
        <input 
          className="w-full p-3 border rounded-lg"
          type="password" 
          placeholder="รหัสผ่าน"
          value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          required
        />
        <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700">
          สมัครสมาชิก
        </button>
      </form>
      <p className="mt-4 text-center">
        มีบัญชีแล้ว? <Link to="/login" className="text-blue-600 hover:underline">เข้าสู่ระบบ</Link>
      </p>
    </div>
  );
}

export default Register;