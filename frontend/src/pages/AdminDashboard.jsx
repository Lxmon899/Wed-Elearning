import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getAdminUsers, updateUserRole, deleteUser, getStats, getCourses, createCourse, deleteCourse } from '../api';

function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'courses'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [courseSearch, setCourseSearch] = useState('');

  // Course Modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    instructor: '',
    thumbnail: '',
    price: 0,
    duration: '3 ชม. 30 นาที',
  });
  const [submittingCourse, setSubmittingCourse] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      return;
    }
    loadData();
  }, []);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, usersData, coursesData] = await Promise.all([
        getStats(),
        getAdminUsers(),
        getCourses(),
      ]);

      if (statsData) setStats(statsData);
      if (Array.isArray(usersData)) setUsers(usersData);
      if (Array.isArray(coursesData)) setCourses(coursesData);
    } catch (err) {
      console.error(err);
      showToast('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await updateUserRole(userId, newRole);
      if (res.user) {
        setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
        showToast(`เปลี่ยนบทบาทเป็น ${newRole} สำเร็จ`);
      } else {
        showToast(res.error || 'เปลี่ยนบทบาทไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเปลี่ยนบทบาท', 'error');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`ยืนยันการลบบัญชีผู้ใช้ ${userName}?`)) {
      return;
    }

    try {
      const res = await deleteUser(userId);
      if (res.message) {
        setUsers(users.filter(u => u.id !== userId));
        showToast(`ลบบัญชี ${userName} เรียบร้อย`);
      } else {
        showToast(res.error || 'ลบผู้ใช้ไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบผู้ใช้', 'error');
    }
  };

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.title.trim() || !newCourse.instructor.trim()) {
      showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน', 'error');
      return;
    }

    setSubmittingCourse(true);
    try {
      const res = await createCourse(newCourse);
      if (res.id) {
        showToast('เพิ่มคอร์สเรียนเรียบร้อยแล้ว');
        setShowCourseModal(false);
        setNewCourse({ title: '', description: '', instructor: '', thumbnail: '', price: 0 });
        const [updatedCourses, updatedStats] = await Promise.all([getCourses(), getStats()]);
        setCourses(updatedCourses);
        setStats(updatedStats);
      } else {
        showToast(res.error || 'สร้างคอร์สไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการสร้างคอร์ส', 'error');
    } finally {
      setSubmittingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`ยืนยันการลบคอร์ส "${courseTitle}"?`)) {
      return;
    }

    try {
      const res = await deleteCourse(courseId);
      if (res.message) {
        setCourses(courses.filter(c => c.id !== courseId));
        showToast(`ลบคอร์ส "${courseTitle}" สำเร็จ`);
      } else {
        showToast(res.error || 'ลบคอร์สไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบคอร์ส', 'error');
    }
  };

  // Unauthorized screen
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 bg-white">
        <div className="max-w-sm w-full text-center">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-gray-900">ไม่มีสิทธิ์เข้าถึง</h2>
          <p className="text-sm text-gray-500 mt-1 mb-6">บัญชีนี้ไม่มีสิทธิ์เข้าใช้งานระบบจัดการแอดมิน</p>
          <Link
            to="/"
            className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    );
  }

  // Filter logic
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                          u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.instructor.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 pb-20">
      {/* Toast Notification (clean, no emojis) */}
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
      <div className="bg-white border-b border-slate-200/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link to="/" className="hover:text-slate-800 transition">หน้าหลัก</Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">ระบบจัดการ</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                ระบบจัดการแอดมิน
              </h1>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={loadData}
                disabled={loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition"
              >
                <svg className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                อัปเดตข้อมูล
              </button>
            </div>
          </div>

          {/* Metric Cards (Clean, professional, single accent) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6">
            <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-500">ผู้ใช้ทั้งหมด</span>
              <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {loading ? '-' : users.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                นักเรียน {users.filter(u => u.role === 'student').length} • แอดมิน {users.filter(u => u.role === 'admin').length}
              </span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-500">ผู้สอน</span>
              <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {loading ? '-' : (stats?.totalInstructors ?? users.filter(u => u.role === 'instructor').length)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">จากคอร์สทั้งหมด</span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-500">คอร์สทั้งหมด</span>
              <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {loading ? '-' : courses.length}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">เผยแพร่อยู่</span>
            </div>

            <div className="bg-slate-50/70 border border-slate-200/70 rounded-xl p-4">
              <span className="text-xs font-medium text-slate-500">การลงทะเบียน</span>
              <div className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
                {loading ? '-' : (stats?.totalEnrollments ?? 0)}
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">ทั้งหมดในระบบ</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Underline style like modern SaaS) */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex space-x-8 -mb-px">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>จัดการผู้ใช้งาน</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'users' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {users.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition flex items-center gap-2 ${
                activeTab === 'courses'
                  ? 'border-emerald-600 text-emerald-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <span>จัดการคอร์สเรียน</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'courses' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {courses.length}
              </span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6">
        {/* ================= TAB 1: USERS ================= */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ หรืออีเมล..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-1">
                {[
                  { id: 'all', label: 'ทั้งหมด' },
                  { id: 'student', label: 'ผู้เรียน' },
                  { id: 'instructor', label: 'ผู้สอน' },
                  { id: 'admin', label: 'แอดมิน' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setRoleFilter(item.id)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                      roleFilter === item.id
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* User Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">ชื่อ - สกุล / อีเมล</th>
                    <th className="px-5 py-3">บทบาท (Role)</th>
                    <th className="px-5 py-3 text-center">คอร์สที่เรียน</th>
                    <th className="px-5 py-3">วันที่เข้าร่วม</th>
                    <th className="px-5 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                        ไม่พบข้อมูลสมาชิก
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isSelf = u.id === currentUser.id;
                      return (
                        <tr key={u.id} className="hover:bg-slate-50/60 transition">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-medium text-xs">
                                {u.name?.charAt(0)?.toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 flex items-center gap-1.5">
                                  {u.name}
                                  {isSelf && (
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      (บัญชีนี้)
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-slate-500">{u.email}</div>
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-3.5">
                            <select
                              value={u.role}
                              disabled={isSelf}
                              onChange={(e) => handleRoleChange(u.id, e.target.value)}
                              className={`text-xs font-medium py-1 px-2.5 rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-slate-400 cursor-pointer ${
                                isSelf ? 'opacity-60 cursor-not-allowed bg-slate-50' : ''
                              }`}
                            >
                              <option value="student">Student</option>
                              <option value="instructor">Instructor</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>

                          <td className="px-5 py-3.5 text-center text-slate-600 text-xs">
                            {u._count?.enrollments ?? 0}
                          </td>

                          <td className="px-5 py-3.5 text-xs text-slate-500">
                            {new Date(u.createdAt).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>

                          <td className="px-5 py-3.5 text-right">
                            {isSelf ? (
                              <span className="text-xs text-slate-300">-</span>
                            ) : (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded transition"
                              >
                                ลบ
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: COURSES ================= */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Toolbar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="ค้นหาคอร์ส หรือผู้สอน..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <button
                onClick={() => setShowCourseModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                เพิ่มคอร์สใหม่
              </button>
            </div>

            {/* Courses Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3">คอร์สเรียน</th>
                    <th className="px-5 py-3">ผู้สอน</th>
                    <th className="px-5 py-3">ราคา</th>
                    <th className="px-5 py-3">วันที่สร้าง</th>
                    <th className="px-5 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-10 text-center text-sm text-slate-400">
                        ไม่พบคอร์สเรียน
                      </td>
                    </tr>
                  ) : (
                    filteredCourses.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60'}
                              alt={c.title}
                              className="w-10 h-7 rounded object-cover border border-slate-200"
                            />
                            <div>
                              <Link
                                to={`/course/${c.id}`}
                                className="font-medium text-slate-900 hover:text-emerald-700 transition"
                              >
                                {c.title}
                              </Link>
                              <div className="text-xs text-slate-400 line-clamp-1 max-w-sm">{c.description || 'ไม่มีรายละเอียด'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-700 font-medium">
                          <div>{c.instructor}</div>
                          <div className="text-[11px] text-slate-400 font-normal mt-0.5">⏱️ {c.duration || '3 ชม.'}</div>
                        </td>

                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                          {c.price === 0 ? 'ฟรี' : `฿${c.price.toLocaleString()}`}
                        </td>

                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>

                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/course/${c.id}`}
                              className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded transition"
                            >
                              ดูหน้าร้าน
                            </Link>
                            <button
                              onClick={() => handleDeleteCourse(c.id, c.title)}
                              className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded transition"
                            >
                              ลบ
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ================= MODAL: เพิ่มคอร์สเรียนใหม่ ================= */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">เพิ่มคอร์สเรียนใหม่</h3>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อคอร์สเรียน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น พัฒนา Web ด้วย React"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  ชื่อผู้สอน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น อ. สมชาย"
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ราคา (บาท)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newCourse.price}
                    onChange={(e) => setNewCourse({ ...newCourse, price: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    ระยะเวลาคอร์ส
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 3 ชม. 30 นาที"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  URL รูปภาพปก
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={newCourse.thumbnail}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnail: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  รายละเอียดของคอร์ส
                </label>
                <textarea
                  rows="3"
                  placeholder="อธิบายเนื้อหาและสิ่งที่ผู้เรียนจะได้รับ..."
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-3.5 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submittingCourse}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition"
                >
                  {submittingCourse ? 'กำลังบันทึก...' : 'บันทึก'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
