import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { getProfile, updateProfile, changePassword } from '../api';

function Profile() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromQuery = searchParams.get('tab');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(
    ['general', 'security'].includes(tabFromQuery) ? tabFromQuery : 'general'
  );

  // General profile form
  const [name, setName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Toast feedback
  const [toast, setToast] = useState(null);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    loadProfile();
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['general', 'security'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      if (data.id) {
        setUser(data);
        setName(data.name || '');
      } else {
        showToast(data.error || 'ไม่สามารถโหลดข้อมูลโปรไฟล์ได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('กรุณากรอกชื่อ-นามสกุล', 'error');
      return;
    }

    setSavingProfile(true);
    try {
      const res = await updateProfile(name);
      if (res.user) {
        setUser({ ...user, name: res.user.name });
        const currentLocal = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentLocal, name: res.user.name }));
        if (res.token) {
          localStorage.setItem('token', res.token);
        }
        showToast('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว');
      } else {
        showToast(res.error || 'บันทึกข้อมูลไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      showToast('กรุณากรอกรหัสผ่านให้ครบทุกช่อง', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('รหัสผ่านใหม่และการยืนยันไม่ตรงกัน', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.message) {
        showToast('เปลี่ยนรหัสผ่านสำเร็จเรียบร้อยแล้ว');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showToast(res.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน', 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <svg className="w-5 h-5 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          กำลังโหลดข้อมูลโปรไฟล์...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-900">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-slate-200 text-sm font-medium text-slate-800">
            {toast.type === 'error' ? (
              <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </span>
            ) : (
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
            )}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                <Link to="/" className="hover:text-slate-800 transition">หน้าหลัก</Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">โปรไฟล์และการตั้งค่า</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                โปรไฟล์และการตั้งค่าบัญชี
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                จัดการข้อมูลส่วนบุคคล สิทธิ์การใช้งาน และความปลอดภัยของบัญชีผู้ใช้
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/my-courses"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                ดูคอร์สของฉัน ({user?.totalEnrollments ?? 0})
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Account Overview & Menu */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-600 text-white text-2xl font-bold flex items-center justify-center mx-auto shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <h2 className="text-base font-bold text-slate-900 mt-3 truncate">
                  {user?.name}
                </h2>
                <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>

                <div className="mt-3 flex items-center justify-center gap-1.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                    user?.role === 'admin'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : user?.role === 'instructor'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {user?.role}
                  </span>
                </div>
              </div>

              {/* Account info meta */}
              <div className="border-t border-slate-100 mt-5 pt-4 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">สถานะบัญชี:</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    เปิดใช้งานปกติ
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">วันที่สมัคร:</span>
                  <span className="font-medium text-slate-700">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : '-'}
                  </span>
                </div>
              </div>

              {/* Navigation Menu */}
              <div className="mt-6 pt-4 border-t border-slate-100 space-y-1">
                <button
                  onClick={() => handleTabChange('general')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition flex items-center gap-2.5 ${
                    activeTab === 'general'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>ข้อมูลส่วนตัว</span>
                </button>

                <button
                  onClick={() => handleTabChange('security')}
                  className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs font-medium transition flex items-center gap-2.5 ${
                    activeTab === 'security'
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  <span>ความปลอดภัยและรหัสผ่าน</span>
                </button>
              </div>
            </div>

            {/* Quick Link Card to My Courses */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-xs font-semibold text-slate-800 block mb-1">
                คอร์สของคุณ
              </span>
              <p className="text-xs text-slate-500 mb-3">
                {user?.totalEnrollments ?? 0} คอร์ส ({user?.inProgressCount ?? 0} กำลังเรียน, {user?.completedCount ?? 0} เรียนจบ)
              </p>
              <Link
                to="/my-courses"
                className="w-full text-center inline-block py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition"
              >
                ดูคอร์สทั้งหมด
              </Link>
            </div>
          </div>

          {/* Right Column: Tab Contents */}
          <div className="md:col-span-2">
            {/* ================= TAB 1: ข้อมูลส่วนตัว ================= */}
            {activeTab === 'general' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-base font-semibold text-slate-900">ข้อมูลส่วนตัว</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    แก้ไขชื่อที่ใช้แสดงผลในระบบและบนใบประกาศนียบัตร
                  </p>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      อีเมล
                    </label>
                    <input
                      type="email"
                      disabled
                      value={user?.email || ''}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      อีเมลสำหรับเข้าสู่ระบบ (ไม่สามารถเปลี่ยนแปลงได้)
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ชื่อ - นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="กรอกชื่อและนามสกุลของคุณ"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      สิทธิ์การใช้งาน (Role)
                    </label>
                    <input
                      type="text"
                      disabled
                      value={user?.role?.toUpperCase() || ''}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      {savingProfile ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          กำลังบันทึก...
                        </>
                      ) : (
                        'บันทึกข้อมูล'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ================= TAB 2: ความปลอดภัย ================= */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-5">
                  <h3 className="text-base font-semibold text-slate-900">เปลี่ยนรหัสผ่าน</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    เพื่อความปลอดภัย แนะนำให้ใช้รหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร
                  </p>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      รหัสผ่านปัจจุบัน <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      รหัสผ่านใหม่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="ความยาวอย่างน้อย 6 ตัวอักษร"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      className="w-full px-3.5 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500 transition"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                    <button
                      type="submit"
                      disabled={savingPassword}
                      className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
                    >
                      {savingPassword ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          กำลังเปลี่ยนรหัสผ่าน...
                        </>
                      ) : (
                        'อัปเดตรหัสผ่านใหม่'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
