import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessons, updateProgress, getCourseProgress, getCourse } from '../api';

function Learn() {
    const { id } = useParams(); // courseId
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [courseProgress, setCourseProgress] = useState({ percentage: 0, completedLessons: 0, totalLessons: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [isBuffering, setIsBuffering] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);
    const [mobileTab, setMobileTab] = useState('video'); // 'video' | 'curriculum'

    const videoRef = useRef(null);
    const saveIntervalRef = useRef(null);
    const lastSeekedLessonIdRef = useRef(null);
    const hasAutoCompletedRef = useRef(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // โหลดข้อมูลคอร์สและบทเรียนทั้งหมด
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        Promise.all([
            getCourse(id),
            getLessons(id),
            getCourseProgress(id)
        ]).then(([courseData, lessonData, progressData]) => {
            if (courseData && !courseData.error) {
                setCourse(courseData);
            }

            if (lessonData.error) {
                setError(lessonData.error);
                setLoading(false);
                return;
            }

            setLessons(lessonData || []);

            if (lessonData && lessonData.length > 0) {
                // เลือกบทเรียนแรกที่ยังไม่จบ หรือบทแรก
                const firstIncomplete = lessonData.find(l => !l.completed);
                setCurrentLesson(firstIncomplete || lessonData[0]);
            }

            if (progressData && !progressData.error) {
                setCourseProgress(progressData);
            }

            setLoading(false);
        }).catch(err => {
            console.error('Error loading learn page data:', err);
            setError('เกิดข้อผิดพลาดในการโหลดบทเรียน');
            setLoading(false);
        });
    }, [id]);

    // ดึง % ความคืบหน้าของคอร์ส
    const fetchProgress = () => {
        getCourseProgress(id).then(data => {
            if (!data.error) setCourseProgress(data);
        });
    };

    // บันทึกความคืบหน้า (เรียกซ้ำเป็นระยะ หรือเมื่อจบ)
    const saveProgress = async (completed = false) => {
        if (!currentLesson || !videoRef.current) return;

        const video = videoRef.current;
        const currentSeconds = Math.floor(video.currentTime || 0);

        try {
            await updateProgress(
                currentLesson.id,
                currentSeconds,
                completed
            );

            if (completed) {
                // อัปเดตสถานะในหน้าจอทันที
                setLessons(prev => prev.map(l =>
                    l.id === currentLesson.id ? { ...l, completed: true } : l
                ));
                setCurrentLesson(prev => prev ? { ...prev, completed: true } : prev);
                fetchProgress();
            }
        } catch (err) {
            console.error('Save progress error:', err);
        }
    };

    // ตั้ง Interval บันทึกอัตโนมัติทุก 5 วินาทีระหว่างดู
    useEffect(() => {
        if (!currentLesson) return;

        if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);

        saveIntervalRef.current = setInterval(() => {
            if (videoRef.current && !videoRef.current.paused) {
                saveProgress(false);
            }
        }, 5000);

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        };
    }, [currentLesson]);

    // เมื่อเปลี่ยนบทเรียน ให้รีเซ็ต flag สำหรับ seek & auto complete
    useEffect(() => {
        hasAutoCompletedRef.current = false;
        setIsBuffering(false);
    }, [currentLesson?.id]);

    // เมื่อโหลด Metadata ของวิดีโอสำเร็จ (แก้ปัญหาค้างจากการ seek ก่อนพร้อม)
    const handleLoadedMetadata = () => {
        const video = videoRef.current;
        if (!video || !currentLesson) return;

        // บันทึก duration ลง state หากไม่มีหรือเพิ่งได้รับจากเบราว์เซอร์
        if (video.duration && isFinite(video.duration) && video.duration > 0) {
            const roundedDuration = Math.round(video.duration);
            if (!currentLesson.duration || Math.abs(currentLesson.duration - roundedDuration) > 2) {
                setCurrentLesson(prev => ({ ...prev, duration: roundedDuration }));
                setLessons(prev => prev.map(l => l.id === currentLesson.id ? { ...l, duration: roundedDuration } : l));
            }
        }

        // Seek ไปยังจุดเดิมอย่างปลอดภัย (ทำเพียงครั้งเดียวเมื่อสลับบท)
        if (lastSeekedLessonIdRef.current !== currentLesson.id) {
            lastSeekedLessonIdRef.current = currentLesson.id;
            const savedTime = currentLesson.watchedSeconds || 0;

            // ถ้าบทเรียนยังไม่จบ และไม่ได้อยู่ช่วงท้ายสุด (เหลือเกิน 3 วินาที)
            if (savedTime > 0 && video.duration && isFinite(video.duration) && savedTime < video.duration - 3) {
                try {
                    video.currentTime = savedTime;
                } catch (e) {
                    console.warn('Seek error:', e);
                }
            }
        }

        // คืนค่า playbackRate ที่เลือกไว้
        video.playbackRate = playbackRate;
    };

    // ตรวจสอบเวลาแบบเรียลไทม์ (ป้องกันกรณีคลิปค้าง หรือ onEnded ไม่ทำงานเมื่อใกล้จบ)
    const handleTimeUpdate = () => {
        const video = videoRef.current;
        if (!video || !video.duration || !isFinite(video.duration) || video.duration <= 0) return;

        // ถ้าดูจนเกือบจบ (เหลือไม่เกิน 1.2 วินาที หรือเกิน 98%) ถือว่าดูจบอัตโนมัติ
        const isNearEnd = (video.duration > 3 && video.currentTime >= video.duration - 1.2) ||
                          (video.duration > 15 && (video.currentTime / video.duration) >= 0.985);

        if (isNearEnd && !currentLesson?.completed && !hasAutoCompletedRef.current) {
            hasAutoCompletedRef.current = true;
            handleVideoEnded();
        }
    };

    // แสดงข้อความแจ้งเตือน Toast ชั่วคราว
    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 3500);
    };

    // วิดีโอจบ → บันทึกว่าจบแล้ว + เปลี่ยนบทเรียน
    const handleVideoEnded = () => {
        saveProgress(true);

        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
            const next = lessons[currentIndex + 1];
            showToast(`🎉 จบบทนี้แล้ว! กำลังไปบทถัดไป: "${next.title}"`);
            setTimeout(() => {
                switchLesson(next);
            }, 1800);
        } else {
            showToast('🏆 ยินดีด้วย! คุณเรียนจบคอร์สนี้สมบูรณ์แล้ว!');
        }
    };

    // เปลี่ยนบทเรียน
    const switchLesson = (lesson) => {
        if (!lesson || lesson.id === currentLesson?.id) return;
        if (currentLesson) saveProgress(false);
        setCurrentLesson(lesson);
        // สลับแท็บไปที่วิดีโอทันทีบนอุปกรณ์มือถือ
        setMobileTab('video');
    };

    // ปุ่มข้ามไปบทก่อนหน้า
    const handlePrevLesson = () => {
        const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
        if (currentIndex > 0) {
            switchLesson(lessons[currentIndex - 1]);
        }
    };

    // ปุ่มข้ามไปบทถัดไป
    const handleNextLesson = () => {
        const currentIndex = lessons.findIndex(l => l.id === currentLesson?.id);
        if (currentIndex < lessons.length - 1) {
            switchLesson(lessons[currentIndex + 1]);
        }
    };

    // ปรับความเร็วการเล่น
    const changePlaybackRate = (rate) => {
        setPlaybackRate(rate);
        if (videoRef.current) {
            videoRef.current.playbackRate = rate;
        }
    };

    // เริ่มดูใหม่ตั้งแต่ต้น
    const handleRestart = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play();
        }
    };

    // แปลงวินาทีเป็น นาที:วินาที
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds) || seconds < 0) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (loading) return <LearnSkeleton />;

    if (error) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
            <div className="bg-slate-800 text-slate-200 border border-rose-500/30 p-8 rounded-2xl max-w-md w-full shadow-2xl text-center">
                <div className="w-16 h-16 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 border border-rose-500/20">
                    ⚠️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">ไม่สามารถเข้าสู่ห้องเรียนได้</h3>
                <p className="text-slate-400 text-sm mb-6">{error}</p>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate(`/course/${id}`)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-medium py-2.5 px-4 rounded-xl transition shadow-lg shadow-rose-600/30"
                    >
                        ไปหน้ารายละเอียดคอร์ส
                    </button>
                    <button
                        onClick={() => navigate('/my-courses')}
                        className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-700/50 text-slate-300 transition"
                    >
                        คอร์สของฉัน
                    </button>
                </div>
            </div>
        </div>
    );

    if (!currentLesson) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-6">
            <div className="text-center">
                <p className="text-xl text-slate-400 mb-4">ยังไม่พบบทเรียนในคอร์สนี้</p>
                <button
                    onClick={() => navigate(`/course/${id}`)}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-medium"
                >
                    กลับสู่หน้าคอร์ส
                </button>
            </div>
        </div>
    );

    const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < lessons.length - 1;

    return (
        <div className="flex flex-col lg:flex-row min-h-screen lg:h-screen bg-slate-950 text-slate-100 font-sans overflow-x-hidden lg:overflow-hidden">
            {/* กล่องข้อความแจ้งเตือน Toast */}
            {toastMessage && (
                <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-rose-500/40 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-2 sm:gap-3 animate-bounce max-w-[90vw] text-center">
                    <span className="text-rose-500 font-bold shrink-0">✨</span>
                    <span className="text-xs sm:text-sm font-medium">{toastMessage}</span>
                </div>
            )}

            {/* ซ้าย: วิดีโอและคอนโทรลเลอร์ */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                {/* Header แถบความคืบหน้าของคอร์ส */}
                <div className="bg-slate-900/90 backdrop-blur-md px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-3 sm:gap-4 border-b border-slate-800 shrink-0">
                    <button
                        onClick={() => navigate(`/course/${id}`)}
                        className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition shrink-0"
                        title="กลับสู่หน้ารายละเอียดคอร์ส"
                    >
                        <span>←</span>
                        <span className="hidden sm:inline">รายละเอียดคอร์ส</span>
                        <span className="sm:hidden">คอร์ส</span>
                    </button>

                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center text-xs mb-1 sm:mb-1.5 font-medium">
                            <span className="text-slate-300 truncate max-w-[130px] sm:max-w-md">
                                {course?.title || 'ห้องเรียนออนไลน์'}
                            </span>
                            <span className="text-rose-400 font-semibold shrink-0 text-[11px] sm:text-xs">
                                {courseProgress.percentage}% ({courseProgress.completedLessons}/{courseProgress.totalLessons} บท)
                            </span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 sm:h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${courseProgress.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* กล่อง Video Player */}
                <div className="w-full bg-black flex items-center justify-center relative overflow-hidden group aspect-video sm:aspect-video lg:flex-1 lg:max-h-none lg:aspect-auto">
                    {/* Buffering Indicator */}
                    {isBuffering && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                <span className="text-xs text-rose-300 font-medium">กำลังโหลดวิดีโอ...</span>
                            </div>
                        </div>
                    )}

                    <video
                        key={currentLesson.id}
                        ref={videoRef}
                        src={currentLesson.videoUrl ? encodeURI(currentLesson.videoUrl) : ''}
                        controls
                        preload="auto"
                        playsInline
                        className="w-full h-full max-h-[75vh] object-contain"
                        onLoadedMetadata={handleLoadedMetadata}
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnded}
                        onWaiting={() => setIsBuffering(true)}
                        onPlaying={() => setIsBuffering(false)}
                        onPause={() => saveProgress(false)}
                    />
                </div>

                {/* Mobile Tab Switcher (สลับระหว่าง ควบคุมบทเรียน กับ สารบัญ) */}
                <div className="lg:hidden flex border-b border-slate-800 bg-slate-900 text-xs font-semibold shrink-0 sticky top-0 z-20">
                    <button
                        onClick={() => setMobileTab('video')}
                        className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                            mobileTab === 'video'
                                ? 'border-rose-500 text-rose-400 font-bold bg-rose-500/10'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>🎬 ควบคุมบทเรียน</span>
                    </button>
                    <button
                        onClick={() => setMobileTab('curriculum')}
                        className={`flex-1 py-3 text-center border-b-2 transition flex items-center justify-center gap-1.5 ${
                            mobileTab === 'curriculum'
                                ? 'border-rose-500 text-rose-400 font-bold bg-rose-500/10'
                                : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                        <span>📋 สารบัญบทเรียน</span>
                        <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-bold">
                            {lessons.length}
                        </span>
                    </button>
                </div>

                {/* แถบควบคุมและคำสั่งด่วน (Action Control Bar) */}
                <div className={`bg-slate-900 border-t border-slate-800 p-3 sm:p-4 shrink-0 space-y-3 ${
                    mobileTab === 'video' ? 'block' : 'hidden lg:block'
                }`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* ข้อมูลบทเรียน */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                    บทที่ {currentLesson.order}
                                </span>
                                {currentLesson.completed && (
                                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                                        ✓ เรียนจบแล้ว
                                    </span>
                                )}
                            </div>
                            <h2 className="text-base sm:text-lg font-bold text-white mt-1 truncate">
                                {currentLesson.title}
                            </h2>
                            <p className="text-slate-400 text-xs mt-0.5">
                                ความยาว: {currentLesson.duration ? formatTime(currentLesson.duration) : 'กำลังคำนวณ...'}
                            </p>
                        </div>

                        {/* ปุ่มเครื่องมือช่วยเหลือ & ความเร็ว */}
                        <div className="flex items-center gap-2">
                            {/* ปุ่มเลือกความเร็ว */}
                            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700/60 text-xs">
                                {[0.75, 1, 1.25, 1.5].map((rate) => (
                                    <button
                                        key={rate}
                                        onClick={() => changePlaybackRate(rate)}
                                        className={`px-1.5 sm:px-2 py-1 rounded font-medium transition text-[11px] sm:text-xs ${
                                            playbackRate === rate
                                                ? 'bg-rose-600 text-white shadow'
                                                : 'text-slate-400 hover:text-white'
                                        }`}
                                    >
                                        {rate}x
                                    </button>
                                ))}
                            </div>

                            {/* ปุ่มเริ่มใหม่ */}
                            <button
                                onClick={handleRestart}
                                className="px-2.5 sm:px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition border border-slate-700/60 flex items-center gap-1"
                                title="เล่นใหม่ตั้งแต่ต้น"
                            >
                                <span>🔄</span>
                                <span className="hidden sm:inline">เริ่มใหม่</span>
                            </button>
                        </div>
                    </div>

                    {/* ปุ่มเปลี่ยนบท และปุ่มทำเครื่องหมายว่าจบ */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center justify-between gap-2 w-full sm:w-auto">
                            <button
                                onClick={handlePrevLesson}
                                disabled={!hasPrev}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition ${
                                    hasPrev
                                        ? 'bg-slate-800 hover:bg-slate-700 text-white'
                                        : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                                }`}
                            >
                                <span>⏮️</span>
                                <span>บทก่อนหน้า</span>
                            </button>

                            <button
                                onClick={handleNextLesson}
                                disabled={!hasNext}
                                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-medium transition ${
                                    hasNext
                                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                                        : 'bg-slate-800/40 text-slate-600 cursor-not-allowed'
                                }`}
                            >
                                <span>บทถัดไป</span>
                                <span>⏭️</span>
                            </button>
                        </div>

                        {/* ปุ่มบันทึกว่าจบ (Manual Mark Completed) */}
                        <button
                            onClick={() => saveProgress(true)}
                            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-semibold transition shadow-md ${
                                currentLesson.completed
                                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/30'
                                    : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                            }`}
                        >
                            <span>{currentLesson.completed ? '✅' : '✔️'}</span>
                            <span>{currentLesson.completed ? 'ทำเครื่องหมายว่าจบแล้ว' : 'ทำเครื่องหมายว่าเรียนจบแล้ว'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ขวา: แถบรายการบทเรียนทั้งหมด (Sidebar: แสดงข้างๆ บน desktop และสลับแท็บได้บน mobile) */}
            <div className={`w-full lg:w-84 xl:w-96 bg-slate-900 border-l border-slate-800 flex-col shrink-0 ${
                mobileTab === 'curriculum' ? 'flex' : 'hidden lg:flex'
            }`}>
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-sm">
                    <div>
                        <h3 className="font-bold text-white text-base flex items-center gap-2">
                            <span>📋</span>
                            <span>เนื้อหาหลักสูตร</span>
                        </h3>
                        <p className="text-slate-400 text-xs mt-0.5">
                            {lessons.length} บทเรียน ({courseProgress.completedLessons} จบแล้ว)
                        </p>
                    </div>
                    {user?.role === 'admin' && (
                        <button
                            onClick={() => navigate(`/course/${id}/create-lesson`)}
                            className="bg-rose-600 hover:bg-rose-700 text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 font-medium transition shadow-md shadow-rose-600/20"
                            title="เพิ่มบทเรียนใหม่"
                        >
                            <span>➕ เพิ่มบทเรียน</span>
                        </button>
                    )}
                </div>

                {/* รายการบทเรียน Scrollable */}
                <div className="overflow-y-auto flex-1 divide-y divide-slate-800/50">
                    {lessons.map((lesson, idx) => {
                        const isActive = currentLesson.id === lesson.id;
                        // คำนวณเวลาที่เหลืออย่างปลอดภัย (ไม่ให้ติดลบ)
                        const remaining = (lesson.duration && lesson.duration > (lesson.watchedSeconds || 0))
                            ? (lesson.duration - (lesson.watchedSeconds || 0))
                            : null;

                        return (
                            <button
                                key={lesson.id}
                                onClick={() => switchLesson(lesson)}
                                className={`w-full text-left p-4 flex items-start gap-3 transition ${
                                    isActive
                                        ? 'bg-rose-500/10 border-l-4 border-l-rose-500'
                                        : 'hover:bg-slate-800/60'
                                }`}
                            >
                                {/* สัญลักษณ์สถานะ */}
                                <div className="mt-0.5 shrink-0">
                                    {lesson.completed ? (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                                            ✓
                                        </div>
                                    ) : isActive ? (
                                        <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold border border-rose-500/40 animate-pulse">
                                            ▶
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-medium border border-slate-700">
                                            {idx + 1}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className={`font-semibold text-sm leading-snug line-clamp-2 ${
                                        isActive ? 'text-rose-400 font-bold' : 'text-slate-200'
                                    }`}>
                                        {lesson.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-slate-400 text-xs mt-1.5">
                                        <span>
                                            {lesson.duration ? formatTime(lesson.duration) : 'ไม่ระบุ'}
                                        </span>
                                        {remaining && !lesson.completed && (
                                            <span className="text-amber-400/90 text-[11px]">
                                                • เหลือ {formatTime(remaining)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function LearnSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row h-screen bg-slate-950 text-white animate-pulse">
            <div className="flex-1 flex flex-col">
                <div className="bg-slate-900 p-3 flex items-center gap-4 border-b border-slate-800">
                    <div className="w-16 h-6 bg-slate-800 rounded" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <div className="w-32 h-3.5 bg-slate-800 rounded" />
                            <div className="w-24 h-3.5 bg-slate-800 rounded" />
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2">
                            <div className="w-1/3 bg-slate-700 h-2 rounded-full" />
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-black flex items-center justify-center p-6">
                    <div className="w-full h-full max-h-[75vh] bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800/60">
                        <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                            ▶
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 p-4 border-t border-slate-800 space-y-2">
                    <div className="h-6 w-64 bg-slate-800 rounded" />
                    <div className="h-4 w-40 bg-slate-800/70 rounded" />
                </div>
            </div>

            <div className="w-full lg:w-84 xl:w-96 bg-slate-900 border-l border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-800 space-y-2">
                    <div className="h-6 w-36 bg-slate-800 rounded" />
                    <div className="h-4 w-20 bg-slate-800/70 rounded" />
                </div>
                <div className="overflow-y-auto flex-1 divide-y divide-slate-800/40">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <div key={item} className="p-4 flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-slate-800 shrink-0" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-slate-800 rounded w-4/5" />
                                <div className="h-3 bg-slate-800/60 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Learn;