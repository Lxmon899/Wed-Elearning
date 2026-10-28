import { useState, useEffect } from 'react';
import {
  X,
  Play,
  Clock,
  Star,
  CheckCircle,
  Award,
  User,
  BookOpen,
  Bookmark,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import { getCourse } from '../api';

function CoursePreviewModal({ course, onClose }) {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [detailedCourse, setDetailedCourse] = useState(course);
  const [loadingLessons, setLoadingLessons] = useState(!course?.lessons);

  useEffect(() => {
    if (!course) return;

    // ถ้าไม่มีข้อมูลบทเรียนแนบมา ให้ดึงข้อมูลจริงจากหลังบ้าน
    if (!course.lessons || course.lessons.length === 0) {
      setLoadingLessons(true);
      getCourse(course.id)
        .then((data) => {
          if (data && !data.error) {
            setDetailedCourse(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoadingLessons(false));
    } else {
      setDetailedCourse(course);
      setLoadingLessons(false);
    }
  }, [course]);

  if (!course) return null;

  const currentCourse = detailedCourse || course;
  const bookmarked = isBookmarked(currentCourse.id);
  const syllabus = currentCourse.lessons || [];

  const formatDuration = (val) => {
    if (!val) return '15:00 นาที';
    // หากค่า duration น้อยกว่า 60 แปลว่าเก็บเป็นนาที (จาก seed / ฟอร์ม)
    // หากค่า duration >= 60 แปลว่าเก็บเป็นวินาที (จาก video metadata)
    const seconds = val < 60 ? val * 60 : val;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')} นาที`;
  };

  // คำนวณเวลารวมจริงจากบทเรียนในฐานข้อมูล
  const calculateTotalDuration = () => {
    if (syllabus.length === 0) return currentCourse.duration || 'ไม่ระบุ';
    const totalMinutes = syllabus.reduce((acc, l) => {
      const dur = l.duration || 0;
      const mins = dur >= 60 ? Math.round(dur / 60) : dur;
      return acc + mins;
    }, 0);

    if (totalMinutes === 0) return 'ไม่ระบุ';
    if (totalMinutes < 60) {
      return `${totalMinutes} นาที`;
    }
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return m > 0 ? `${h} ชม. ${m} นาที` : `${h} ชม.`;
  };

  const handleEnrollClick = () => {
    onClose();
    navigate(`/course/${currentCourse.id}`);
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
            src={currentCourse.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1000'}
            alt={currentCourse.title}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Badges on Banner */}
          <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2.5 sm:gap-3 text-white">
            <div className="space-y-1 sm:space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-600 text-white shadow-sm inline-block">
                  {currentCourse.category || 'Technology'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 backdrop-blur-md text-white">
                  {currentCourse.level || 'Intermediate'}
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-extrabold text-white leading-tight line-clamp-2">
                {currentCourse.title}
              </h2>
            </div>

            {/* Price badge */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-1.5 sm:px-4 sm:py-2 text-left sm:text-right shrink-0 self-start sm:self-auto">
              <span className="text-[10px] sm:text-xs text-rose-200 block font-medium">ค่าลงทะเบียน</span>
              <span className="text-lg sm:text-xl font-black text-white">
                {currentCourse.price === 0 ? 'เรียนฟรี' : `฿${currentCourse.price}`}
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
                <p className="text-xs font-bold text-slate-800">{currentCourse.rating || '4.9'} / 5.0</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">จำนวนบทเรียน</p>
                <p className="text-xs font-bold text-slate-800">
                  {loadingLessons ? 'กำลังโหลด...' : `${syllabus.length} บทเรียน`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">ความยาวทั้งหมด</p>
                <p className="text-xs font-bold text-slate-800">
                  {loadingLessons ? 'กำลังโหลด...' : calculateTotalDuration()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">ใบประกาศนียบัตร</p>
                <p className="text-xs font-bold text-slate-800">มีให้เมื่อสอบผ่าน</p>
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
              {currentCourse.description || 'หลักสูตรเข้มข้นที่ออกแบบมาเพื่อพาคุณก้าวสู่ระดับมืออาชีพอย่างมั่นใจ ด้วยเนื้อหาอัปเดตล่าสุดและโปรเจกต์จริง'}
            </p>
          </div>

          {/* Curriculum / Syllabus - REAL DATA */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                โครงสร้างเนื้อหา (Curriculum Syllabus)
              </span>
              <span className="text-xs text-rose-600 font-semibold">
                {loadingLessons ? '...' : `${syllabus.length} บทเรียน`}
              </span>
            </h3>

            {loadingLessons ? (
              <div className="p-8 flex flex-col items-center justify-center gap-2 text-slate-400 bg-slate-50 border border-slate-100 rounded-2xl">
                <Loader2 className="w-5 h-5 animate-spin text-rose-600" />
                <span className="text-xs">กำลังโหลดเนื้อหาบทเรียน...</span>
              </div>
            ) : syllabus.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">ยังไม่มีบทเรียนในคอร์สนี้</p>
                <p className="text-[11px] text-slate-400 mt-0.5">ผู้สอนกำลังจัดเตรียมเนื้อหาบทเรียน</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Instructor Bio */}
          <div className="p-3.5 sm:p-4 bg-gradient-to-r from-rose-50/60 to-transparent border border-rose-100 rounded-2xl flex items-center gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl crimson-gradient text-white flex items-center justify-center font-extrabold text-base sm:text-lg shadow-md shrink-0">
              {currentCourse.instructor ? currentCourse.instructor.charAt(0) : 'T'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  {currentCourse.instructor || 'ผู้สอนเชี่ยวชาญพิเศษ'}
                </p>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ยืนยันแล้ว
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                ผู้สอนและผู้เชี่ยวชาญด้านการพัฒนาซอฟต์แวร์และการถ่ายทอดความรู้เชิงปฏิบัติจริง
              </p>
            </div>
          </div>

          {/* Prerequisites */}
          <div className="bg-slate-50 p-3.5 sm:p-4 rounded-2xl border border-slate-100">
            <p className="text-xs font-bold text-slate-800 mb-1.5">📌 สิ่งที่ควรมีพื้นฐานมาก่อน:</p>
            <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
              <li>ความเข้าใจพื้นฐานเกี่ยวกับการเขียนโปรแกรมเบื้องต้น</li>
              <li>คอมพิวเตอร์ที่ติดตั้งโปรแกรมและเครื่องมือที่เกี่ยวข้อง</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-3.5 sm:p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            onClick={() => toggleBookmark(currentCourse.id)}
            className={`p-2.5 sm:p-3 rounded-xl border transition flex items-center justify-center gap-2 text-xs font-bold cursor-pointer ${
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
              className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-100 transition text-xs sm:text-sm text-center cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
            <button
              onClick={handleEnrollClick}
              className="flex-2 sm:flex-initial px-5 sm:px-6 py-2.5 rounded-xl crimson-gradient text-white font-bold hover:opacity-95 shadow-md shadow-rose-600/30 transition text-xs sm:text-sm flex items-center justify-center gap-2 text-center cursor-pointer"
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
