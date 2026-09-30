import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Play,
  CheckCircle2,
  Award,
  Clock,
  Trash2,
  Search,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertTriangle,
  X,
  Compass,
  Layers,
  GraduationCap,
  HelpCircle,
} from 'lucide-react';
import { getMyCourses, unenrollCourse, getCourseProgress } from '../api';
import ProgressBar from '../components/ProgressBar';
import CertificateModal from '../components/CertificateModal';
import QuizModal from '../components/QuizModal';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [unenrollModalCourse, setUnenrollModalCourse] = useState(null);
  const [unenrolling, setUnenrolling] = useState(false);
  const [selectedCourseForCert, setSelectedCourseForCert] = useState(null);
  const [selectedQuizCourse, setSelectedQuizCourse] = useState(null);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'in_progress' | 'completed' | 'not_started'
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'progress_desc' | 'progress_asc' | 'title_asc'

  const navigate = useNavigate();
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

        // ดึง progress ของแต่ละคอร์สพร้อมกัน (Parallel)
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
      console.error('Failed to load enrolled courses:', err);
    } finally {
      setLoading(false);
    }
  };

  // ดำเนินการยกเลิกลงทะเบียนผ่าน Modal
  const confirmUnenroll = async () => {
    if (!unenrollModalCourse) return;
    setUnenrolling(true);
    try {
      const data = await unenrollCourse(unenrollModalCourse.id);
      if (data.message) {
        setCourses((prev) => prev.filter((c) => c.id !== unenrollModalCourse.id));
        setUnenrollModalCourse(null);
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการยกเลิกลงทะเบียน');
      }
    } catch {
      alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
    } finally {
      setUnenrolling(false);
    }
  };

  // กด "เรียนต่อ" → ไปบทล่าสุดที่ค้างไว้
  const handleContinue = (courseId) => {
    const progress = progressMap[courseId];
    if (progress?.lastLesson) {
      navigate(`/learn/${courseId}?lesson=${progress.lastLesson.id}`);
    } else {
      navigate(`/learn/${courseId}`);
    }
  };

  // คำนวณสถิติภาพรวม
  const stats = useMemo(() => {
    const total = courses.length;
    let completed = 0;
    let inProgress = 0;
    let notStarted = 0;
    let totalProgressSum = 0;

    courses.forEach((c) => {
      const p = progressMap[c.id]?.percentage || 0;
      totalProgressSum += p;
      if (p >= 100) {
        completed++;
      } else if (p > 0) {
        inProgress++;
      } else {
        notStarted++;
      }
    });

    const averageProgress = total > 0 ? Math.round(totalProgressSum / total) : 0;

    return {
      total,
      completed,
      inProgress,
      notStarted,
      averageProgress,
    };
  }, [courses, progressMap]);

  // กรองและเรียงลำดับคอร์ส
  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        const progress = progressMap[course.id]?.percentage || 0;

        // Filter Tab
        if (activeTab === 'completed' && progress < 100) return false;
        if (activeTab === 'in_progress' && (progress === 0 || progress >= 100)) return false;
        if (activeTab === 'not_started' && progress > 0) return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = course.title?.toLowerCase().includes(q);
          const matchInst = course.instructor?.toLowerCase().includes(q);
          const matchDesc = course.description?.toLowerCase().includes(q);
          return matchTitle || matchInst || matchDesc;
        }

        return true;
      })
      .sort((a, b) => {
        const progA = progressMap[a.id]?.percentage || 0;
        const progB = progressMap[b.id]?.percentage || 0;

        if (sortBy === 'progress_desc') return progB - progA;
        if (sortBy === 'progress_asc') return progA - progB;
        if (sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
        // default: recent by ID descending
        return (b.id || 0) - (a.id || 0);
      });
  }, [courses, progressMap, activeTab, searchQuery, sortBy]);

  // กรณีไม่ได้เข้าสู่ระบบ
  if (!user) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-100 crimson-shadow text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center">
            <GraduationCap className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">กรุณาเข้าสู่ระบบ</h2>
            <p className="text-slate-500 text-sm">
              เข้าสู่ระบบเพื่อดูคอร์สเรียนของคุณ ติดตามความคืบหน้า และรับใบประกาศนียบัตร
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2.5">
            <Link
              to="/login"
              className="w-full py-3 px-4 rounded-xl crimson-gradient text-white font-bold text-sm shadow-md shadow-rose-600/20 hover:opacity-95 transition"
            >
              เข้าสู่ระบบ (Sign In)
            </Link>
            <Link
              to="/register"
              className="w-full py-3 px-4 rounded-xl bg-slate-100 text-slate-700 font-semibold text-sm hover:bg-slate-200 transition"
            >
              ยังไม่มีบัญชี? สมัครสมาชิก
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* 1. Header Banner & Overview Stats */}
      <section className="bg-gradient-to-b from-rose-50/80 via-white to-slate-50 border-b border-rose-100/60 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold tracking-wide w-fit">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>แดชบอร์ดการเรียนรู้ส่วนตัว (My Learning Hub)</span>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  คอร์สเรียนของฉัน <span className="text-rose-600">({courses.length})</span>
                </h1>
                <p className="text-slate-500 text-sm sm:text-base mt-1.5 max-w-2xl leading-relaxed">
                  ติดตามความก้าวหน้า ทบทวนบทเรียน และยกระดับความรู้ในทุกๆ วันสู่เป้าหมายมืออาชีพ
                </p>
              </div>

              <Link
                to="/"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-rose-200 bg-white hover:bg-rose-50/60 text-rose-600 font-bold text-xs sm:text-sm transition shadow-xs shrink-0 self-start md:self-auto"
              >
                <Compass className="w-4 h-4" />
                <span>สำรวจคอร์สเพิ่มเติม</span>
              </Link>
            </div>
          </div>

          {/* Quick Learning Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4 transition hover:border-rose-300">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400">คอร์สที่ลงทะเบียน</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.total} คอร์ส</p>
                <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">คลังหลักสูตรทั้งหมด</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4 transition hover:border-rose-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Play className="w-6 h-6 fill-amber-500 text-amber-500" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400">กำลังเรียนอยู่</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.inProgress} คอร์ส</p>
                <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">เรียนต่อเนื่องเป็นประจำ</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4 transition hover:border-rose-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400">จบหลักสูตรแล้ว</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.completed} คอร์ส</p>
                <p className="text-[11px] text-slate-500 mt-0.5 hidden sm:block">สำเร็จครบ 100%</p>
              </div>
            </div>

            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100 crimson-shadow flex items-center gap-4 transition hover:border-rose-300">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                <Award className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-400">ความคืบหน้าเฉลี่ย</p>
                <p className="text-xl sm:text-2xl font-black text-slate-900">{stats.averageProgress}%</p>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="crimson-gradient h-full rounded-full transition-all duration-700"
                    style={{ width: `${stats.averageProgress}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content & Course Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Filter Tabs & Search Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'ทั้งหมด', count: stats.total },
              { id: 'in_progress', label: 'กำลังเรียน', count: stats.inProgress },
              { id: 'completed', label: 'เรียนจบแล้ว', count: stats.completed },
              { id: 'not_started', label: 'ยังไม่เริ่ม', count: stats.notStarted },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'crimson-gradient text-white shadow-md shadow-rose-600/20'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/50'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60 md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาคอร์สในคลัง..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 shadow-xs"
              />
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs">
              <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none text-xs sm:text-sm cursor-pointer"
              >
                <option value="recent">ลงทะเบียนล่าสุด</option>
                <option value="progress_desc">ความคืบหน้าสูงสุด</option>
                <option value="progress_asc">ความคืบหน้าน้อยสุด</option>
                <option value="title_asc">ชื่อคอร์ส (A - Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Course Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 animate-pulse shadow-xs"
              >
                <div className="w-full h-48 bg-slate-200 rounded-2xl" />
                <div className="h-4 bg-slate-200 rounded w-1/3" />
                <div className="h-6 bg-slate-200 rounded w-4/5" />
                <div className="h-4 bg-slate-200 rounded w-full" />
                <div className="h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          /* Empty State: Never enrolled in any course */
          <div className="text-center py-20 bg-white rounded-3xl border border-rose-100/80 p-8 crimson-shadow max-w-2xl mx-auto space-y-6">
            <div className="w-20 h-20 rounded-3xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center shadow-inner">
              <BookOpen className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-slate-900">
                ยังไม่มีคอร์สที่คุณลงทะเบียนไว้
              </h3>
              <p className="text-slate-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                เริ่มต้นเส้นทางการเรียนรู้ของคุณได้แล้ววันนี้ สำรวจคอร์สเรียนหลากหลายระดับพร้อมเนื้อหาเข้มข้น
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl crimson-gradient text-white font-bold text-sm shadow-md shadow-rose-600/30 hover:opacity-95 transition"
            >
              <span>สำรวจคอร์สเรียนทั้งหมด (Explore Courses)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : filteredCourses.length === 0 ? (
          /* Empty State: Filter/Search matched nothing */
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 crimson-shadow max-w-lg mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">ไม่พบคอร์สที่ตรงกับเงื่อนไข</h3>
            <p className="text-slate-500 text-sm">
              ลองเปลี่ยนคำค้นหา หรือสลับแท็บเพื่อดูคอร์สสถานะอื่นๆ
            </p>
            <button
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs sm:text-sm shadow-xs cursor-pointer"
            >
              แสดงคอร์สทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = progressMap[course.id] || {
                percentage: 0,
                completedLessons: 0,
                totalLessons: 0,
              };
              const isCompleted = progress.percentage >= 100;
              const hasStarted = progress.percentage > 0;

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-rose-100/80 overflow-hidden crimson-shadow crimson-shadow-hover flex flex-col group transition duration-300"
                >
                  {/* Thumbnail Area */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={
                        course.thumbnail ||
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
                      }
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                    {/* Status Badge on Top Left */}
                    <div className="absolute top-3.5 left-3.5">
                      {isCompleted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-md flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>จบหลักสูตรแล้ว</span>
                        </span>
                      ) : hasStarted ? (
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-md flex items-center gap-1.5">
                          <Play className="w-3 h-3 fill-white" />
                          <span>กำลังเรียน {progress.percentage}%</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700">
                          ยังไม่ได้เริ่มเรียน
                        </span>
                      )}
                    </div>

                    {/* Unenroll Button on Top Right */}
                    <button
                      onClick={() => setUnenrollModalCourse(course)}
                      className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/40 hover:bg-rose-600 text-white backdrop-blur-md flex items-center justify-center transition shadow-sm cursor-pointer"
                      title="ยกเลิกลงทะเบียนคอร์สนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* Lessons Count Indicator on Bottom */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-semibold">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
                        {course.category || 'Tech Course'}
                      </span>
                      {progress.totalLessons > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
                          {progress.completedLessons} / {progress.totalLessons} บทเรียน
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-rose-600 transition line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        ผู้สอน: <span className="text-slate-700 font-semibold">{course.instructor}</span>
                      </p>
                    </div>

                    {/* Progress Bar Component */}
                    <div className="space-y-1.5 pt-2">
                      <ProgressBar percentage={progress.percentage} size="md" />
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2.5">
                      {/* Certificate Download Button for Completed Courses */}
                      {isCompleted && (
                        <button
                          onClick={() => setSelectedCourseForCert(course)}
                          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-rose-600/20 transition flex items-center justify-center gap-2 cursor-pointer animate-pulse"
                        >
                          <Award className="w-4 h-4 text-amber-200" />
                          <span>ดาวน์โหลดใบประกาศนียบัตร (Certificate)</span>
                        </button>
                      )}

                      {/* Quiz Button */}
                      <button
                        onClick={() => setSelectedQuizCourse(course)}
                        className="w-full py-2 px-3 rounded-xl border border-rose-200/80 bg-rose-50/50 hover:bg-rose-100/70 text-rose-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <HelpCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>แบบทดสอบท้ายบทเรียน (Quiz)</span>
                      </button>

                      {/* Primary Continue / Review Button */}
                      <button
                        onClick={() => handleContinue(course.id)}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                          isCompleted
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                            : 'crimson-gradient text-white hover:opacity-95 shadow-md shadow-rose-600/20'
                        }`}
                      >
                        {isCompleted ? (
                          <>
                            <RotateCcw className="w-4 h-4" />
                            <span>ทบทวนบทเรียนอีกครั้ง</span>
                          </>
                        ) : hasStarted ? (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>เรียนต่อทันที (Continue Lesson)</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4 fill-white" />
                            <span>เริ่มเรียนบทแรก (Start Course)</span>
                          </>
                        )}
                      </button>

                      {/* Secondary Details & Unenroll */}
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/course/${course.id}`}
                          className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-700 text-xs font-bold transition text-center"
                        >
                          ดูรายละเอียดหลักสูตร
                        </Link>
                        <button
                          onClick={() => setUnenrollModalCourse(course)}
                          className="py-2 px-3 rounded-xl border border-rose-100 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition cursor-pointer"
                          title="ยกเลิกลงทะเบียน"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Custom Modern Unenroll Confirmation Modal */}
      {unenrollModalCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div
            className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">
                  ยืนยันการยกเลิกลงทะเบียน?
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  คุณต้องการยกเลิกการลงทะเบียนในคอร์ส{' '}
                  <span className="font-bold text-slate-800">
                    "{unenrollModalCourse.title}"
                  </span>{' '}
                  ใช่หรือไม่?
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl text-xs text-rose-700 leading-relaxed">
              ⚠️ หลังจากยกเลิกแล้ว คอร์สนี้จะถูกลบออกจากคลังของคุณ แต่คุณสามารถกลับมาลงทะเบียนเรียนใหม่ได้ทุกเมื่อ
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={unenrolling}
                onClick={() => setUnenrollModalCourse(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-100 transition cursor-pointer"
              >
                เก็บไว้เรียนต่อ
              </button>
              <button
                disabled={unenrolling}
                onClick={confirmUnenroll}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs sm:text-sm hover:bg-rose-700 shadow-sm shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {unenrolling ? (
                  <span>กำลังยกเลิก...</span>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>ยืนยันยกเลิก</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Certificate Modal */}
      {selectedCourseForCert && (
        <CertificateModal
          course={selectedCourseForCert}
          user={user}
          onClose={() => setSelectedCourseForCert(null)}
        />
      )}

      {/* 6. Quiz Modal */}
      {selectedQuizCourse && (
        <QuizModal
          courseId={selectedQuizCourse.id}
          courseTitle={selectedQuizCourse.title}
          onClose={() => setSelectedQuizCourse(null)}
          onPassQuiz={() => {}}
        />
      )}
    </div>
  );
}

export default MyCourses;