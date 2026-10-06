import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Star,
  CheckCircle,
  Play,
  PlusCircle,
  ShieldCheck,
  Award,
  ArrowLeft,
  HelpCircle,
  Edit3,
} from 'lucide-react';
import { getCourse, enrollCourse, checkEnrollment } from '../api';
import EditLessonModal from '../components/EditLessonModal';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    getCourse(id).then((data) => {
      if (data.error) {
        alert('ไม่พบคอร์สนี้');
        navigate('/');
      } else {
        setCourse(data);
        setLoading(false);
      }
    });

    if (user) {
      checkEnrollment(id).then((data) => {
        if (data.enrolled) setEnrolled(true);
      });
    }
  }, [id]);

  const handleEnroll = async () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    const data = await enrollCourse(id);
    setEnrolling(false);

    if (data.enrollment || data.message) {
      setEnrolled(true);
      alert('🎉 ลงทะเบียนสำเร็จ!');
    } else {
      alert(data.error || 'ลงทะเบียนไม่สำเร็จ');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '15 นาที';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')} นาที`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 pt-12">
        <div className="h-64 bg-slate-200 rounded-3xl animate-pulse mb-6" />
        <div className="space-y-4">
          <div className="h-8 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
          <div className="h-4 bg-slate-200 rounded-xl w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-rose-600 transition mb-4 sm:mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>กลับไปหน้ารวมคอร์ส</span>
      </button>

      <div className="bg-white rounded-2xl sm:rounded-3xl crimson-shadow border border-rose-100/80 overflow-hidden">
        {/* Banner Area */}
        <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-slate-950">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200'}
            alt={course.title}
            className="w-full h-full object-cover opacity-85"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 text-white">
            <div className="space-y-1.5 sm:space-y-2 max-w-2xl">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm inline-block">
                หลักสูตรคุณภาพ
              </span>
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm flex items-center gap-2">
                <span>👨‍🏫 ผู้สอน: {course.instructor}</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 sm:px-5 sm:py-3 rounded-2xl text-left sm:text-right shrink-0 self-start sm:self-auto">
              <span className="text-[11px] sm:text-xs text-rose-200 font-semibold block">ราคาคอร์ส</span>
              <span className="text-xl sm:text-3xl font-black text-white">
                {course.price === 0 ? 'เรียนฟรี' : `฿${course.price}`}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 lg:p-10 space-y-6 sm:space-y-8">
          {/* Action Callout */}
          <div className="p-4 sm:p-6 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div>
              <p className="font-extrabold text-slate-900 text-lg">
                {enrolled ? 'คุณได้ลงทะเบียนในคอร์สนี้แล้ว' : 'พร้อมเริ่มเรียนรู้ทักษะนี้หรือยัง?'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {enrolled ? 'เข้าห้องเรียนและบันทึกความคืบหน้าได้ทันที' : 'เข้าถึงวิดีโอเนื้อหาและโปรเจกต์ได้ตลอดชีพ'}
              </p>
            </div>

            {enrolled ? (
              <Link
                to={`/learn/${course.id}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl crimson-gradient text-white font-bold text-base hover:opacity-95 shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5 fill-white" />
                <span>เข้าสู่บทเรียนทันที</span>
              </Link>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl crimson-gradient text-white font-bold text-base hover:opacity-95 shadow-md shadow-rose-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {enrolling ? (
                  <span>⏳ กำลังลงทะเบียน...</span>
                ) : (
                  <span>{course.price === 0 ? '🚀 ลงทะเบียนเรียนฟรี' : `💳 สั่งซื้อคอร์สนี้ ฿${course.price}`}</span>
                )}
              </button>
            )}
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-100">
                <Play className="w-4 h-4 fill-rose-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">วิดีโอคุณภาพ</p>
                <p className="text-[11px] text-slate-500">เรียนได้ทุกอุปกรณ์</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-100">
                <HelpCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">แบบทดสอบ (Quiz)</p>
                <p className="text-[11px] text-slate-500">วัดผลพร้อมเฉลย</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-100">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">ใบประกาศนียบัตร</p>
                <p className="text-[11px] text-slate-500">รับทันทีเมื่อจบ</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100/70 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white text-rose-600 flex items-center justify-center shrink-0 shadow-xs border border-rose-100">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">เข้าถึงตลอดชีพ</p>
                <p className="text-[11px] text-slate-500">ทบทวนได้ตลอด</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
              <span>รายละเอียดคอร์ส</span>
            </h2>
            <p className="text-slate-600 text-base leading-relaxed whitespace-pre-line bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              {course.description || 'ไม่มีรายละเอียดเพิ่มเติม'}
            </p>
          </div>

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>เนื้อหาบทเรียนทั้งหมด ({course.lessons?.length || 0} บท)</span>
              </h2>

              {isAdmin && (
                <Link
                  to={`/course/${course.id}/create-lesson`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-200 px-3.5 py-2 rounded-xl transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>เพิ่มบทเรียน (Admin)</span>
                </Link>
              )}
            </div>

            {course.lessons && course.lessons.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                {course.lessons.map((lesson, idx) => (
                  <div
                    key={lesson.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-rose-50/30 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {lesson.order || idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-sm sm:text-base">
                        {lesson.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{formatDuration(lesson.duration)}</span>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => setEditingLesson(lesson)}
                          className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-white hover:bg-rose-600 border border-rose-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          title="แก้ไขบทเรียนนี้"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>แก้ไข</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500 text-sm">
                ยังไม่มีบทเรียนในคอร์สนี้
                {isAdmin && (
                  <div className="mt-3">
                    <Link
                      to={`/course/${course.id}/create-lesson`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl crimson-gradient text-white text-xs font-bold shadow-xs hover:opacity-95"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>คลิกเพื่อเพิ่มบทเรียนแรก</span>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <EditLessonModal
          isOpen={!!editingLesson}
          onClose={() => setEditingLesson(null)}
          lesson={editingLesson}
          onSuccess={(updated) => {
            setEditingLesson(null);
            setCourse((prev) => {
              if (!prev || !prev.lessons) return prev;
              return {
                ...prev,
                lessons: prev.lessons.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)),
              };
            });
          }}
        />
      )}
    </div>
  );
}

export default CourseDetail;