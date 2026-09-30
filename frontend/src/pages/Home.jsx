import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Clock,
  Star,
  Bookmark,
  Award,
  BookOpen,
  Filter,
  Flame,
  CheckCircle2,
  TrendingUp,
  Layers,
  Sparkles,
  ArrowRight,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { getCourses, getMyCourses } from '../api';
import { useBookmarks } from '../context/BookmarkContext';
import CoursePreviewModal from '../components/CoursePreviewModal';

// 6 Diverse Curated Tech Courses with realistic Thai/English info
const CURATED_DEFAULT_COURSES = [
  {
    id: 1001,
    title: 'Modern Full-Stack Next.js 15 & React Architecture',
    description: 'เรียนรู้การสร้าง Web Application ระดับ Enterprise ด้วย App Router, Server Actions, Tailwind CSS และ Prisma ORM ตั้งแต่พื้นฐานจนถึง Production Deploy',
    instructor: 'อ. วรวิทย์ สุขเจริญ (Senior Tech Lead)',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    price: 0,
    category: 'Web & Full Stack',
    level: 'Intermediate',
    rating: 4.9,
    reviewsCount: 348,
    duration: '18 ชม. 30 นาที',
    lessonsCount: 24,
  },
  {
    id: 1002,
    title: 'Cloud Native DevOps: Docker, Kubernetes & CI/CD',
    description: 'ฝึกฝนกระบวนการ DevOps แบบครบวงจร จัดการ Container, Pod orchestration, Helm chart และวาง Pipeline อัตโนมัติบน AWS Cloud',
    instructor: 'ธีรเดช พัฒนกุล (DevOps Specialist)',
    thumbnail: 'https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800',
    price: 690,
    category: 'Cloud & DevOps',
    level: 'Advanced',
    rating: 4.8,
    reviewsCount: 215,
    duration: '15 ชม. 45 นาที',
    lessonsCount: 19,
  },
  {
    id: 1003,
    title: 'Practical Generative AI & LLM Application Engineering',
    description: 'สร้าง AI Application ด้วย LangChain, LlamaIndex, Vector Database และ OpenAI API พร้อมเทคนิค RAG (Retrieval-Augmented Generation)',
    instructor: 'ดร. นภัสสร จิตต์บริสุทธิ์ (AI Researcher)',
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    price: 890,
    category: 'AI & Data',
    level: 'Intermediate',
    rating: 5.0,
    reviewsCount: 412,
    duration: '22 ชม.',
    lessonsCount: 30,
  },
  {
    id: 1004,
    title: 'Cross-Platform Mobile Dev with Flutter & Dart 3',
    description: 'สร้างแอปพลิเคชันมือถือ iOS และ Android จาก Codebase เดียว จัดการ State ด้วย Riverpod, Local Database และเชื่อมต่อ RESTful API',
    instructor: 'กิตติศักดิ์ เมธาธรรม (Mobile Architect)',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
    price: 490,
    category: 'Mobile Dev',
    level: 'Beginner',
    rating: 4.7,
    reviewsCount: 189,
    duration: '14 ชม. 15 นาที',
    lessonsCount: 18,
  },
  {
    id: 1005,
    title: 'Design System & UI/UX Masterclass in Figma',
    description: 'ออกแบบ User Interface อย่างเป็นระบบด้วย Figma Auto Layout, Design Tokens, Variables และการทำ Interactive High-Fidelity Prototype',
    instructor: 'ปาริชาต รุ่งอรุณ (Lead Product Designer)',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
    price: 0,
    category: 'UI/UX Design',
    level: 'Beginner',
    rating: 4.9,
    reviewsCount: 520,
    duration: '11 ชม. 50 นาที',
    lessonsCount: 16,
  },
  {
    id: 1006,
    title: 'High-Performance Backend with Node.js & Microservices',
    description: 'สถาปัตยกรรม Microservices, Redis Caching, RabbitMQ Message Queue และการจัดการ Security & JWT Authentication ระดับมืออาชีพ',
    instructor: 'อ. สมหญิง รอบรู้ (Backend Engineer)',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
    price: 550,
    category: 'Web & Full Stack',
    level: 'Advanced',
    rating: 4.8,
    reviewsCount: 276,
    duration: '16 ชม. 20 นาที',
    lessonsCount: 22,
  },
];

const CATEGORIES = [
  'All Courses',
  'Web & Full Stack',
  'Cloud & DevOps',
  'AI & Data',
  'Mobile Dev',
  'UI/UX Design',
];

function Home({ externalSearchQuery = '' }) {
  const navigate = useNavigate();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [dbCourses, setDbCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState('All Courses');
  const [searchQuery, setSearchQuery] = useState(externalSearchQuery);
  const [sortBy, setSortBy] = useState('popular');
  const [selectedPreviewCourse, setSelectedPreviewCourse] = useState(null);

  // Sync external search from navbar
  useEffect(() => {
    if (externalSearchQuery !== undefined) {
      setSearchQuery(externalSearchQuery);
    }
  }, [externalSearchQuery]);

  // Load backend database courses & user enrolled courses
  useEffect(() => {
    Promise.all([
      getCourses().catch(() => []),
      user ? getMyCourses().catch(() => []) : Promise.resolve([]),
    ])
      .then(([coursesData, myCoursesData]) => {
        if (Array.isArray(coursesData) && coursesData.length > 0) {
          setDbCourses(coursesData);
        }

        // Set resume learning active card
        if (Array.isArray(myCoursesData) && myCoursesData.length > 0) {
          setActiveCourse(myCoursesData[0]);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Merge backend courses with rich curated metadata
  const allCourses = useMemo(() => {
    if (dbCourses.length === 0) return CURATED_DEFAULT_COURSES;

    // Enhance DB courses with consistent visual attributes
    const formattedDbCourses = dbCourses.map((c, idx) => {
      const fallbackCat = idx % 2 === 0 ? 'Web & Full Stack' : 'Cloud & DevOps';
      return {
        ...c,
        category: c.category || fallbackCat,
        level: c.level || (idx % 3 === 0 ? 'Advanced' : idx % 2 === 0 ? 'Intermediate' : 'Beginner'),
        rating: c.rating || (4.7 + (idx % 4) * 0.1).toFixed(1),
        reviewsCount: c.reviewsCount || 120 + idx * 45,
        duration: c.duration || `${10 + idx * 3} ชม.`,
        lessonsCount: c.lessons?.length || 8 + idx * 4,
      };
    });

    // Also include curated courses if database only has 1 or 2 courses
    if (formattedDbCourses.length < 4) {
      const existingIds = new Set(formattedDbCourses.map((c) => c.id));
      const additional = CURATED_DEFAULT_COURSES.filter((c) => !existingIds.has(c.id));
      return [...formattedDbCourses, ...additional];
    }

    return formattedDbCourses;
  }, [dbCourses]);

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    return allCourses
      .filter((course) => {
        // Category filter
        if (selectedCategory !== 'All Courses' && course.category !== selectedCategory) {
          return false;
        }
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = course.title?.toLowerCase().includes(q);
          const matchDesc = course.description?.toLowerCase().includes(q);
          const matchInst = course.instructor?.toLowerCase().includes(q);
          const matchCat = course.category?.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchInst || matchCat;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'popular') return (b.reviewsCount || 0) - (a.reviewsCount || 0);
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return (b.id || 0) - (a.id || 0);
        if (sortBy === 'price_asc') return (a.price || 0) - (b.price || 0);
        return 0;
      });
  }, [allCourses, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* 1. Hero & Welcome Section */}
      <section className="bg-gradient-to-b from-rose-50/70 via-white to-slate-50 border-b border-rose-100/60 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8">
            {/* Left: Personalized Greeting & Overview */}
            <div className="flex-1 flex flex-col justify-center space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100/80 text-rose-700 text-xs font-bold tracking-wide w-fit">
                <Sparkles className="w-3.5 h-3.5 text-rose-600 animate-spin-slow" />
                <span>ยินดีต้อนรับสู่พื้นที่แห่งการเรียนรู้ยุคใหม่</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {user ? (
                  <>
                    สวัสดี, <span className="text-rose-600">{user.name}</span> 👋
                    <br />
                    <span className="text-2xl sm:text-3xl lg:text-4xl text-slate-700 font-bold">
                      พร้อมต่อยอดทักษะในวันนี้หรือยัง?
                    </span>
                  </>
                ) : (
                  <>
                    ยกระดับทักษะ Tech & Code <br />
                    <span className="text-rose-600">สู่ระดับมืออาชีพชั้นนำ</span>
                  </>
                )}
              </h1>

              <p className="text-slate-600 text-sm sm:text-base max-w-xl leading-relaxed">
                เข้าถึงหลักสูตรเข้มข้นที่ออกแบบร่วมกับผู้เชี่ยวชาญในอุตสาหกรรม เรียนรู้ผ่านการลงมือปฏิบัติจริง พร้อมรับรองทักษะด้วยประกาศนียบัตร
              </p>

              {/* Quick Stats Widget */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-3 max-w-lg">
                <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-rose-100 crimson-shadow min-w-0">
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">ชั่วโมงเรียน</span>
                  </div>
                  <p className="text-sm sm:text-lg font-extrabold text-slate-900 truncate">24.5 ชม.</p>
                </div>

                <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-rose-100 crimson-shadow min-w-0">
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">จบคอร์ส</span>
                  </div>
                  <p className="text-sm sm:text-lg font-extrabold text-slate-900 truncate">3 คอร์ส</p>
                </div>

                <div className="bg-white p-2.5 sm:p-3.5 rounded-2xl border border-rose-100 crimson-shadow min-w-0">
                  <div className="flex items-center gap-1.5 text-rose-600 mb-1">
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 truncate">Streak</span>
                  </div>
                  <p className="text-sm sm:text-lg font-extrabold text-slate-900 truncate">5 วัน 🔥</p>
                </div>
              </div>
            </div>

            {/* Right: "Continue Learning" Active Course Resume Card */}
            <div className="w-full lg:w-96 shrink-0 flex">
              <div className="w-full bg-white rounded-3xl p-6 border border-rose-100 crimson-shadow flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full -mr-10 -mt-10 blur-xl pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      <Play className="w-3 h-3 fill-rose-600 text-rose-600" />
                      <span>เรียนต่อจากเดิม</span>
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">เมื่อวานนี้</span>
                  </div>

                  {activeCourse ? (
                    <div className="space-y-3">
                      <div className="relative h-28 rounded-2xl overflow-hidden shadow-xs">
                        <img
                          src={activeCourse.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800'}
                          alt={activeCourse.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                          <span className="text-white text-xs font-bold truncate">
                            {activeCourse.title}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-700">บทที่ 3: State และ Lifecycle</span>
                          <span className="text-rose-600">68%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="crimson-gradient h-full rounded-full transition-all duration-500"
                            style={{ width: '68%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="relative h-28 rounded-2xl overflow-hidden shadow-xs">
                        <img
                          src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800"
                          alt="React course"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                          <span className="text-white text-xs font-bold truncate">
                            React สำหรับมือใหม่
                          </span>
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className="text-slate-700">บทที่ 2: JSX และ Component</span>
                          <span className="text-rose-600">45%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="crimson-gradient h-full rounded-full"
                            style={{ width: '45%' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      if (activeCourse) {
                        navigate(`/learn/${activeCourse.id}`);
                      } else {
                        navigate('/learn/4');
                      }
                    }}
                    className="w-full py-3 px-4 rounded-xl crimson-gradient text-white font-bold text-sm hover:opacity-95 shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2"
                  >
                    <span>เรียนต่อทันที (Continue Lesson)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Course Catalog Header & Live Filters */}
      <section id="course-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              สำรวจคอร์สเรียนทั้งหมด
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              ค้นหาและพัฒนาทักษะที่ตลาดต้องการ ด้วยเนื้อหาจากผู้เชี่ยวชาญชั้นนำ ({filteredCourses.length} คอร์ส)
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            {/* Live Search Input */}
            <div className="relative w-full sm:w-64 md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อคอร์ส, ภาษา..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 shadow-xs"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between sm:justify-start gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm shadow-xs">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-400 sm:hidden">เรียงตาม:</span>
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-semibold text-slate-700 outline-none text-xs sm:text-sm cursor-pointer"
              >
                <option value="popular">ยอดนิยมสูงสุด</option>
                <option value="rating">คะแนนรีวิวสูงสุด</option>
                <option value="newest">คอร์สมาใหม่</option>
                <option value="price_asc">คอร์สฟรี / ราคาต่ำสุด</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Category Tabs (Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition cursor-pointer ${
                selectedCategory === cat
                  ? 'crimson-gradient text-white shadow-md shadow-rose-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 4. Course Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 pt-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
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
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8 crimson-shadow">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 mx-auto flex items-center justify-center mb-4">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">ไม่พบคอร์สเรียนที่ตรงกับคำค้นหา</h3>
            <p className="text-slate-500 text-sm mt-1">
              ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองเพื่อดูคอร์สทั้งหมด
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Courses');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl crimson-gradient text-white font-bold text-sm shadow-sm"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredCourses.map((course) => {
              const bookmarked = isBookmarked(course.id);

              return (
                <div
                  key={course.id}
                  className="bg-white rounded-3xl border border-rose-100/80 overflow-hidden crimson-shadow crimson-shadow-hover flex flex-col group"
                >
                  {/* Card Thumbnail Area */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Category Badge */}
                    <div className="absolute top-3.5 left-3.5">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-white/90 backdrop-blur-md text-slate-800 shadow-sm">
                        {course.category}
                      </span>
                    </div>

                    {/* Bookmark Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(course.id);
                      }}
                      className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-600 hover:text-rose-600 hover:scale-110 transition shadow-sm"
                      title={bookmarked ? 'ลบบุ๊กมาร์ก' : 'บันทึกคอร์สนี้'}
                    >
                      <Bookmark
                        className={`w-4 h-4 ${bookmarked ? 'fill-rose-600 text-rose-600' : ''}`}
                      />
                    </button>

                    {/* Level & Price on Thumbnail Bottom */}
                    <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md">
                        {course.level}
                      </span>
                      <span className="text-sm font-black text-rose-300 drop-shadow">
                        {course.price === 0 ? 'คอร์สฟรี' : `฿${course.price}`}
                      </span>
                    </div>
                  </div>

                  {/* Card Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Rating & Duration */}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{course.rating || '4.9'}</span>
                          <span className="text-slate-400 font-normal">
                            ({course.reviewsCount || 120})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 font-medium">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{course.duration || '12 ชม.'}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-rose-600 transition line-clamp-2 leading-snug">
                        {course.title}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {course.description || 'หลักสูตรพัฒนาทักษะแบบเข้มข้น เพื่อการทำงานจริงอย่างมีประสิทธิภาพ'}
                      </p>
                    </div>

                    {/* Instructor & Actions Footer */}
                    <div className="pt-3 border-t border-slate-100 space-y-3.5">
                      {/* Instructor Avatar & Name */}
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full crimson-gradient text-white flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0">
                          {course.instructor ? course.instructor.charAt(0) : 'A'}
                        </div>
                        <span className="text-xs font-medium text-slate-600 truncate">
                          {course.instructor || 'ทีมอาจารย์ผู้เชี่ยวชาญ'}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setSelectedPreviewCourse(course)}
                          className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 text-slate-700 text-xs font-bold transition text-center"
                        >
                          ดูหลักสูตร (Syllabus)
                        </button>
                        <Link
                          to={`/course/${course.id}`}
                          className="w-full py-2 px-3 rounded-xl crimson-gradient hover:opacity-95 text-white text-xs font-bold transition text-center shadow-xs flex items-center justify-center gap-1"
                        >
                          <span>เข้าสู่คอร์ส</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Course Detail Preview Modal */}
      {selectedPreviewCourse && (
        <CoursePreviewModal
          course={selectedPreviewCourse}
          onClose={() => setSelectedPreviewCourse(null)}
        />
      )}
    </div>
  );
}

export default Home;