import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getLessons, updateProgress, getCourseProgress } from '../api';

function Learn() {
    const { id } = useParams(); // courseId
    const navigate = useNavigate();

    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [courseProgress, setCourseProgress] = useState({ percentage: 0, completedLessons: 0, totalLessons: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const videoRef = useRef(null);
    const saveIntervalRef = useRef(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // โหลดบทเรียนทั้งหมด
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        getLessons(id).then(data => {
            if (data.error) {
                setError(data.error);
                setLoading(false);
                return;
            }

            setLessons(data);
            if (data.length > 0) {
                // เลือกบทเรียนแรกที่ยังไม่จบ หรือบทแรก
                const firstIncomplete = data.find(l => !l.completed);
                setCurrentLesson(firstIncomplete || data[0]);
            }
            setLoading(false);
            fetchProgress();
        });
    }, [id]);

    // ดึง % ความคืบหน้าของคอร์ส
    const fetchProgress = () => {
        getCourseProgress(id).then(data => {
            if (!data.error) setCourseProgress(data);
        });
    };

    // บันทึกความคืบหน้า (เรียกซ้ำทุก 5 วินาที)
    const saveProgress = async (completed = false) => {
        if (!currentLesson || !videoRef.current) return;

        const video = videoRef.current;
        await updateProgress(
            currentLesson.id,
            Math.floor(video.currentTime),
            completed
        );

        if (completed) {
            // อัปเดตสถานะในหน้าจอทันที
            setLessons(prev => prev.map(l =>
                l.id === currentLesson.id ? { ...l, completed: true } : l
            ));
            fetchProgress();
        }
    };

    // ตั้ง Interval บันทึกอัตโนมัติทุก 5 วินาที
    useEffect(() => {
        if (!currentLesson) return;

        // ล้าง interval เก่า
        if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);

        // ตั้ง interval ใหม่
        saveIntervalRef.current = setInterval(() => {
            saveProgress(false);
        }, 5000);

        return () => {
            if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
        };
    }, [currentLesson]);

    // เมื่อเปลี่ยนวิดีโอ → seek ไปตำแหน่งเดิม
    useEffect(() => {
        if (videoRef.current && currentLesson) {
            videoRef.current.currentTime = currentLesson.watchedSeconds || 0;
        }
    }, [currentLesson]);

    // วิดีโอจบ → บันทึกว่าจบแล้ว + ไปบทถัดไป
    const handleVideoEnded = () => {
        saveProgress(true);

        // หาบทถัดไป
        const currentIndex = lessons.findIndex(l => l.id === currentLesson.id);
        if (currentIndex < lessons.length - 1) {
            setTimeout(() => {
                setCurrentLesson(lessons[currentIndex + 1]);
            }, 1000);
        } else {
            alert('🎉 ยินดีด้วย! คุณเรียนจบคอร์สนี้แล้ว');
        }
    };

    // เปลี่ยนบทเรียน
    const switchLesson = (lesson) => {
        // บันทึกบทปัจจุบันก่อนเปลี่ยน
        if (currentLesson) saveProgress(false);
        setCurrentLesson(lesson);
    };

    // แปลงวินาทีเป็น นาที:วินาที
    const formatTime = (seconds) => {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };
    if (loading) return <LearnSkeleton />;

    if (error) return (
        <div className="text-center p-10">
            <div className="bg-red-100 text-red-700 p-6 rounded-xl max-w-md mx-auto">
                <p className="text-lg font-semibold mb-2">⚠️ {error}</p>
                <button
                    onClick={() => navigate(`/course/${id}`)}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                    ไปลงทะเบียน
                </button>
            </div>
        </div>
    );

    if (!currentLesson) return <div className="text-center p-10">ไม่พบบทเรียน</div>;

    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-white">
            {/* ซ้าย: Video Player */}
            <div className="flex-1 flex flex-col">
                {/* แถบ Progress ของคอร์ส */}
                <div className="bg-gray-800 p-3 flex items-center gap-4 border-b border-gray-700">
                    <button
                        onClick={() => navigate('/my-courses')}
                        className="text-gray-300 hover:text-white text-sm"
                    >
                        ← กลับ
                    </button>
                    <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                            <span>ความคืบหน้าคอร์ส</span>
                            <span>{courseProgress.percentage}% ({courseProgress.completedLessons}/{courseProgress.totalLessons} บท)</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${courseProgress.percentage}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Video */}
                <div className="flex-1 bg-black flex items-center justify-center p-4">
                    <video
                        ref={videoRef}
                        src={currentLesson.videoUrl}
                        controls
                        className="w-full max-h-full rounded-lg"
                        onEnded={handleVideoEnded}
                        onPause={() => saveProgress(false)}
                    />
                </div>

                {/* ข้อมูลบทเรียนปัจจุบัน */}
                <div className="bg-gray-800 p-4 border-t border-gray-700">
                    <h2 className="text-xl font-bold">{currentLesson.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        บทที่ {currentLesson.order} • ความยาว {currentLesson.duration ? formatTime(currentLesson.duration) : 'ไม่ระบุ'}
                    </p>
                </div>
            </div>

            {/* ขวา: รายการบทเรียน */}
            <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col max-h-screen">
                <div className="p-4 border-b border-gray-700">
                    <h3 className="font-bold text-lg">📋 บทเรียนทั้งหมด</h3>
                    <p className="text-gray-400 text-sm">{lessons.length} บทเรียน</p>
                </div>

                <div className="overflow-y-auto flex-1">
                    {lessons.map((lesson) => (
                        <button
                            key={lesson.id}
                            onClick={() => switchLesson(lesson)}
                            className={`w-full text-left p-4 border-b border-gray-700 flex items-start gap-3 transition hover:bg-gray-700 ${currentLesson.id === lesson.id ? 'bg-gray-700 border-l-4 border-l-blue-500' : ''
                                }`}
                        >
                            {/* ไอคอนสถานะ */}
                            <div className="mt-1">
                                {lesson.completed ? (
                                    <span className="text-green-500 text-lg">✅</span>
                                ) : (
                                    <span className="text-gray-500 text-lg">⭕</span>
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className={`font-medium text-sm ${currentLesson.id === lesson.id ? 'text-blue-400' : ''}`}>
                                    {lesson.title}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">
                                    {lesson.duration ? formatTime(lesson.duration) : 'ไม่ระบุ'}
                                    {lesson.watchedSeconds > 0 && !lesson.completed && ` • เหลือ ${formatTime(lesson.duration - lesson.watchedSeconds)}`}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

function LearnSkeleton() {
    return (
        <div className="flex flex-col lg:flex-row h-screen bg-gray-900 text-white animate-pulse">
            {/* ซ้าย: Video Player Area Skeleton */}
            <div className="flex-1 flex flex-col">
                {/* แถบ Progress ด้านบน */}
                <div className="bg-gray-800 p-3 flex items-center gap-4 border-b border-gray-700">
                    <div className="w-14 h-6 bg-gray-700/80 rounded" />
                    <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                            <div className="w-28 h-3.5 bg-gray-700 rounded" />
                            <div className="w-24 h-3.5 bg-gray-700 rounded" />
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                            <div className="w-1/3 bg-gray-600 h-2 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* กล่อง Video Skeleton */}
                <div className="flex-1 bg-black flex items-center justify-center p-6">
                    <div className="w-full h-full max-h-[75vh] bg-gray-800/80 rounded-xl flex items-center justify-center border border-gray-700/50 relative overflow-hidden shadow-inner">
                        {/* Play Icon Placeholder */}
                        <div className="w-16 h-16 rounded-full bg-gray-700/70 flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-600 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* ข้อมูลบทเรียนด้านล่าง */}
                <div className="bg-gray-800 p-4 border-t border-gray-700 space-y-2">
                    <div className="h-6 w-64 bg-gray-700 rounded" />
                    <div className="h-4 w-40 bg-gray-700/70 rounded" />
                </div>
            </div>

            {/* ขวา: รายการบทเรียน Sidebar Skeleton */}
            <div className="w-full lg:w-80 bg-gray-800 border-l border-gray-700 flex flex-col max-h-screen">
                <div className="p-4 border-b border-gray-700 space-y-2">
                    <div className="h-6 w-36 bg-gray-700 rounded" />
                    <div className="h-4 w-20 bg-gray-700/70 rounded" />
                </div>

                <div className="overflow-y-auto flex-1 divide-y divide-gray-700/40">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div key={item} className="p-4 flex items-start gap-3">
                            <div className="w-5 h-5 rounded-full bg-gray-700 shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-700 rounded w-4/5" />
                                <div className="h-3 bg-gray-700/60 rounded w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Learn;