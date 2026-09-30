import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Play, Trash2, ArrowRight, Clock, Award } from 'lucide-react';
import { getMyCourses, unenrollCourse } from '../api';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCourses()
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleUnenroll = async (courseId) => {
    if (!confirm('คุณต้องการยกเลิกลงทะเบียนคอร์สนี้ใช่หรือไม่?')) return;

    const data = await unenrollCourse(courseId);
    if (data.message) {
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 pt-12">
        <div className="h-8 w-48 bg-slate-200 rounded-lg animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-100 crimson-shadow space-y-4 animate-pulse">
              <div className="h-44 bg-slate-200 rounded-2xl" />
              <div className="h-5 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
              <div className="h-10 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5 sm:gap-3">
            <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl crimson-gradient text-white flex items-center justify-center text-base sm:text-lg shadow-md shadow-rose-500/20 shrink-0">
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </span>
            <span>คอร์สเรียนของฉัน (My Learning)</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-1.5">
            คอร์สทั้งหมดที่คุณได้ลงทะเบียนไว้ ({courses.length} คอร์ส) ติดตามความคืบหน้าและเรียนรู้ต่อได้ตลอดเวลา
          </p>
        </div>

        <Link
          to="/"
          className="text-sm font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 w-fit"
        >
          <span>สำรวจคอร์สเพิ่มเติม</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border border-rose-100/70 crimson-shadow p-8 max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีคอร์สที่ลงทะเบียน</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
            คุณยังไม่ได้ลงทะเบียนในคอร์สใดๆ เริ่มต้นการเรียนรู้บทเรียนคุณภาพได้ฟรีทันที!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl crimson-gradient text-white font-bold text-sm shadow-md shadow-rose-600/20 hover:opacity-95 transition"
          >
            <span>เลือกดูคอร์สทั้งหมด</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-rose-100/80 overflow-hidden crimson-shadow crimson-shadow-hover flex flex-col group"
            >
              <div className="relative h-48 w-full overflow-hidden bg-slate-900">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-4">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                    กำลังศึกษา
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-rose-600 transition leading-snug">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-500">ผู้สอน: {course.instructor}</p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="w-full py-2.5 px-4 rounded-xl crimson-gradient text-white font-bold text-sm hover:opacity-95 transition flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Play className="w-4 h-4 fill-white text-white" />
                    <span>เข้าห้องเรียน (Learn)</span>
                  </button>
                  <button
                    onClick={() => handleUnenroll(course.id)}
                    className="w-full py-2 px-4 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50/50 hover:border-rose-200 text-xs font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>ยกเลิกลงทะเบียน</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;