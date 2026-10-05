import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getInstructorCourses, createCourse, updateCourse, deleteCourse } from '../api';

function InstructorDashboard() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalStudents: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Course Modal (Create & Edit)
  const [showModal, setShowModal] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    thumbnail: '',
    price: 0,
    duration: '3 ชม. 30 นาที',
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (text, type = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!currentUser || (currentUser.role !== 'instructor' && currentUser.role !== 'admin')) {
      navigate('/');
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getInstructorCourses();
      if (res.courses) {
        setCourses(res.courses);
        setStats(res.stats || { totalCourses: 0, totalStudents: 0 });
      } else {
        showToast(res.error || 'ไม่สามารถโหลดข้อมูลคอร์สได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingCourseId(null);
    setCourseForm({
      title: '',
      description: '',
      thumbnail: '',
      price: 0,
      duration: '3 ชม. 30 นาที',
    });
    setShowModal(true);
  };

  const openEditModal = (course) => {
    setEditingCourseId(course.id);
    setCourseForm({
      title: course.title,
      description: course.description || '',
      thumbnail: course.thumbnail || '',
      price: course.price || 0,
      duration: course.duration || '3 ชม. 30 นาที',
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title.trim()) {
      showToast('กรุณากรอกชื่อคอร์สเรียน', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingCourseId) {
        // Edit course
        const res = await updateCourse(editingCourseId, {
          ...courseForm,
          instructor: currentUser.name,
        });
        if (res.id) {
          showToast('บันทึกการแก้ไขคอร์สเรียบร้อย');
          setShowModal(false);
          loadData();
        } else {
          showToast(res.error || 'แก้ไขคอร์สไม่สำเร็จ', 'error');
        }
      } else {
        // Create new course
        const res = await createCourse({
          ...courseForm,
          instructor: currentUser.name,
        });
        if (res.id) {
          showToast('สร้างคอร์สใหม่เรียบร้อยแล้ว');
          setShowModal(false);
          loadData();
        } else {
          showToast(res.error || 'สร้างคอร์สไม่สำเร็จ', 'error');
        }
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคอร์ส "${courseTitle}"?`)) {
      return;
    }

    try {
      const res = await deleteCourse(courseId);
      if (res.message) {
        showToast('ลบคอร์สเรียบร้อยแล้ว');
        loadData();
      } else {
        showToast(res.error || 'ลบคอร์สไม่สำเร็จ', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการลบคอร์ส', 'error');
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5">
                <Link to="/" className="hover:text-slate-800 transition">หน้าหลัก</Link>
                <span>/</span>
                <span className="text-slate-800 font-medium">จัดการการสอน</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                จัดการการสอน
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                สร้างคอร์สใหม่ แก้ไขเนื้อหา และตรวจสอบจำนวนผู้เรียนในคอร์สของคุณ
              </p>
            </div>

            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              สร้างคอร์สใหม่
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">คอร์สที่เปิดสอน</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{stats.totalCourses} คอร์ส</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">ผู้เรียนทั้งหมด</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{stats.totalStudents} คน</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">บทบาทของคุณ</span>
                <span className="text-base font-bold text-blue-700 mt-0.5 block uppercase">
                  {currentUser?.role}
                </span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                PRO
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header & Search */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                คอร์สเรียนที่คุณจัดการ ({filteredCourses.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                แก้ไขข้อมูลคอร์ส และติดตามผู้ลงทะเบียนเรียน
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาชื่อคอร์ส..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-slate-400"
              />
              <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">
              กำลังโหลดข้อมูลคอร์ส...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">ยังไม่มีคอร์สในระบบ</h3>
              <p className="text-xs text-slate-400 mt-1">
                คลิกปุ่ม &quot;สร้างคอร์สใหม่&quot; ด้านบนเพื่อเริ่มเปิดการสอน
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-5 py-3">คอร์ส</th>
                    <th className="px-5 py-3">ราคา</th>
                    <th className="px-5 py-3">ระยะเวลา</th>
                    <th className="px-5 py-3 text-center">ผู้เรียน</th>
                    <th className="px-5 py-3 text-right">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={c.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                            alt={c.title}
                            className="w-14 h-10 rounded-md object-cover border border-slate-100 shrink-0"
                          />
                          <div className="min-w-0">
                            <Link
                              to={`/course/${c.id}`}
                              className="font-semibold text-slate-900 hover:text-emerald-700 transition truncate block max-w-sm"
                            >
                              {c.title}
                            </Link>
                            <span className="text-[11px] text-slate-400 block truncate max-w-sm mt-0.5">
                              {c.description || 'ไม่มีคำอธิบาย'}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-medium text-slate-800">
                        {c.price === 0 ? (
                          <span className="text-emerald-600 font-semibold">ฟรี</span>
                        ) : (
                          `฿${c.price.toLocaleString()}`
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-500">
                        {c.duration || '3 ชม.'}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          {c._count?.enrollments ?? 0} คน
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/course/${c.id}`}
                            className="px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded transition"
                          >
                            ดูหน้าคอร์ส
                          </Link>
                          <button
                            onClick={() => openEditModal(c)}
                            className="px-2.5 py-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="px-2.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 rounded transition"
                          >
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create / Edit Course Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-lg w-full p-6 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourseId ? 'แก้ไขข้อมูลคอร์ส' : 'สร้างคอร์สเรียนใหม่'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 mt-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  ชื่อคอร์สเรียน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="เช่น พื้นฐานการพัฒนาเว็บด้วย React"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  คำอธิบายคอร์ส
                </label>
                <textarea
                  rows={3}
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="สรุปเนื้อหาและสิ่งที่จะได้เรียนรู้ในคอร์สนี้..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ราคา (บาท) - 0 คือเรียนฟรี
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={courseForm.price}
                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    ระยะเวลาของคอร์ส
                  </label>
                  <input
                    type="text"
                    value={courseForm.duration}
                    onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                    placeholder="เช่น 3 ชม. 30 นาที"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  URL ภาพหน้าปก (Thumbnail)
                </label>
                <input
                  type="url"
                  value={courseForm.thumbnail}
                  onChange={(e) => setCourseForm({ ...courseForm, thumbnail: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  หากเว้นว่าง ระบบจะใช้ภาพเริ่มต้นที่เหมาะสม
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition disabled:opacity-50"
                >
                  {submitting
                    ? 'กำลังบันทึก...'
                    : editingCourseId
                    ? 'บันทึกการแก้ไข'
                    : 'สร้างคอร์ส'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default InstructorDashboard;
