import { X, Play, Clock, Star, CheckCircle, Award, User, BookOpen, Bookmark, ArrowRight, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';

function CoursePreviewModal({ course, onClose }) {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  if (!course) return null;

  const bookmarked = isBookmarked(course.id);

  // Fallback syllabus if backend course doesn't have detailed modules
  const syllabus = course.lessons && course.lessons.length > 0 ? course.lessons : [
    { id: 101, title: 'บทนำและการเตรียม Environment', duration: 900, order: 1 },
    { id: 102, title: 'พื้นฐานแนวคิดและการออกแบบ Architecture', duration: 1500, order: 2 },
    { id: 103, title: 'Hands-on Coding: พัฒนาระบบจริง Step-by-Step', duration: 2400, order: 3 },
    { id: 104, title: 'State Management & Performance Optimization', duration: 1800, order: 4 },
    { id: 105, title: 'Testing, Deployment & Production Best Practices', duration: 2100, order: 5 },
  ];

  const formatDuration = (seconds) => {
    if (!seconds) return '15 นาที';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')} นาที`;
  };

  const handleEnrollClick = () => {
    onClose();
    navigate(`/course/${course.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-2xl sm:rounded-3xl max-w-3xl w-full shadow-2xl border border-rose-100 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Media Banner */}
        <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-slate-950">
          <img
            src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000'}
            alt={course.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Badges on Banner */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 text-white">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-600 text-white shadow-sm inline-block">
                  {course.category || 'Technology'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 backdrop-blur-md text-white">
                  {course.level || 'Intermediate'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight line-clamp-2">
                {course.title}
              </h2>
            </div>

            {/* Price badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-left sm:text-right shrink-0 self-start sm:self-auto">
              <span className="text-[10px] sm:text-xs text-rose-200 block font-medium">ค่าลงทะเบียน</span>
              <span className="text-lg sm:text-xl font-black text-white">
                {course.price === 0 ? 'เรียนฟรี' : `฿${course.price}`}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-8 max-h-[calc(88vh-14rem)] overflow-y-auto space-y-5 sm:space-y-6">
          {/* Key Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">คะแนนรีวิว</p>
                <p className="text-xs font-bold text-slate-800">{course.rating || '4.9'} / 5.0</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">จำนวนบทเรียน</p>
                <p className="text-xs font-bold text-slate-800">{syllabus.length} บทเรียน</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">ความยาวทั้งหมด</p>
                <p className="text-xs font-bold text-slate-800">{course.duration || '12 ชม. 40 นาที'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">ใบประกาศนียบัตร</p>
                <p className="text-xs font-bold text-slate-800">มีให้เมื่อจบ</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              รายละเอียดคอร์ส
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
              {course.description || 'หลักสูตรเข้มข้นที่ออกแบบมาเพื่อพาคุณก้าวสู่ระดับมืออาชีพอย่างมั่นใจ ด้วยเนื้อหาอัปเดตล่าสุดและโปรเจกต์จริง'}
            </p>
          </div>

          {/* Curriculum / Syllabus */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                โครงสร้างเนื้อหา (Curriculum Syllabus)
              </span>
              <span className="text-xs text-rose-600 font-semibold">{syllabus.length} บทเรียน</span>
            </h3>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
              {syllabus.map((item, index) => (
                <div
                  key={item.id || index}
                  className="p-3 sm:p-4 flex items-center justify-between gap-3 hover:bg-rose-50/40 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 font-bold text-xs flex items-center justify-center shrink-0">
                      {item.order || index + 1}
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                      {item.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formatDuration(item.duration)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructor Bio */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-rose-50/60 to-transparent border border-rose-100 rounded-2xl flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl crimson-gradient text-white flex items-center justify-center font-extrabold text-base sm:text-lg shadow-md shrink-0">
              {course.instructor ? course.instructor.charAt(0) : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">{course.instructor || 'ผู้สอนเชี่ยวชาญพิเศษ'}</p>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ยืนยันแล้ว
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ผู้เชี่ยวชาญด้าน Software Architecture และการพัฒนาระบบระดับองค์กร มีประสบการณ์สอนกว่า 8 ปี
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-1.5">📌 สิ่งที่ควรมีพื้นฐานมาก่อน:</p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>ความเข้าใจพื้นฐานเกี่ยวกับการเขียนโปรแกรมเบื้องต้น</li>
              <li>คอมพิวเตอร์ที่ติดตั้ง Node.js และ Code Editor (เช่น VS Code)</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={() => toggleBookmark(course.id)}
            className={`p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-center gap-2 text-xs font-bold ${
              bookmarked
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-rose-600 text-rose-600' : ''}`} />
            <span>{bookmarked ? 'บันทึกแล้ว' : 'บันทึกคอร์ส'}</span>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition text-xs sm:text-sm text-center"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleEnrollClick}
              className="flex-2 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl crimson-gradient text-white font-bold hover:opacity-95 shadow-md shadow-rose-600/30 transition text-xs sm:text-sm flex items-center justify-center gap-2 text-center"
            >
              <span>ไปที่หน้ารายละเอียด & เข้าเรียน</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePreviewModal;
