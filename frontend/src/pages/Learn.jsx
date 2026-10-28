import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Award, HelpCircle, Edit3, CheckCircle2 } from 'lucide-react';
import { getLessons, updateProgress, getCourseProgress, getLessonProgress, getCourse } from '../api';
import { isYouTubeUrl, getEmbedUrl } from '../utils/videoUtils';
import ProgressBar from '../components/ProgressBar';
import CertificateModal from '../components/CertificateModal';
import QuizModal from '../components/QuizModal';
import EditLessonModal from '../components/EditLessonModal';

function Learn() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [course, setCourse] = useState(null);
    const [showCertModal, setShowCertModal] = useState(false);
    const [showQuizModal, setShowQuizModal] = useState(false);
    const [editingLesson, setEditingLesson] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [courseProgress, setCourseProgress] = useState({ percentage: 0, completedLessons: 0, totalLessons: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false); // สถานะกำลังบันทึก

    const videoRef = useRef(null);
    const saveTimeoutRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // โหลดบทเรียน + Progress
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const loadLessons = async () => {
            const data = await getLessons(id);
            if (data.error) {
                setError(data.error);
                setLoading(false);
                return;
            }

            setLessons(data);

            // เลือกบทเรียน: จาก URL ?lesson=xx หรือบทแรกที่ยังไม่จบ หรือบทแรก
            const lessonFromUrl = searchParams.get('lesson');
            let targetLesson;

            if (lessonFromUrl) {
                targetLesson = data.find(l => l.id === parseInt(lessonFromUrl));
            }

            if (!targetLesson) {
                targetLesson = data.find(l => !l.completed) || data[0];
            }

            if (targetLesson) {
                // ดึง progress ของบทนี้เพื่อ seek ไปตำแหน่งเดิม
                try {
                    const prog = await getLessonProgress(targetLesson.id);
                    setCurrentLesson({ ...targetLesson, watchedSeconds: prog?.watchedSeconds ?? targetLesson.watchedSeconds ?? 0 });
                } catch {
                    setCurrentLesson({ ...targetLesson, watchedSeconds: targetLesson.watchedSeconds ?? 0 });
                }
            }

            getCourse(id).then((c) => {
                if (!c.error) setCourse(c);
            }).catch(() => {});

            fetchCourseProgress();
            setLoading(false);
        };

        loadLessons();
    }, [id]);

    // ดึง % คอร์ส
    const fetchCourseProgress = async () => {
        const data = await getCourseProgress(id);
        if (!data.error) setCourseProgress(data);
    };

    // บันทึกความคืบหน้า (Debounced: รอ 3 วิ หลังเลิกกระทำ)
    const debouncedSave = useCallback((completed = false) => {
        if (!currentLesson || !videoRef.current) return;

        // ล้าง timeout เก่า
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

        const video = videoRef.current;
        const currentTime = Math.floor(video.currentTime);

        // ถ้า completed = true (จบวิดีโอ) → บันทึกทันที
        // ถ้าไม่ใช่ → รอ 3 วินาที ถ้าไม่มีการ seek/pause อีก ค่อยบันทึก
        const delay = completed ? 0 : 3000;

        saveTimeoutRef.current = setTimeout(async () => {
            setSaving(true);
            await updateProgress(currentLesson.id, currentTime, completed);
            setSaving(false);

            if (completed) {
                setLessons(prev => prev.map(l =>
                    l.id === currentLesson.id ? { ...l, completed: true } : l
                ));
                fetchCourseProgress();
            }
        }, delay);
    }, [currentLesson]);

    // ตั้งค่า Video Event Listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !currentLesson) return;

        const handlePause = () => debouncedSave(false);
        const handleTimeUpdate = () => {
            // บันทึกทุก 10 วินาทีที่เล่น (ลดจำนวน API calls)
            const currentTime = Math.floor(video.currentTime);
            if (currentTime > 0 && currentTime % 10 === 0) {
                debouncedSave(false);
            }
        };
        const handleEnded = () => debouncedSave(true);

        video.addEventListener('pause', handlePause);
        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('ended', handleEnded);
        };
    }, [currentLesson, debouncedSave]);

    // Seek ไปตำแหน่งเดิมเมื่อเปลี่ยนบทเรียน
    useEffect(() => {
        if (videoRef.current && currentLesson) {
            videoRef.current.currentTime = currentLesson.watchedSeconds || 0;
        }
    }, [currentLesson?.id]); // ← รันเมื่อเปลี่ยนบทเรียนเท่านั้น

    // บันทึกก่อนปิดหน้า / รีเฟรช
    useEffect(() => {
        const handleBeforeUnload = () => {
            if (currentLesson && videoRef.current) {
                const token = localStorage.getItem('token');
                if (token) {
                    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/progress`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            lessonId: currentLesson.id,
                            watchedSeconds: Math.floor(videoRef.current.currentTime),
                        }),
                        keepalive: true
                    }).catch(() => {});
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentLesson]);

    // เปลี่ยนบทเรียน
    const switchLesson = (lesson) => {
        // บันทึกบทปัจจุบันก่อนเปลี่ยน (ทันที ไม่ต้องรอ debounce)
        if (currentLesson && videoRef.current) {
            updateProgress(currentLesson.id, Math.floor(videoRef.current.currentTime), false);
        }

        // ดึง progress บทใหม่ แล้วเปลี่ยน
        getLessonProgress(lesson.id)
            .then(prog => {
                setCurrentLesson({ ...lesson, watchedSeconds: prog?.watchedSeconds ?? lesson.watchedSeconds ?? 0 });
            })
            .catch(() => {
                setCurrentLesson({ ...lesson, watchedSeconds: lesson.watchedSeconds ?? 0 });
            });
    };

    // สลับสถานะการเรียนจบของบทเรียน (กดคลิกที่ไอคอนถูก/ผิด)
    const toggleLessonCompleted = async (lesson, e) => {
        if (e) e.stopPropagation();
        const newCompleted = !lesson.completed;
        setLessons(prev => prev.map(l => l.id === lesson.id ? { ...l, completed: newCompleted } : l));
        
        await updateProgress(lesson.id, lesson.watchedSeconds || 0, newCompleted, true);
        fetchCourseProgress();
    };

    // ไปบทถัดไป
    const goToNextLesson = () => {
        const idx = lessons.findIndex(l => l.id === currentLesson.id);
        if (idx < lessons.length - 1) {
            switchLesson(lessons[idx + 1]);
        }
    };

    // ไปบทก่อนหน้า
    const goToPrevLesson = () => {
        const idx = lessons.findIndex(l => l.id === currentLesson.id);
        if (idx > 0) {
            switchLesson(lessons[idx - 1]);
        }
    };

    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <div className="text-center p-10 text-gray-500">กำลังโหลด...</div>;
    if (error) return (
        <div className="text-center p-10">
            <div className="bg-red-100 text-red-700 p-6 rounded-xl max-w-md mx-auto">
                <p className="text-lg font-semibold mb-2">⚠️ {error}</p>
                <button onClick={() => navigate(`/course/${id}`)} className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg">
                    ไปลงทะเบียน
                </button>
            </div>
        </div>
    );
    if (!currentLesson) return <div className="text-center p-10">ไม่พบบทเรียน</div>;

    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-white">
            {/* ซ้าย: Video */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="bg-gray-800 p-3 flex items-center gap-4 border-b border-gray-700">
                    <button onClick={() => navigate('/my-courses')} className="text-gray-300 hover:text-white text-sm">
                        ← กลับ
                    </button>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                            <span>ความคืบหน้าคอร์ส</span>
                            <span className="flex items-center gap-2">
                                {saving && <span className="text-xs text-gray-400">💾 กำลังบันทึก...</span>}
                                <span>{courseProgress.percentage}%</span>
                            </span>
                        </div>
                        <ProgressBar percentage={courseProgress.percentage} size="sm" showText={false} />
                    </div>
                    <button
                        onClick={() => setShowQuizModal(true)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-700/80 hover:bg-slate-700 text-white font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer border border-slate-600/80 shadow-xs shrink-0"
                    >
                        <HelpCircle className="w-4 h-4 text-rose-400" />
                        <span>แบบทดสอบ (Quiz)</span>
                    </button>
                    {courseProgress.percentage >= 100 && (
                        <button
                            onClick={() => setShowCertModal(true)}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-600 to-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 hover:opacity-95 transition cursor-pointer animate-pulse shrink-0"
                        >
                            <Award className="w-4 h-4 text-amber-200" />
                            <span>รับใบประกาศนียบัตร (Certificate)</span>
                        </button>
                    )}
                </div>

                {/* Video Player */}
                <div className="flex-1 bg-black flex items-center justify-center relative overflow-hidden min-h-[300px]">
                    {isYouTubeUrl(currentLesson.videoUrl) ? (
                        <iframe
                            key={currentLesson.id}
                            src={getEmbedUrl(currentLesson.videoUrl)}
                            title={currentLesson.title}
                            className="w-full h-full aspect-video border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                        />
                    ) : (
                        <video
                            ref={videoRef}
                            src={currentLesson.videoUrl}
                            controls
                            className="w-full max-h-full"
                            playsInline
                        />
                    )}
                </div>

                {/* Info + Navigation */}
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
                        <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h2 className="text-xl font-bold">{currentLesson.title}</h2>
                                {isYouTubeUrl(currentLesson.videoUrl) && (
                                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-950 text-red-400 border border-red-800/60 inline-flex items-center gap-1">
                                        ▶ YouTube Embed
                                    </span>
                                )}
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => setEditingLesson(currentLesson)}
                                        className="px-2.5 py-1 text-xs font-bold text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-600 border border-rose-500/40 rounded-lg transition flex items-center gap-1 cursor-pointer"
                                        title="แก้ไขบทเรียนนี้"
                                    >
                                        <Edit3 className="w-3.5 h-3.5" />
                                        <span>แก้ไขบทเรียน</span>
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-400 text-sm mt-0.5">
                                บทที่ {currentLesson.order} • {lessons.length} บทเรียน
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                            <button
                                onClick={(e) => toggleLessonCompleted(currentLesson, e)}
                                className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    currentLesson.completed
                                        ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-900/50'
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                                }`}
                                title={currentLesson.completed ? 'คลิกเพื่อเปลี่ยนสถานะเป็นยังไม่จบ' : 'คลิกเพื่อทำเครื่องหมายว่าเรียนจบ'}
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>{currentLesson.completed ? 'เรียนจบแล้ว' : 'ทำเครื่องหมายว่าเรียนจบ'}</span>
                            </button>
                            <button
                                onClick={goToPrevLesson}
                                disabled={currentIndex === 0}
                                className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-30 hover:bg-gray-600 cursor-pointer text-xs font-semibold"
                            >
                                ← ก่อนหน้า
                            </button>
                            <button
                                onClick={goToNextLesson}
                                disabled={currentIndex === lessons.length - 1}
                                className="px-4 py-2 bg-rose-600 rounded-lg disabled:opacity-30 hover:bg-rose-500 cursor-pointer text-xs font-semibold"
                            >
                                ถัดไป →
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ขวา: รายการบทเรียน */}
            <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col max-h-screen">
                <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-lg">📋 บทเรียนทั้งหมด</h3>
                </div>

                <div className="overflow-y-auto flex-1">
                    {lessons.map((lesson, idx) => (
                        <div
                            key={lesson.id}
                            onClick={() => switchLesson(lesson)}
                            className={`w-full text-left p-4 border-b border-gray-700 flex items-start gap-3 transition cursor-pointer hover:bg-gray-700 ${currentLesson.id === lesson.id ? 'bg-gray-700 border-l-4 border-l-blue-500' : ''
                                }`}
                        >
                            <button
                                type="button"
                                onClick={(e) => toggleLessonCompleted(lesson, e)}
                                title={lesson.completed ? 'ทำเครื่องหมายว่ายังเรียนไม่จบ' : 'ทำเครื่องหมายว่าเรียนจบแล้ว'}
                                className="mt-0.5 text-lg hover:scale-125 transition-transform cursor-pointer p-0.5 rounded focus:outline-none"
                            >
                                {lesson.completed ? '✅' : '⭕'}
                            </button>

                            <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${currentLesson.id === lesson.id ? 'text-blue-400' : ''}`}>
                                    {idx + 1}. {lesson.title}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {lesson.duration ? formatTime(lesson.duration) : 'ไม่ระบุ'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quiz Action in Sidebar */}
                <div className="p-3.5 border-t border-gray-700 bg-gray-800/90">
                    <button
                        onClick={() => setShowQuizModal(true)}
                        className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-950/40 transition cursor-pointer group"
                    >
                        <HelpCircle className="w-4 h-4 text-rose-200 group-hover:scale-110 transition-transform" />
                        <span>ทำแบบทดสอบวัดความรู้ (Quiz)</span>
                    </button>
                </div>
            </div>

            {/* Certificate Modal */}
            {showCertModal && (
                <CertificateModal
                    course={course || { id, title: currentLesson?.title || 'คอร์สเรียน', instructor: 'อาจารย์ผู้สอน' }}
                    user={user}
                    onClose={() => setShowCertModal(false)}
                />
            )}

            {/* Quiz Modal */}
            {showQuizModal && (
                <QuizModal
                    courseId={id}
                    courseTitle={course?.title || currentLesson?.title}
                    onClose={() => setShowQuizModal(false)}
                    onPassQuiz={() => {}}
                />
            )}

            {/* Edit Lesson Modal */}
            {editingLesson && (
                <EditLessonModal
                    isOpen={!!editingLesson}
                    onClose={() => setEditingLesson(null)}
                    lesson={editingLesson}
                    onSuccess={(updated) => {
                        setEditingLesson(null);
                        setLessons((prev) => prev.map((l) => (l.id === updated.id ? { ...l, ...updated } : l)));
                        if (currentLesson?.id === updated.id) {
                            setCurrentLesson((prev) => ({ ...prev, ...updated }));
                        }
                    }}
                />
            )}
        </div>
    );
}

export default Learn;