import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  PlusCircle,
  BookOpen,
  Users,
  Video,
  HelpCircle,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Sparkles,
  Layers,
  Check,
  CheckCircle2,
  AlertTriangle,
  X,
  Plus,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  Award,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Clock,
  Film,
  UploadCloud,
} from 'lucide-react';
import { 
  getCourses, 
  createCourse, 
  updateCourse, 
  deleteCourse, 
  getCourseQuiz, 
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  uploadVideo
} from '../api';
import EditLessonModal from '../components/EditLessonModal';

const SAMPLE_THUMBNAILS = [
  {
    label: 'React / Web',
    url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  },
  {
    label: 'Node / Backend',
    url: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800',
  },
  {
    label: 'Database / Code',
    url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800',
  },
  {
    label: 'Design / UI',
    url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800',
  },
  {
    label: 'Mobile / App',
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800',
  },
  {
    label: 'Cloud / DevOps',
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
  }
];

export default function InstructorDashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'courses';

  const [activeTab, setActiveTab] = useState(initialTab); // 'courses' | 'create' | 'quiz'
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [editingCourse, setEditingCourse] = useState(null);
  const [deletingCourse, setDeletingCourse] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New Course Form state
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState(user?.name || '');
  const [thumbnail, setThumbnail] = useState(SAMPLE_THUMBNAILS[0].url);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Quiz Management state
  const [selectedQuizCourseId, setSelectedQuizCourseId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newExplanation, setNewExplanation] = useState('');
  const [choices, setChoices] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [submittingQuestion, setSubmittingQuestion] = useState(false);

  // Question Edit & Delete state
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [questionActionLoading, setQuestionActionLoading] = useState(false);

  // Lesson Management state
  const courseIdParam = searchParams.get('courseId');
  const [selectedLessonCourseId, setSelectedLessonCourseId] = useState(
    courseIdParam ? parseInt(courseIdParam) : null
  );
  const [lessonsList, setLessonsList] = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(0);
  const [newLessonVideoFile, setNewLessonVideoFile] = useState(null);
  const [newLessonVideoPreview, setNewLessonVideoPreview] = useState('');
  const [newLessonUploading, setNewLessonUploading] = useState(false);
  const [submittingLesson, setSubmittingLesson] = useState(false);

  // Lesson Modals state
  const [editingLesson, setEditingLesson] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);
  const [lessonActionLoading, setLessonActionLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      if (!data.error) {
        setCourses(data);
        if (data.length > 0) {
          if (!selectedQuizCourseId) setSelectedQuizCourseId(data[0].id);
          if (!selectedLessonCourseId) setSelectedLessonCourseId(data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load quiz questions when quiz course changes
  useEffect(() => {
    if (selectedQuizCourseId && activeTab === 'quiz') {
      loadQuizQuestions(selectedQuizCourseId);
    }
  }, [selectedQuizCourseId, activeTab]);

  const loadQuizQuestions = async (courseId) => {
    try {
      setLoadingQuiz(true);
      const data = await getCourseQuiz(courseId, true);
      if (!data.error && data.questions) {
        setQuizQuestions(data.questions);
      } else {
        setQuizQuestions([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  // Load lessons when lesson course changes or activeTab becomes 'lessons'
  useEffect(() => {
    if (selectedLessonCourseId && activeTab === 'lessons') {
      loadLessonsForCourse(selectedLessonCourseId);
    }
  }, [selectedLessonCourseId, activeTab]);

  const loadLessonsForCourse = async (courseId) => {
    try {
      setLoadingLessons(true);
      const data = await getLessons(courseId, true);
      if (Array.isArray(data)) {
        setLessonsList(data);
      } else {
        setLessonsList([]);
      }
    } catch (err) {
      console.error(err);
      setLessonsList([]);
    } finally {
      setLoadingLessons(false);
    }
  };

  const handleCreateNewLesson = async (e) => {
    e.preventDefault();
    if (!selectedLessonCourseId) return;
    if (!newLessonTitle.trim()) {
      alert('กรุณากรอกชื่อบทเรียน');
      return;
    }

    let finalVideoUrl = newLessonVideoUrl;
    if (newLessonVideoFile) {
      setNewLessonUploading(true);
      try {
        const upRes = await uploadVideo(newLessonVideoFile);
        if (upRes.videoUrl) {
          finalVideoUrl = upRes.videoUrl;
        } else {
          alert(upRes.error || 'อัปโหลดวิดีโอไม่สำเร็จ');
          setNewLessonUploading(false);
          return;
        }
      } catch {
        alert('เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ');
        setNewLessonUploading(false);
        return;
      } finally {
        setNewLessonUploading(false);
      }
    }

    if (!finalVideoUrl || !finalVideoUrl.trim()) {
      alert('กรุณาเลือกไฟล์วิดีโอ หรือระบุ Video URL');
      return;
    }

    try {
      setSubmittingLesson(true);
      const res = await createLesson(selectedLessonCourseId, {
        title: newLessonTitle.trim(),
        videoUrl: finalVideoUrl.trim(),
        duration: newLessonDuration || null,
        order: lessonsList.length + 1,
      });

      if (res.lesson) {
        setNewLessonTitle('');
        setNewLessonVideoUrl('');
        setNewLessonVideoFile(null);
        setNewLessonVideoPreview('');
        setNewLessonDuration(0);
        await loadLessonsForCourse(selectedLessonCourseId);
        await loadCourses();
      } else {
        alert(res.error || 'สร้างบทเรียนไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการสร้างบทเรียน');
    } finally {
      setSubmittingLesson(false);
    }
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    try {
      setLessonActionLoading(true);
      const res = await deleteLesson(deletingLesson.id);
      if (!res.error) {
        setDeletingLesson(null);
        await loadLessonsForCourse(selectedLessonCourseId);
        await loadCourses();
      } else {
        alert(res.error || 'ลบบทเรียนไม่สำเร็จ');
      }
    } catch {
      alert('เกิดข้อผิดพลาดในการลบบทเรียน');
    } finally {
      setLessonActionLoading(false);
    }
  };

  const handleMoveLessonOrder = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= lessonsList.length) return;

    const newLessons = [...lessonsList];
    const [moved] = newLessons.splice(index, 1);
    newLessons.splice(targetIndex, 0, moved);

    // Optimistic update
    setLessonsList(newLessons);

    try {
      const orderedIds = newLessons.map((l) => l.id);
      await reorderLessons(selectedLessonCourseId, orderedIds);
    } catch (err) {
      console.error(err);
      loadLessonsForCourse(selectedLessonCourseId);
    }
  };

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return courses.filter(c => 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [courses, searchQuery]);

  // Overall Statistics
  const stats = useMemo(() => {
    const totalCourses = courses.length;
    const totalLessons = courses.reduce((acc, c) => acc + (c._count?.lessons || 0), 0);
    const totalStudents = courses.reduce((acc, c) => acc + (c._count?.enrollments || 0), 0);
    const totalQuestions = courses.reduce((acc, c) => acc + (c._count?.questions || 0), 0);
    const paidCoursesCount = courses.filter(c => c.price > 0).length;
    return { totalCourses, totalLessons, totalStudents, totalQuestions, paidCoursesCount };
  }, [courses]);

  // Handle Create Course
  const handleCreateCourse = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('กรุณากรอกชื่อคอร์ส');
      return;
    }
    if (!instructor.trim()) {
      setFormError('กรุณาระบุชื่อผู้สอน');
      return;
    }

    try {
      setSubmitting(true);
      const data = await createCourse({
        title: title.trim(),
        description: description.trim(),
        instructor: instructor.trim(),
        thumbnail: thumbnail.trim() || null,
        price: isFree ? 0 : price,
      });

      if (data.id) {
        alert('🎉 สร้างคอร์สสำเร็จ! คุณสามารถเพิ่มบทเรียนวิดีโอได้ทันที');
        setTitle('');
        setDescription('');
        setIsFree(true);
        setPrice(0);
        await loadCourses();
        setActiveTab('courses');
        setSearchParams({ tab: 'courses' });
      } else {
        setFormError(data.error || 'สร้างคอร์สไม่สำเร็จ');
      }
    } catch (err) {
      setFormError('เกิดข้อผิดพลาดในการเชื่อมต่อ');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Update Course
  const handleUpdateCourse = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      setActionLoading(true);
      const res = await updateCourse(editingCourse.id, {
        title: editingCourse.title,
        description: editingCourse.description,
        instructor: editingCourse.instructor,
        thumbnail: editingCourse.thumbnail,
        price: parseFloat(editingCourse.price) || 0,
      });

      if (!res.error) {
        alert('✅ อัปเดตข้อมูลคอร์สเรียบร้อยแล้ว');
        setEditingCourse(null);
        loadCourses();
      } else {
        alert(res.error || 'ไม่สามารถอัปเดตได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Course
  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;

    try {
      setActionLoading(true);
      const res = await deleteCourse(deletingCourse.id);
      if (!res.error) {
        alert('🗑️ ลบคอร์สเรียบร้อยแล้ว');
        setDeletingCourse(null);
        loadCourses();
      } else {
        alert(res.error || 'ไม่สามารถลบคอร์สได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาด');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Add Quiz Question
  const handleAddQuizQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuizCourseId) return;

    if (!newQuestionText.trim()) {
      alert('กรุณากรอกข้อความคำถาม');
      return;
    }

    const validChoices = choices.filter(c => c.text.trim() !== '');
    if (validChoices.length < 2) {
      alert('กรุณาระบุตัวเลือกอย่างน้อย 2 ตัวเลือก');
      return;
    }

    const hasCorrect = validChoices.some(c => c.isCorrect);
    if (!hasCorrect) {
      alert('กรุณากำหนดตัวเลือกที่ถูกต้องอย่างน้อย 1 ข้อ');
      return;
    }

    try {
      setSubmittingQuestion(true);
      const res = await createQuizQuestion(selectedQuizCourseId, {
        text: newQuestionText.trim(),
        explanation: newExplanation.trim() || null,
        choices: validChoices.map((c, idx) => ({
          text: c.text.trim(),
          isCorrect: c.isCorrect,
          order: idx + 1
        }))
      });

      if (!res.error) {
        alert('🎉 เพิ่มคำถามแบบทดสอบสำเร็จ!');
        setNewQuestionText('');
        setNewExplanation('');
        setChoices([
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ]);
        loadQuizQuestions(selectedQuizCourseId);
        loadCourses();
      } else {
        alert(res.error || 'ไม่สามารถสร้างคำถามได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกคำถาม');
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleStartEditQuestion = (q) => {
    setEditingQuestion({
      id: q.id,
      text: q.text,
      explanation: q.explanation || '',
      choices: q.choices && q.choices.length > 0 
        ? q.choices.map(c => ({ id: c.id, text: c.text, isCorrect: Boolean(c.isCorrect) }))
        : [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
            { text: '', isCorrect: false },
          ]
    });
  };

  const handleSaveEditQuestion = async (e) => {
    e.preventDefault();
    if (!editingQuestion) return;

    if (!editingQuestion.text.trim()) {
      alert('กรุณากรอกข้อความคำถาม');
      return;
    }

    const validChoices = editingQuestion.choices.filter(c => c.text && c.text.trim() !== '');
    if (validChoices.length < 2) {
      alert('ต้องมีตัวเลือกอย่างน้อย 2 ตัวเลือก');
      return;
    }

    const hasCorrect = validChoices.some(c => c.isCorrect);
    if (!hasCorrect) {
      alert('กรุณากำหนดตัวเลือกที่ถูกต้องอย่างน้อย 1 ข้อ');
      return;
    }

    try {
      setQuestionActionLoading(true);
      const res = await updateQuizQuestion(editingQuestion.id, {
        text: editingQuestion.text.trim(),
        explanation: editingQuestion.explanation ? editingQuestion.explanation.trim() : null,
        choices: validChoices.map((c, idx) => ({
          text: c.text.trim(),
          isCorrect: Boolean(c.isCorrect),
          order: idx + 1
        }))
      });

      if (!res.error) {
        alert('✅ แก้ไขคำถามเรียบร้อยแล้ว');
        setEditingQuestion(null);
        await loadQuizQuestions(selectedQuizCourseId);
        await loadCourses();
      } else {
        alert(res.error || 'ไม่สามารถแก้ไขคำถามได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการบันทึกการแก้ไข');
    } finally {
      setQuestionActionLoading(false);
    }
  };

  const handleDeleteQuizQuestion = async () => {
    if (!deletingQuestion) return;

    try {
      setQuestionActionLoading(true);
      const res = await deleteQuizQuestion(deletingQuestion.id);
      if (!res.error) {
        alert('🗑️ ลบคำถามเรียบร้อยแล้ว');
        setDeletingQuestion(null);
        await loadQuizQuestions(selectedQuizCourseId);
        await loadCourses();
      } else {
        alert(res.error || 'ไม่สามารถลบคำถามได้');
      }
    } catch (err) {
      alert('เกิดข้อผิดพลาดในการลบคำถาม');
    } finally {
      setQuestionActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      {/* Top Header Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden bg-gradient-to-r from-rose-900 via-rose-800 to-slate-900 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-rose-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>INSTRUCTOR HUB • แดชบอร์ดผู้สอน</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              จัดการหลักสูตรและเนื้อหาการสอน
            </h1>
            <p className="text-rose-100/80 text-xs sm:text-sm font-medium leading-relaxed">
              ยินดีต้อนรับอาจารย์ <strong>{user?.name || 'ผู้สอน'}</strong>! สร้างคอร์สใหม่ เพิ่มบทเรียนวิดีโอ 
              และจัดการแบบทดสอบ Quiz เพื่อพัฒนาทักษะผู้เรียนได้อย่างครบวงจร
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setActiveTab('create');
                setSearchParams({ tab: 'create' });
              }}
              className="px-5 py-3 rounded-2xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-sm shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-rose-600" />
              <span>สร้างคอร์สใหม่</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                setSearchParams({ tab: 'quiz' });
              }}
              className="px-4 py-3 rounded-2xl bg-rose-700/60 hover:bg-rose-700 text-white border border-rose-500/40 font-bold text-sm transition flex items-center gap-2 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-rose-200" />
              <span>จัดการ Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">คอร์สทั้งหมด</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalCourses}</h3>
            <span className="text-[11px] text-slate-400 font-medium">เปิดสอนในระบบ</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">นักเรียนลงทะเบียน</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalStudents}</h3>
            <span className="text-[11px] text-blue-600 font-semibold">Active Learners</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">วิดีโอบทเรียน</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalLessons}</h3>
            <span className="text-[11px] text-slate-400 font-medium">เนื้อหาวิดีโอทั้งหมด</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-rose-100/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <HelpCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">แบบทดสอบ Quiz</p>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900">{stats.totalQuestions}</h3>
            <span className="text-[11px] text-emerald-600 font-semibold">ข้อสอบวัดผล</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-rose-100/80 pb-4 mb-6 overflow-x-auto">
        <button
          onClick={() => {
            setActiveTab('courses');
            setSearchParams({ tab: 'courses' });
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'courses'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>คอร์สทั้งหมดของฉัน ({courses.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('create');
            setSearchParams({ tab: 'create' });
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'create'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>สร้างคอร์สใหม่ (Create Course)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('lessons');
            setSearchParams({ tab: 'lessons', ...(selectedLessonCourseId && { courseId: selectedLessonCourseId }) });
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'lessons'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>จัดการบทเรียน ({stats.totalLessons} ตอน)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('quiz');
            setSearchParams({ tab: 'quiz' });
          }}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition flex items-center gap-2 shrink-0 cursor-pointer ${
            activeTab === 'quiz'
              ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30'
              : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 border border-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>จัดการแบบทดสอบ Quiz ({stats.totalQuestions} ข้อ)</span>
        </button>
      </div>

      {/* ================= TAB 1: COURSES LIST ================= */}
      {activeTab === 'courses' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-rose-100/80 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อคอร์ส หรือผู้สอน..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
              />
            </div>

            <button
              onClick={() => {
                setActiveTab('create');
                setSearchParams({ tab: 'create' });
              }}
              className="px-4 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เปิดคอร์สใหม่</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400">
              <div className="w-10 h-10 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-sm font-medium">กำลังโหลดข้อมูลหลักสูตร...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-rose-100 shadow-xs">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800 mb-1">ไม่พบคอร์สเรียนที่ตรงกับคำค้นหา</h3>
              <p className="text-xs text-slate-500 mb-4">เริ่มต้นสร้างคอร์สแรกของคุณเพื่อเริ่มสอนผู้เรียนได้ทันที</p>
              <button
                onClick={() => {
                  setActiveTab('create');
                  setSearchParams({ tab: 'create' });
                }}
                className="px-5 py-2.5 rounded-xl crimson-gradient text-white text-xs font-bold"
              >
                สร้างคอร์สเรียนแรก
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => {
                const lessonCount = course._count?.lessons || 0;
                const studentCount = course._count?.enrollments || 0;
                const questionCount = course._count?.questions || 0;

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-3xl border border-rose-100/80 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden group"
                  >
                    {/* Course Thumbnail */}
                    <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                      
                      {/* Price Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black shadow-md ${
                          course.price === 0
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rose-600 text-white'
                        }`}>
                          {course.price === 0 ? 'เรียนฟรี' : `฿${course.price}`}
                        </span>
                      </div>

                      {/* Instructor Name */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <p className="text-xs text-rose-200 font-medium truncate">
                          👨‍🏫 {course.instructor}
                        </p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 line-clamp-1 mb-2 group-hover:text-rose-600 transition">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                          {course.description || 'ไม่มีคำอธิบายสำหรับคอร์สนี้'}
                        </p>

                        {/* Counts Badge */}
                        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-4">
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">บทเรียน</p>
                            <p className="text-xs font-bold text-slate-800">{lessonCount} ตอน</p>
                          </div>
                          <div className="border-x border-slate-200/80">
                            <p className="text-[10px] text-slate-400 font-medium">นักเรียน</p>
                            <p className="text-xs font-bold text-blue-600">{studentCount} คน</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-medium">คำถาม Quiz</p>
                            <p className="text-xs font-bold text-emerald-600">{questionCount} ข้อ</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        {/* Primary: Manage Lessons & Manage Quiz */}
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSelectedLessonCourseId(course.id);
                              setActiveTab('lessons');
                              setSearchParams({ tab: 'lessons', courseId: course.id });
                            }}
                            className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100/80 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-rose-200/70 cursor-pointer"
                          >
                            <Film className="w-3.5 h-3.5" />
                            <span>🎬 จัดการบทเรียน ({lessonCount})</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedQuizCourseId(course.id);
                              setActiveTab('quiz');
                              setSearchParams({ tab: 'quiz', courseId: course.id });
                            }}
                            className="py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-emerald-200/70 cursor-pointer"
                          >
                            <HelpCircle className="w-3.5 h-3.5" />
                            <span>+ จัดการ Quiz</span>
                          </button>
                        </div>

                        {/* Secondary: Preview, Edit, Delete */}
                        <div className="flex items-center gap-1.5">
                          <Link
                            to={`/course/${course.id}`}
                            className="flex-1 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold text-center transition flex items-center justify-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>ดูหน้าคอร์ส</span>
                          </Link>

                          <button
                            onClick={() => setEditingCourse(course)}
                            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition cursor-pointer"
                            title="แก้ไขข้อมูลคอร์ส"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingCourse(course)}
                            className="p-2 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-600 transition cursor-pointer"
                            title="ลบคอร์ส"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: CREATE COURSE FORM ================= */}
      {activeTab === 'create' && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl border border-rose-100/80 shadow-md p-6 sm:p-10 space-y-8">
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
                <PlusCircle className="w-6 h-6 text-rose-600" />
                <span>สร้างหลักสูตรใหม่ (New Course Creation)</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                กรอกข้อมูลเบื้องต้นเกี่ยวกับหลักสูตร เมื่อสร้างเสร็จแล้วคุณจะสามารถเพิ่มบทเรียนวิดีโอและแบบทดสอบได้ทันที
              </p>
            </div>

            {formError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCourse} className="space-y-6">
              {/* Title & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    ชื่อหลักสูตร (Course Title) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น Next.js 15 & Tailwind CSS Fullstack Masterclass"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    ชื่อผู้สอน (Instructor Name) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="เช่น อ.สมชาย ใจดี"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  รายละเอียดและเนื้อหาหลักสูตร (Course Description)
                </label>
                <textarea
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายสิ่งที่ผู้เรียนจะได้รับ เทคโนโลยีที่ใช้ และเป้าหมายของหลักสูตรนี้..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition resize-y"
                ></textarea>
              </div>

              {/* Price Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  รูปแบบราคาหลักสูตร (Pricing Model)
                </label>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFree(true);
                      setPrice(0);
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      isFree
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900">🎉 เรียนฟรี (Free)</p>
                      <p className="text-xs text-slate-500 mt-0.5">เปิดให้นักเรียนทุกคนลงทะเบียนเรียนได้ทันที</p>
                    </div>
                    {isFree && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsFree(false);
                      if (price === 0) setPrice(499);
                    }}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between ${
                      !isFree
                        ? 'border-rose-500 bg-rose-50/60 ring-2 ring-rose-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/60'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-slate-900">💳 กำหนดราคา (Paid)</p>
                      <p className="text-xs text-slate-500 mt-0.5">ระบุค่าเล่าเรียนเป็นสกุลเงินบาท (THB)</p>
                    </div>
                    {!isFree && <CheckCircle2 className="w-5 h-5 text-rose-600 shrink-0" />}
                  </button>
                </div>

                {!isFree && (
                  <div className="relative max-w-xs mt-2">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">฿</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      className="w-full pl-9 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition"
                      placeholder="เช่น 499"
                    />
                  </div>
                )}
              </div>

              {/* Thumbnail URL & Preset selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  รูปภาพหน้าปกหลักสูตร (Thumbnail Image URL)
                </label>
                <input
                  type="url"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition mb-3"
                />

                {/* Preset Chips */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500">หรือเลือกจากภาพสำเร็จรูป:</span>
                  <div className="flex flex-wrap gap-2">
                    {SAMPLE_THUMBNAILS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setThumbnail(s.url)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                          thumbnail === s.url
                            ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Live Preview */}
                {thumbnail && (
                  <div className="mt-4 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 h-52 relative">
                    <img
                      src={thumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                      }}
                    />
                    <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg text-white text-[11px] font-semibold">
                      แสดงตัวอย่างภาพหน้าปก
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('courses');
                    setSearchParams({ tab: 'courses' });
                  }}
                  className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 transition cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl crimson-gradient text-white text-xs sm:text-sm font-bold shadow-md shadow-rose-600/30 hover:opacity-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังสร้างคอร์ส...</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>สร้างคอร์สเรียนทันที</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB: LESSONS MANAGER ================= */}
      {activeTab === 'lessons' && (
        <div className="space-y-8">
          {/* Course Selector for Lessons */}
          <div className="bg-white p-5 rounded-3xl border border-rose-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">เลือกหลักสูตรที่ต้องการจัดการบทเรียน</h3>
              <p className="text-xs text-slate-500">เลือกคอร์สเพื่อดู แก้ไข สลับลำดับ หรือเพิ่มบทเรียนวิดีโอใหม่</p>
            </div>

            <select
              value={selectedLessonCourseId || ''}
              onChange={(e) => {
                const cId = parseInt(e.target.value);
                setSelectedLessonCourseId(cId);
                setSearchParams({ tab: 'lessons', courseId: cId });
              }}
              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c._count?.lessons || 0} ตอน)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: List of Lessons */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <Film className="w-4 h-4 text-rose-600" />
                  <span>รายการบทเรียนทั้งหมด ({lessonsList.length} ตอน)</span>
                </h4>
                <span className="text-[11px] text-slate-400">
                  กด ▲ ▼ เพื่อสลับลำดับบทเรียน
                </span>
              </div>

              {loadingLessons ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-rose-100">
                  <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-medium">กำลังโหลดบทเรียน...</p>
                </div>
              ) : lessonsList.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-rose-100 shadow-xs">
                  <Film className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800">ยังไม่มีบทเรียนในคอร์สนี้</p>
                  <p className="text-xs text-slate-500 mt-1">ใช้ฟอร์มด้านขวาเพื่อเพิ่มบทเรียนวิดีโอตอนแรก</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lessonsList.map((lesson, idx) => (
                    <div
                      key={lesson.id}
                      className="p-4 sm:p-5 rounded-2xl bg-white border border-rose-100 shadow-xs hover:border-rose-300/80 transition space-y-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {/* Order Reorder Controls */}
                          <div className="flex flex-col items-center gap-0.5 shrink-0">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveLessonOrder(idx, -1)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                              title="เลื่อนขึ้น"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 font-extrabold text-xs flex items-center justify-center border border-rose-200">
                              {lesson.order || idx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={idx === lessonsList.length - 1}
                              onClick={() => handleMoveLessonOrder(idx, 1)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                              title="เลื่อนลง"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h5 className="font-bold text-sm text-slate-900 truncate">
                              {lesson.title}
                            </h5>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span>{lesson.duration ? `${Math.floor(lesson.duration / 60)}:${(lesson.duration % 60).toString().padStart(2, '0')} นาที` : 'ไม่ระบุเวลา'}</span>
                              </span>
                              <span className="truncate max-w-[200px] text-[11px] font-mono text-slate-400">
                                {lesson.videoUrl}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: Edit & Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => setEditingLesson(lesson)}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                            title="แก้ไขบทเรียนนี้"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-rose-600" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => setDeletingLesson(lesson)}
                            className="p-2 rounded-xl border border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                            title="ลบบทเรียนนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Add New Lesson Form */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-rose-100 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-rose-600" />
                  <span>เพิ่มบทเรียนใหม่ในคอร์สนี้</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  อัปโหลดวิดีโอหรือระบุ URL พร้อมตั้งชื่อบทเรียน
                </p>
              </div>

              <form onSubmit={handleCreateNewLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ชื่อบทเรียน <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newLessonTitle}
                    onChange={(e) => setNewLessonTitle(e.target.value)}
                    placeholder="เช่น บทที่ 2: React Hooks และ State Management"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                  />
                </div>

                {/* Video Upload or URL */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    ไฟล์วิดีโอ / ลิงก์วิดีโอ <span className="text-rose-500">*</span>
                  </label>
                  
                  <div className="space-y-2">
                    <input
                      type="file"
                      id="new-lesson-video"
                      accept="video/mp4,video/webm,video/ogg"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setNewLessonVideoFile(file);
                          setNewLessonVideoPreview(URL.createObjectURL(file));
                        }
                      }}
                      className="hidden"
                    />

                    <div
                      onClick={() => document.getElementById('new-lesson-video')?.click()}
                      className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 rounded-xl p-4 text-center cursor-pointer transition"
                    >
                      <UploadCloud className="w-7 h-7 text-rose-500 mx-auto mb-1" />
                      <p className="text-xs font-bold text-slate-700">
                        {newLessonVideoFile ? newLessonVideoFile.name : 'เลือกไฟล์วิดีโอเพื่ออัปโหลด'}
                      </p>
                      <p className="text-[10px] text-slate-400">MP4, WEBM (สูงสุด 100 MB)</p>
                    </div>

                    <div className="relative">
                      <span className="text-[10px] text-slate-400 mb-1 block">หรือใส่ Video URL โดยตรง:</span>
                      <input
                        type="text"
                        value={newLessonVideoUrl}
                        onChange={(e) => {
                          setNewLessonVideoUrl(e.target.value);
                          setNewLessonVideoPreview(e.target.value);
                        }}
                        placeholder="https://... หรือ /uploads/videos/xxx.mp4"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                      />
                    </div>

                    {newLessonVideoPreview && (
                      <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-video relative">
                        <video
                          src={newLessonVideoPreview}
                          controls
                          onLoadedMetadata={(e) => {
                            const d = e.target.duration;
                            if (d && isFinite(d) && d > 0) {
                              setNewLessonDuration(Math.round(d));
                            }
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submittingLesson || newLessonUploading}
                  className="w-full py-3 rounded-xl crimson-gradient text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingLesson || newLessonUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังบันทึกบทเรียน...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>บันทึกบทเรียนนี้</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: QUIZ MANAGER ================= */}
      {activeTab === 'quiz' && (
        <div className="space-y-8">
          {/* Course Selector for Quiz */}
          <div className="bg-white p-5 rounded-3xl border border-rose-100/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">เลือกหลักสูตรที่ต้องการจัดการข้อสอบ</h3>
              <p className="text-xs text-slate-500">เลือกคอร์สเพื่อดูและเพิ่มคำถามแบบทดสอบ (Quiz Questions)</p>
            </div>

            <select
              value={selectedQuizCourseId || ''}
              onChange={(e) => setSelectedQuizCourseId(parseInt(e.target.value))}
              className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition cursor-pointer"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c._count?.questions || 0} ข้อ)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Col: List of Questions */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-rose-600" />
                  <span>รายการคำถามในคอร์สนี้ ({quizQuestions.length} ข้อ)</span>
                </h4>
              </div>

              {loadingQuiz ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-rose-100">
                  <div className="w-8 h-8 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs font-medium">กำลังโหลดคำถาม Quiz...</p>
                </div>
              ) : quizQuestions.length === 0 ? (
                <div className="text-center py-12 px-4 bg-white rounded-3xl border border-rose-100 shadow-xs">
                  <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-sm text-slate-800">ยังไม่มีคำถามสำหรับคอร์สนี้</p>
                  <p className="text-xs text-slate-500 mt-1">ใช้ฟอร์มด้านขวาเพื่อเพิ่มคำถามและตัวเลือกแรก</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {quizQuestions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-white border border-rose-100 shadow-xs space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5 flex-1">
                          <span className="w-6 h-6 rounded-lg bg-rose-50 text-rose-700 font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 border border-rose-200">
                            {idx + 1}
                          </span>
                          <h5 className="font-bold text-sm text-slate-900 leading-snug">
                            {q.text}
                          </h5>
                        </div>

                        {/* Edit & Delete Question Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditQuestion(q)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
                            title="แก้ไขคำถามนี้"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>แก้ไข</span>
                          </button>
                          <button
                            onClick={() => setDeletingQuestion(q)}
                            className="p-1.5 rounded-lg border border-rose-100 hover:bg-rose-50 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                            title="ลบคำถามนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Choices preview */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8">
                        {q.choices?.map((c, cIdx) => (
                          <div
                            key={c.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition ${
                              c.isCorrect
                                ? 'border-emerald-300 bg-emerald-50/80 text-emerald-950 font-semibold'
                                : 'border-slate-100 bg-slate-50/60 text-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
                                c.isCorrect
                                  ? 'bg-emerald-600 text-white'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {c.isCorrect ? '✓' : String.fromCharCode(65 + cIdx)}
                              </span>
                              <span className="truncate">{c.text}</span>
                            </div>
                            {c.isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded shrink-0">
                                คำตอบที่ถูกต้อง
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="ml-8 p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <p><span className="font-bold">คำอธิบาย:</span> {q.explanation}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Col: Add Question Form */}
            <div className="lg:col-span-5">
              <div className="bg-white p-6 rounded-3xl border border-rose-100/80 shadow-md space-y-5 sticky top-24">
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <PlusCircle className="w-4 h-4 text-rose-600" />
                    <span>เพิ่มข้อสอบใหม่ (Add New Question)</span>
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">ระบุคำถาม ตัวเลือก และติ๊กเลือกข้อที่ถูกต้อง</p>
                </div>

                <form onSubmit={handleAddQuizQuestion} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ข้อความคำถาม (Question) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows="2"
                      required
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="เช่น ใน React ฟังก์ชันใดใช้สำหรับ Side Effect?"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ตัวเลือกคำตอบ (Choices) <span className="text-rose-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {choices.map((c, idx) => {
                        const letter = String.fromCharCode(65 + idx);
                        return (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="correctChoice"
                              checked={c.isCorrect}
                              onChange={() => {
                                setChoices(prev => prev.map((item, i) => ({
                                  ...item,
                                  isCorrect: i === idx
                                })));
                              }}
                              className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                              title="เลือกเป็นคำตอบที่ถูกต้อง"
                            />
                            <div className="relative flex-1">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                                {letter}.
                              </span>
                              <input
                                type="text"
                                value={c.text}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setChoices(prev => prev.map((item, i) => i === idx ? { ...item, text: val } : item));
                                }}
                                placeholder={`ตัวเลือก ${letter} ${idx < 2 ? '(จำเป็น)' : '(ไม่บังคับ)'}`}
                                className={`w-full pl-8 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition ${
                                  c.isCorrect ? 'bg-emerald-50/50 border-emerald-300 font-semibold' : 'bg-slate-50 border-slate-200'
                                }`}
                              />
                            </div>
                            {c.isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-600 px-1.5 py-0.5 rounded bg-emerald-50 shrink-0">
                                เฉลย ✓
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      คำอธิบายเฉลย (Explanation - ทางเลือก)
                    </label>
                    <textarea
                      rows="2"
                      value={newExplanation}
                      onChange={(e) => setNewExplanation(e.target.value)}
                      placeholder="อธิบายเหตุผลว่าทำไมคำตอบนี้จึงถูกต้อง เพื่อช่วยให้ผู้เรียนเข้าใจลึกซึ้งยิ่งขึ้น..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingQuestion}
                    className="w-full py-3 rounded-xl crimson-gradient text-white font-bold text-xs shadow-md shadow-rose-600/30 hover:opacity-95 transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {submittingQuestion ? (
                      <span>กำลังบันทึกคำถาม...</span>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>บันทึกคำถามลงในคอร์ส</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT COURSE MODAL ================= */}
      {editingCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-600" />
                <h4 className="text-lg font-extrabold text-slate-900">แก้ไขข้อมูลคอร์ส</h4>
              </div>
              <button
                onClick={() => setEditingCourse(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อคอร์ส</label>
                <input
                  type="text"
                  required
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้สอน</label>
                <input
                  type="text"
                  required
                  value={editingCourse.instructor}
                  onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">รายละเอียด</label>
                <textarea
                  rows="3"
                  value={editingCourse.description || ''}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    min="0"
                    value={editingCourse.price}
                    onChange={(e) => setEditingCourse({ ...editingCourse, price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">URL รูปภาพหน้าปก</label>
                  <input
                    type="url"
                    value={editingCourse.thumbnail || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-6 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs shadow-md shadow-rose-600/30"
                >
                  {actionLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE COURSE MODAL ================= */}
      {deletingCourse && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">
                  ยืนยันการลบหลักสูตรนี้?
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  คุณต้องการลบคอร์ส <strong className="text-slate-800">"{deletingCourse.title}"</strong> ใช่หรือไม่?
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl text-xs text-rose-700 border border-rose-100 leading-relaxed">
              ⚠️ การลบจะทำให้บทเรียนวิดีโอ, คำถาม Quiz, และข้อมูลการลงทะเบียนทั้งหมดของคอร์สนี้ถูกลบถาวร
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={actionLoading}
                onClick={() => setDeletingCourse(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
              >
                ยกเลิก
              </button>
              <button
                disabled={actionLoading}
                onClick={handleDeleteCourse}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm shadow-rose-600/30 flex items-center gap-1.5"
              >
                {actionLoading ? 'กำลังลบ...' : 'ยืนยันลบคอร์ส'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= EDIT QUESTION MODAL ================= */}
      {editingQuestion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-rose-600" />
                <h4 className="text-lg font-extrabold text-slate-900">แก้ไขคำถามแบบทดสอบ (Edit Quiz Question)</h4>
              </div>
              <button
                onClick={() => setEditingQuestion(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  ข้อความคำถาม (Question) <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows="2"
                  required
                  value={editingQuestion.text}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                ></textarea>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    ตัวเลือกคำตอบ (Choices) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">เลือก Radio เพื่อระบุคำตอบที่ถูกต้อง</span>
                </div>

                <div className="space-y-2">
                  {editingQuestion.choices.map((c, idx) => {
                    const letter = String.fromCharCode(65 + idx);
                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="editCorrectChoice"
                          checked={c.isCorrect}
                          onChange={() => {
                            setEditingQuestion(prev => ({
                              ...prev,
                              choices: prev.choices.map((item, i) => ({
                                ...item,
                                isCorrect: i === idx
                              }))
                            }));
                          }}
                          className="w-4 h-4 text-rose-600 focus:ring-rose-500 cursor-pointer"
                          title="เลือกเป็นคำตอบที่ถูกต้อง"
                        />
                        <div className="relative flex-1">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                            {letter}.
                          </span>
                          <input
                            type="text"
                            value={c.text}
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditingQuestion(prev => ({
                                ...prev,
                                choices: prev.choices.map((item, i) => i === idx ? { ...item, text: val } : item)
                              }));
                            }}
                            placeholder={`ตัวเลือก ${letter}`}
                            className={`w-full pl-8 pr-3 py-2 border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 transition ${
                              c.isCorrect ? 'bg-emerald-50/60 border-emerald-300 font-semibold' : 'bg-slate-50 border-slate-200'
                            }`}
                          />
                        </div>
                        {c.isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 px-2 py-0.5 rounded bg-emerald-50 shrink-0">
                            เฉลย ✓
                          </span>
                        )}
                        {editingQuestion.choices.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuestion(prev => ({
                                ...prev,
                                choices: prev.choices.filter((_, i) => i !== idx)
                              }));
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                            title="ลบตัวเลือกนี้"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {editingQuestion.choices.length < 5 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingQuestion(prev => ({
                        ...prev,
                        choices: [...prev.choices, { text: '', isCorrect: false }]
                      }));
                    }}
                    className="mt-2 text-xs text-rose-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>เพิ่มตัวเลือกอีก</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  คำอธิบายเฉลย (Explanation)
                </label>
                <textarea
                  rows="2"
                  value={editingQuestion.explanation}
                  onChange={(e) => setEditingQuestion({ ...editingQuestion, explanation: e.target.value })}
                  placeholder="คำอธิบายที่แสดงเมื่อผู้เรียนทำแบบทดสอบเสร็จ..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingQuestion(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={questionActionLoading}
                  className="px-6 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50"
                >
                  {questionActionLoading ? 'กำลังบันทึก...' : 'บันทึกการแก้ไขคำถาม'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= DELETE QUESTION MODAL ================= */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">
                  ยืนยันการลบคำถามนี้?
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  "{deletingQuestion.text}"
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl text-xs text-rose-700 border border-rose-100 leading-relaxed">
              ⚠️ การลบคำถามนี้จะลบตัวเลือกคำตอบทั้งหมดของข้อนี้ออกจากระบบด้วย
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={questionActionLoading}
                onClick={() => setDeletingQuestion(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                disabled={questionActionLoading}
                onClick={handleDeleteQuizQuestion}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {questionActionLoading ? 'กำลังลบ...' : 'ยืนยันลบคำถาม'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= EDIT LESSON MODAL ================= */}
      {editingLesson && (
        <EditLessonModal
          isOpen={!!editingLesson}
          onClose={() => setEditingLesson(null)}
          lesson={editingLesson}
          onSuccess={async () => {
            setEditingLesson(null);
            await loadLessonsForCourse(selectedLessonCourseId);
            await loadCourses();
          }}
        />
      )}

      {/* ================= DELETE LESSON MODAL ================= */}
      {deletingLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 space-y-5 animate-in zoom-in-95 duration-150 text-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-slate-900">
                  ยืนยันการลบบทเรียนนี้?
                </h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  "{deletingLesson.title}"
                </p>
              </div>
            </div>

            <div className="p-3 bg-rose-50 rounded-2xl text-xs text-rose-700 border border-rose-100 leading-relaxed">
              ⚠️ การลบบทเรียนจะทำให้ประวัติการเรียน (Progress) ในบทนี้ถูกลบออกจากระบบด้วย
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                disabled={lessonActionLoading}
                onClick={() => setDeletingLesson(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs cursor-pointer hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                disabled={lessonActionLoading}
                onClick={handleDeleteLesson}
                className="px-5 py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-sm shadow-rose-600/30 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {lessonActionLoading ? 'กำลังลบ...' : 'ยืนยันลบบทเรียน'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
