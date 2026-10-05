import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = await register(form.email, form.password, form.name);
      if (data.error) {
        setError(data.error);
      } else {
        navigate('/login');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-emerald-50/50 to-white">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">สร้างบัญชีใหม่</h1>
          <p className="text-gray-500 mt-1">สมัครฟรี เริ่มเรียนรู้ได้ทันที</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slide-down">
              <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ชื่อ-นามสกุล</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-200"
                placeholder="สมชาย ใจดี"
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">อีเมล</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-200"
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">รหัสผ่าน</label>
              <input
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 placeholder-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition-all duration-200"
                type="password"
                placeholder="อย่างน้อย 6 ตัวอักษร"
                value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  กำลังสมัคร...
                </>
              ) : (
                'สมัครสมาชิก'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-4 text-xs text-gray-400 text-center leading-relaxed">
            การสมัครสมาชิก หมายความว่าคุณยอมรับ
            <span className="text-emerald-600 cursor-pointer"> เงื่อนไขการใช้งาน </span>
            และ
            <span className="text-emerald-600 cursor-pointer"> นโยบายความเป็นส่วนตัว </span>
          </p>
        </div>

        {/* Bottom link */}
        <p className="mt-6 text-center text-sm text-gray-500">
          มีบัญชีแล้ว?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 transition">
            เข้าสู่ระบบ
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;