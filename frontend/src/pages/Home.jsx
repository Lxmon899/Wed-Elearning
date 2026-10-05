import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses, getStats } from '../api';

function Home() {
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    // ดึงข้อมูลคอร์สและสถิติพร้อมกัน
    Promise.all([getCourses(), getStats()])
      .then(([coursesData, statsData]) => {
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setStats(statsData);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setCourses([]);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* ===== Hero Section ===== */}
      <section className="bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              เริ่มเรียนรู้ได้ทันที
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight mb-6">
              เส้นทางการเรียนรู้ของคุณ
              <br />
              <span className="text-emerald-600">เริ่มที่นี่</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
              สำรวจคอร์สเรียนคุณภาพจากผู้เชี่ยวชาญ ค้นหาทักษะใหม่
              <br className="hidden sm:block" />
              และก้าวไปข้างหน้าในสายอาชีพของคุณ
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#courses" className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5">
                สำรวจคอร์สทั้งหมด
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              {!user && (
                <Link to="/register" className="inline-flex items-center gap-2 px-8 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200">
                  สมัครฟรี
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ===== Stats Section ===== */}
      <section className="border-y border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              {
                value: stats ? stats.totalCourses : '...',
                label: 'คอร์สเรียน',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
              {
                value: stats ? stats.totalStudents : '...',
                label: 'ผู้เรียนทั้งหมด',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
              },
              {
                value: stats ? stats.totalInstructors : '...',
                label: 'ผู้สอนคุณภาพ',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                  </svg>
                ),
              },
              {
                value: stats ? stats.totalEnrollments : '...',
                label: 'การลงทะเบียน',
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
                  </svg>
                ),
              },
            ].map((stat, i) => (
              <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 100}ms`, animationFillMode: 'both' }}>
                <div className="w-10 h-10 mx-auto mb-3 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                  {stat.icon}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Courses Section ===== */}
      <section id="courses" className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">คอร์สเรียนทั้งหมด</h2>
            <p className="text-gray-500">เลือกคอร์สที่ใช่สำหรับคุณ เริ่มเรียนได้ทันที</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">กำลังโหลดคอร์ส...</p>
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-gray-600 text-base font-medium">ยังไม่มีคอร์สในระบบ</p>
              <p className="text-gray-400 text-xs mt-1">กรุณาเพิ่มคอร์สผ่านระบบจัดการ</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <Link
                  to={`/course/${course.id}`}
                  key={course.id}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-50 transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'}
                      alt={course.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Duration badge (top-left) */}
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/60 backdrop-blur-xs text-white shadow-xs">
                        <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {course.duration || '3 ชม.'}
                      </span>
                    </div>

                    {/* Price badge */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold shadow-sm ${
                        course.price === 0
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white text-gray-900'
                      }`}>
                        {course.price === 0 ? 'ฟรี' : `฿${course.price.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                      {course.description || 'ไม่มีรายละเอียด'}
                    </p>

                    {/* Instructor */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{course.instructor}</span>
                      </div>
                      <svg className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      {!user && (
        <section className="bg-emerald-600">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              พร้อมที่จะเริ่มเรียนรู้แล้วหรือยัง?
            </h2>
            <p className="text-emerald-100 mb-8 max-w-lg mx-auto">
              สมัครสมาชิกฟรีวันนี้ เข้าถึงคอร์สเรียนคุณภาพจากผู้เชี่ยวชาญตัวจริง
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all duration-200 shadow-lg hover:-translate-y-0.5"
            >
              เริ่มต้นใช้งานฟรี
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;