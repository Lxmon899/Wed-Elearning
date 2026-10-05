import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourse, enrollCourse } from '../api';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollMessage, setEnrollMessage] = useState('');
  const navigate = useNavigate();

  const handleEnroll = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setEnrolling(true);
    setEnrollMessage('');
    try {
      const res = await enrollCourse(course.id);
      if (res.enrollment) {
        setEnrolled(true);
        setEnrollMessage('ลงทะเบียนเรียนสำเร็จ!');
      } else {
        setEnrollMessage(res.error || 'ลงทะเบียนไม่สำเร็จ');
      }
    } catch {
      setEnrollMessage('เกิดข้อผิดพลาดในการลงทะเบียน');
    } finally {
      setEnrolling(false);
    }
  };

  useEffect(() => {
    getCourse(id).then(data => {
      if (data.error) {
        navigate('/');
      } else {
        setCourse(data);
        setLoading(false);
      }
    });
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 text-sm">กำลังโหลดข้อมูลคอร์ส...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-emerald-600 transition">หน้าแรก</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <Link to="/" className="hover:text-emerald-600 transition">คอร์สทั้งหมด</Link>
            <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-800 font-medium truncate max-w-[200px]">{course.title}</span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="mb-8">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-500 leading-relaxed mb-6">
                {course.description || 'ไม่มีรายละเอียดคอร์ส'}
              </p>

              {/* Instructor & Meta Info */}
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">ผู้สอน</p>
                    <p className="font-semibold text-gray-900">{course.instructor}</p>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200 hidden sm:block" />

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>ระยะเวลา {course.duration || '3 ชม. 30 นาที'}</span>
                </div>
              </div>
            </div>

            {/* Course Thumbnail */}
            <div className="relative rounded-2xl overflow-hidden mb-8 border border-gray-200">
              <img
                src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                alt={course.title}
                className="w-full h-64 sm:h-80 object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/60 backdrop-blur-xs text-white shadow-xs">
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {course.duration || '3 ชม. 30 นาที'}
                </span>
              </div>
            </div>

            {/* Course Content Sections */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                เนื้อหาในคอร์สนี้
              </h2>

              {/* Sample Lessons */}
              <div className="space-y-2">
                {[
                  { num: 1, title: 'แนะนำคอร์สและเตรียมตัว', duration: '10:30', free: true },
                  { num: 2, title: 'พื้นฐานที่ต้องรู้ก่อนเริ่ม', duration: '25:00', free: true },
                  { num: 3, title: 'เริ่มลงมือปฏิบัติจริง', duration: '35:20', free: false },
                  { num: 4, title: 'เทคนิคขั้นสูง', duration: '40:15', free: false },
                  { num: 5, title: 'โปรเจกต์ฝึกปฏิบัติ', duration: '55:00', free: false },
                ].map((lesson) => (
                  <div
                    key={lesson.num}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        lesson.free
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {lesson.free ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-800">
                          บทที่ {lesson.num}: {lesson.title}
                        </span>
                        {lesson.free && (
                          <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                            ดูฟรี
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-gray-400 font-mono">{lesson.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Price Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl border-2 border-emerald-200 p-6 space-y-5">
                {/* Price */}
                <div className="text-center pb-5 border-b border-gray-100">
                  <span className={`text-4xl font-bold ${
                    course.price === 0 ? 'text-emerald-600' : 'text-gray-900'
                  }`}>
                    {course.price === 0 ? 'เรียนฟรี' : `฿${course.price.toLocaleString()}`}
                  </span>
                </div>

                {/* CTA Button */}
                {enrolled ? (
                  <div className="space-y-2">
                    <div className="w-full py-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-sm font-semibold">
                      ลงทะเบียนคอร์สนี้แล้ว
                    </div>
                    <Link
                      to="/my-courses"
                      className="block w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-center text-xs font-semibold transition"
                    >
                      ไปยังหน้าคอร์สของฉัน →
                    </Link>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all duration-200 shadow-lg shadow-emerald-200 hover:shadow-xl hover:shadow-emerald-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 cursor-pointer"
                    >
                      {enrolling
                        ? 'กำลังลงทะเบียน...'
                        : course.price === 0
                        ? 'เริ่มเข้าเรียนฟรี'
                        : 'สมัครเรียนคอร์สนี้'}
                    </button>
                    {enrollMessage && (
                      <p className="text-xs text-center text-red-500 mt-2">{enrollMessage}</p>
                    )}
                  </div>
                )}

                {/* Course Includes */}
                <div className="space-y-2.5 pt-2">
                  <p className="text-xs font-semibold text-gray-700">รายละเอียดคอร์สเรียน:</p>
                  {[
                    {
                      svg: (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z" />
                        </svg>
                      ),
                      text: 'วิดีโอบทเรียนความละเอียดสูง',
                    },
                    {
                      svg: (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                        </svg>
                      ),
                      text: 'เนื้อหาครบถ้วนตามหลักสูตร',
                    },
                    {
                      svg: (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                        </svg>
                      ),
                      text: 'แบบฝึกหัดและโครงงานปฏิบัติ',
                    },
                    {
                      svg: (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ),
                      text: 'ใบประกาศนียบัตรดิจิทัล',
                    },
                    {
                      svg: (
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                      ),
                      text: 'เข้าเรียนซ้ำและทบทวนได้ตลอดชีพ',
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-gray-600">
                      <div className="w-6 h-6 rounded-md bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        {item.svg}
                      </div>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;