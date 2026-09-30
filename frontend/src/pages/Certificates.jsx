import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  CheckCircle2,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  Compass,
  Search,
  ExternalLink,
} from 'lucide-react';
import { getMyCourses, getCourseProgress } from '../api';
import CertificateModal from '../components/CertificateModal';

function Certificates() {
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCourseForCert, setSelectedCourseForCert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const coursesData = await getMyCourses();
      if (Array.isArray(coursesData)) {
        setCourses(coursesData);

        const progressPromises = coursesData.map(async (course) => {
          try {
            const prog = await getCourseProgress(course.id);
            return { courseId: course.id, ...prog };
          } catch {
            return { courseId: course.id, percentage: 0, completedLessons: 0, totalLessons: 0 };
          }
        });

        const progressResults = await Promise.all(progressPromises);
        const map = {};
        progressResults.forEach((p) => {
          map[p.courseId] = p;
        });
        setProgressMap(map);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // แยกคอร์สที่จบแล้ว (มีสิทธิ์รับใบประกาศ) และคอร์สที่กำลังเรียน
  const { completedCourses, inProgressCourses } = useMemo(() => {
    const completed = [];
    const inProgress = [];

    courses.forEach((c) => {
      const prog = progressMap[c.id]?.percentage || 0;
      if (prog >= 100) {
        completed.push(c);
      } else {
        inProgress.push(c);
      }
    });

    return { completedCourses: completed, inProgressCourses: inProgress };
  }, [courses, progressMap]);

  // กรองตามคำค้นหา
  const filteredCompleted = useMemo(() => {
    if (!searchQuery.trim()) return completedCourses;
    const q = searchQuery.toLowerCase();
    return completedCourses.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        c.instructor?.toLowerCase().includes(q)
    );
  }, [completedCourses, searchQuery]);

  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 crimson-shadow text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <Award className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-slate-500 text-sm">
              เข้าสู่ระบบเพื่อดูและดาวน์โหลดใบประกาศนียบัตรของคุณ
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl crimson-gradient text-white font-bold text-sm shadow-md shadow-rose-600/20 hover:opacity-95 transition"
            >
              เข้าสู่ระบบ (Sign In)
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* 1. Header Banner */}
      <section className="bg-gradient-to-b from-rose-50/80 via-white to-slate-50 border-b border-rose-100/60 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 mb-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold tracking-wide w-fit">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>ใบรับรองทักษะวิชาชีพ (Official Certificates)</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  ใบประกาศนียบัตรของฉัน <span className="text-rose-600">({completedCourses.length})</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
                  ดาวน์โหลด พิมพ์เอกสาร PDF หรือแชร์ความสำเร็จของคุณเพื่อเป็นหลักฐานยืนยันความเชี่ยวชาญ
                </p>
              </div>

              {/* Quick Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาใบประกาศตามชื่อคอร์ส..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* Highlights Widget */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-2">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">ใบประกาศที่ได้รับ</p>
                <p className="text-2xl font-black text-slate-900">{completedCourses.length} ใบ</p>
                <p className="text-[11px] text-slate-500 mt-0.5">ผ่านการรับรองความรู้แล้ว</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">คอร์สที่กำลังเรียนอยู่</p>
                <p className="text-2xl font-black text-slate-900">{inProgressCourses.length} คอร์ส</p>
                <p className="text-[11px] text-slate-500 mt-0.5">รอรับใบประกาศเมื่อเรียนครบ</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400">การรับรองอย่างเป็นทางการ</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">Crimson Academy</p>
                <p className="text-[11px] text-emerald-600 font-bold mt-0.5">พร้อม Verification ID</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Earned Certificates Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>ใบประกาศนียบัตรที่สำเร็จแล้ว</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              {filteredCompleted.length} รายการ
            </span>
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-100 p-6 space-y-4 animate-pulse shadow-xs"
              >
                <div className="w-full h-44 bg-slate-200 rounded-2xl" />
                <div className="h-6 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : filteredCompleted.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-100/80 p-8 crimson-shadow max-w-xl mx-auto space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
              <Award className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                ยังไม่มีใบประกาศนียบัตรที่สำเร็จ
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                เรียนให้จบคอร์สที่ลงทะเบียนไว้ครบ 100% เพื่อปลดล็อกใบประกาศนียบัตรรับรองทักษะ
              </p>
            </div>
            <Link
              to="/my-courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 hover:opacity-95 transition"
            >
              <span>ไปที่คอร์สของฉันเพื่อเรียนต่อ</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompleted.map((course) => {
              const certId = `CRIMSON-CERT-${course.id.toString().padStart(4, '0')}-${user?.id || 1}`;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-rose-100 overflow-hidden crimson-shadow crimson-shadow-hover flex flex-col group transition duration-300"
                >
                  {/* Certificate Mockup Preview Banner */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-900 via-rose-950 to-slate-900 p-5 flex flex-col justify-between overflow-hidden border-b border-rose-100">
                    <div className="absolute inset-0 bg-[radial-gradient(#F43F5E_1px,transparent_1px)] [background-size:16px_16px] opacity-15" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-400" />
                        <span>Verified Credential</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {certId}
                      </span>
                    </div>

                    <div className="relative z-10 text-center my-auto">
                      <p className="text-[11px] text-rose-300 font-medium uppercase tracking-widest">
                        Certificate of Completion
                      </p>
                      <h4 className="text-white font-extrabold text-base line-clamp-1 mt-1">
                        {course.title}
                      </h4>
                      <p className="text-slate-300 text-xs mt-0.5">
                        มอบให้แก่: <span className="text-white font-bold">{user?.name}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/10 pt-2 relative z-10">
                      <span>ผู้สอน: {course.instructor}</span>
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> สำเร็จแล้ว
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500">
                        ผู้สอน: <span className="font-semibold text-slate-700">{course.instructor}</span>
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCourseForCert(course)}
                        className="flex-1 py-2.5 px-3 rounded-xl crimson-gradient text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Award className="w-4 h-4" />
                        <span>เปิดดู & ดาวน์โหลด</span>
                      </button>

                      <Link
                        to={`/course/${course.id}`}
                        className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                        title="ดูรายละเอียดคอร์ส"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 3. In Progress Courses (Next to Unlock) */}
        {inProgressCourses.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate-200">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <span>คอร์สที่กำลังเรียน (ใกล้ได้รับใบประกาศ)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                  {inProgressCourses.length} คอร์ส
                </span>
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                เรียนบทเรียนที่เหลือให้ครบ 100% เพื่อปลดล็อกใบประกาศนียบัตรของคุณ
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressCourses.map((course) => {
                const prog = progressMap[course.id] || { percentage: 0 };

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 transition hover:border-rose-200"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-500">ความคืบหน้า</span>
                        <span className="font-extrabold text-rose-600">{prog.percentage}%</span>
                      </div>

                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="crimson-gradient h-full rounded-full transition-all duration-700"
                          style={{ width: `${prog.percentage}%` }}
                        />
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-800 line-clamp-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        ผู้สอน: {course.instructor}
                      </p>
                    </div>

                    <Link
                      to={`/learn/${course.id}`}
                      className="w-full py-2 px-4 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50/60 font-bold text-xs sm:text-sm transition text-center flex items-center justify-center gap-2"
                    >
                      <span>เรียนต่อเพื่อรับใบประกาศ</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Certificate Modal */}
      {selectedCourseForCert && (
        <CertificateModal
          course={selectedCourseForCert}
          user={user}
          onClose={() => setSelectedCourseForCert(null)}
        />
      )}
    </div>
  );
}

export default Certificates;
