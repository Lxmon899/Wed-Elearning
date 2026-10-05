import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, updateCourseProgress } from '../api';

function MyCourses() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState('all'); // 'all' | 'in_progress' | 'completed'
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
    loadCourses();
  }, []);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getProfile();
      if (data.id) {
        setUser(data);
      } else {
        showToast(data.error || 'ไม่สามารถโหลดข้อมูลคอร์สได้', 'error');
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการโหลดข้อมูล', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ทำเครื่องหมายว่าเรียนจบแล้ว
  const handleMarkAsCompleted = async (courseId) => {
    try {
      const res = await updateCourseProgress(courseId, {
        status: 'completed',
        progress: 100,
        isReviewing: false,
      });
      if (res.enrollment) {
        showToast('ยินดีด้วย! คุณเรียนจบคอร์สนี้เรียบร้อยแล้ว');
        loadCourses();
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการอัปเดตสถานะ', 'error');
    }
  };

  // เริ่มเรียนซ้ำ (เข้าสู่โหมดกำลังทบทวน โดยคงสถานะเรียนเสร็จไว้)
  const handleStartReview = async (courseId) => {
    try {
      const res = await updateCourseProgress(courseId, {
        status: 'completed', // คงสถานะเรียนเสร็จไว้
        isReviewing: true,   // เปิดโหมดกำลังทบทวน
        reviewProgress: 20,  // เริ่มต้นทบทวน 20%
      });
      if (res.enrollment) {
        showToast('เริ่มเรียนซ้ำ: เข้าสู่โหมดกำลังทบทวน');
        loadCourses();
      }
    } catch {
      showToast('เกิดข้อผิดพลาดในการเริ่มทบทวน', 'error');
    }
  };

  // สิ้นสุดการทบทวน
  const handleFinishReview = async (courseId) => {
    try {
      const res = await updateCourseProgress(courseId, {
        status: 'completed',
        isReviewing: false,
        reviewProgress: 100,
      });
      if (res.enrollment) {
        showToast('ทบทวนเนื้อหาเสร็จสมบูรณ์');
        loadCourses();
      }
    } catch {
      showToast('เกิดข้อผิดพลาด', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 text-sm">
          <svg className="w-5 h-5 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          กำลังโหลดคอร์สเรียนของคุณ...
        </div>
      </div>
    );
  }

  const allEnrollments = user?.enrollments || [];
  const inProgressList = user?.inProgressCourses || [];
  const completedList = user?.completedCourses || [];

  const displayedCourses = allEnrollments.filter((item) => {
    if (courseFilter === 'in_progress') return item.status !== 'completed';
    if (courseFilter === 'completed') return item.status === 'completed';
    return true;
  });

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
                <span className="text-slate-800 font-medium">คอร์สของฉัน</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                คอร์สของฉัน
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                รายการคอร์สทั้งหมดที่คุณลงทะเบียนเรียนไว้
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/profile"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200/80 transition"
              >
                <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                โปรไฟล์และการตั้งค่า
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block font-medium">ลงทะเบียนทั้งหมด</span>
                <span className="text-xl font-bold text-slate-900 mt-0.5 block">{user?.totalEnrollments ?? 0} คอร์ส</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
            </div>

            <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-amber-700 block font-medium">กำลังเรียน</span>
                <span className="text-xl font-bold text-amber-900 mt-0.5 block">{user?.inProgressCount ?? 0} คอร์ส</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white border border-amber-200 text-amber-700 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-200/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-emerald-700 block font-medium">เรียนจบแล้ว</span>
                <span className="text-xl font-bold text-emerald-900 mt-0.5 block">{user?.completedCount ?? 0} คอร์ส</span>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          {/* Filter Pills */}
          <div className="border-b border-slate-100 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                รายการคอร์ส ({displayedCourses.length})
              </h2>
            </div>

            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              {[
                { id: 'all', label: `ทั้งหมด (${allEnrollments.length})` },
                { id: 'in_progress', label: `กำลังเรียน (${inProgressList.length})` },
                { id: 'completed', label: `เรียนเสร็จ (${completedList.length})` },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setCourseFilter(f.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                    courseFilter === f.id
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 bg-slate-100 hover:bg-slate-200/70'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {displayedCourses.length === 0 ? (
            <div className="text-center py-14 px-4">
              <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">
                {courseFilter === 'completed'
                  ? 'ยังไม่มีคอร์สที่เรียนเสร็จ'
                  : courseFilter === 'in_progress'
                  ? 'ไม่มีคอร์สที่กำลังเรียนอยู่'
                  : 'ยังไม่ได้ลงทะเบียนคอร์สใดๆ'}
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                เลือกคอร์สที่สนใจในหน้าแรกและเริ่มเรียนเพื่อพัฒนาทักษะของคุณ
              </p>
              <Link
                to="/"
                className="mt-4 inline-flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition shadow-xs"
              >
                สำรวจคอร์สเรียนทั้งหมด
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {displayedCourses.map((item) => {
                const isCompleted = item.status === 'completed';
                const isReviewing = item.isReviewing;

                return (
                  <div
                    key={item.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <img
                        src={item.course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                        alt={item.course.title}
                        className="w-20 h-14 rounded-lg object-cover border border-slate-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        {/* Title & Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            to={`/course/${item.course.id}`}
                            className="font-semibold text-sm text-slate-900 hover:text-emerald-700 transition truncate max-w-sm"
                          >
                            {item.course.title}
                          </Link>

                          {/* สถานะบอก: กำลังเรียนอยู่ (ไม่ใช่ปุ่มกดคลิก เป็นแค่สถานะ) */}
                          {!isCompleted && (
                            <span className="select-none px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
                              กำลังเรียนอยู่
                            </span>
                          )}

                          {/* สถานะบอก: เรียนเสร็จแล้ว (คงสถานะเรียนเสร็จไว้) */}
                          {isCompleted && (
                            <span className="select-none px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                              ✓ เรียนเสร็จแล้ว
                            </span>
                          )}

                          {/* ตัวหนังสือช่องเพิ่มขึ้นมา: กำลังทบทวน (กรณีเรียนเสร็จแล้วและมีการเรียนซ้ำ) */}
                          {isCompleted && isReviewing && (
                            <span className="select-none px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                              กำลังทบทวน
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>สอนโดย {item.course.instructor}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.course.duration || '3 ชม.'}
                          </span>
                        </div>

                        {/* Progress bar สำหรับคอร์สกำลังเรียนอยู่ */}
                        {!isCompleted && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-xs">
                              <div
                                className="bg-amber-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(item.progress, 15)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-medium text-slate-500">
                              {item.progress}%
                            </span>
                          </div>
                        )}

                        {/* โชว์ Progress ที่เรียน เมื่อกำลังทบทวน (เรียนซ้ำ) */}
                        {isCompleted && isReviewing && (
                          <div className="mt-2.5 flex items-center gap-2">
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden max-w-xs">
                              <div
                                className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${Math.max(item.reviewProgress || 20, 20)}%` }}
                              />
                            </div>
                            <span className="text-[11px] font-semibold text-sky-600">
                              ทบทวนไปแล้ว {item.reviewProgress || 20}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      {/* กรณียังไม่จบ: มีปุ่มทำเครื่องหมายจบ และเข้าเรียนต่อ */}
                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => handleMarkAsCompleted(item.course.id)}
                            className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition"
                            title="ทำเครื่องหมายว่าเรียนจบคอร์สแล้ว"
                          >
                            ✓ ทำเครื่องหมายว่าจบ
                          </button>
                          <Link
                            to={`/course/${item.course.id}`}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition"
                          >
                            เข้าเรียนต่อ
                          </Link>
                        </>
                      )}

                      {/* กรณีเรียนเสร็จแล้ว และไม่ได้กำลังทบทวน: มีปุ่มกด "เรียนซ้ำ" และ "ดูคอร์ส" */}
                      {isCompleted && !isReviewing && (
                        <>
                          <button
                            onClick={() => handleStartReview(item.course.id)}
                            className="px-3 py-1.5 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition"
                            title="เริ่มเรียนซ้ำเพื่อทบทวนบทเรียน"
                          >
                            เรียนซ้ำ
                          </button>
                          <Link
                            to={`/course/${item.course.id}`}
                            className="px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          >
                            ดูเนื้อหา
                          </Link>
                        </>
                      )}

                      {/* กรณีเรียนเสร็จแล้ว และกำลังทบทวนอยู่: มีปุ่ม "เข้าทบทวนต่อ" และ "เสร็จสิ้นทบทวน" */}
                      {isCompleted && isReviewing && (
                        <>
                          <button
                            onClick={() => handleFinishReview(item.course.id)}
                            className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            title="เสร็จสิ้นการทบทวน"
                          >
                            จบการทบทวน
                          </button>
                          <Link
                            to={`/course/${item.course.id}`}
                            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition"
                          >
                            เข้าทบทวนต่อ
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyCourses;
