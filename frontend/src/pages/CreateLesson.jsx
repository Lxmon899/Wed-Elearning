import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { uploadVideo, createLesson } from '../api';
import { isYouTubeUrl, getEmbedUrl } from '../utils/videoUtils';

function CreateLesson() {
    const { id } = useParams(); // courseId
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [videoUrl, setVideoUrl] = useState('');
    const [duration, setDuration] = useState(null);

    // รับความยาววิดีโอจาก Preview
    const handleLoadedMetadata = (e) => {
        const d = e.target.duration;
        if (d && isFinite(d) && d > 0) {
            setDuration(Math.round(d));
        }
    };

    // เลือกไฟล์แล้ว Preview
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // ตรวจสอบประเภทไฟล์
        if (!file.type.startsWith('video/')) {
            alert('กรุณาเลือกไฟล์วิดีโอเท่านั้น');
            return;
        }

        setVideoFile(file);
        setVideoUrl(''); // รีเซ็ต URL เก่า

        // สร้าง Preview URL (เล่นในเบราว์เซอร์ก่อนอัปโหลด)
        const previewUrl = URL.createObjectURL(file);
        setVideoPreview(previewUrl);
    };

    // อัปโหลดวิดีโอ
    const handleUpload = async () => {
        if (!videoFile) {
            alert('กรุณาเลือกไฟล์วิดีโอก่อน');
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        try {
            const data = await uploadVideo(videoFile);

            if (data.videoUrl) {
                setVideoUrl(data.videoUrl);
                alert('🎉 อัปโหลดสำเร็จ!');
            } else {
                alert(data.error || 'อัปโหลดไม่สำเร็จ');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการอัปโหลด');
        } finally {
            setUploading(false);
        }
    };

    // บันทึกบทเรียน (ส่งข้อมูลไป Backend)
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title.trim() || !videoUrl) {
            alert('กรุณากรอกชื่อบทเรียนและอัปโหลดวิดีโอก่อนบันทึก');
            return;
        }

        try {
            const finalUrl = isYouTubeUrl(videoUrl) ? getEmbedUrl(videoUrl) : videoUrl.trim();
            const data = await createLesson(id, {
                title: title.trim(),
                videoUrl: finalUrl,
                duration: duration || null,
            });

            if (data.lesson) {
                alert('🎉 บันทึกบทเรียนสำเร็จ!');
                navigate(`/learn/${id}`);
            } else {
                alert(data.error || 'สร้างบทเรียนไม่สำเร็จ');
            }
        } catch (error) {
            console.error(error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
        }
    };

    // แปลงไฟล์ขนาดเป็น MB
    const formatSize = (bytes) => {
        if (!bytes) return '0 MB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">➕ สร้างบทเรียนใหม่</h1>
                    <p className="text-slate-500 text-sm mt-1">อัปโหลดวิดีโอและกำหนดชื่อบทเรียนสำหรับคอร์สนี้</p>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="text-slate-500 hover:text-rose-600 text-sm font-semibold self-start sm:self-auto transition"
                >
                    ← ยกเลิกและกลับ
                </button>
            </div>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl crimson-shadow border border-rose-100/80 p-5 sm:p-8 space-y-6">
                {/* ชื่อบทเรียน */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">ชื่อบทเรียน</label>
                    <input
                        type="text"
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="เช่น บทที่ 1: แนะนำ React"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                {/* เลือกไฟล์วิดีโอ */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-2">ไฟล์วิดีโอ</label>

                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition bg-gray-50">
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="video-input"
                        />
                        <label htmlFor="video-input" className="cursor-pointer">
                            <div className="text-4xl mb-2">📁</div>
                            <p className="text-gray-600 font-medium">คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวาง</p>
                            <p className="text-gray-400 text-sm mt-1">รองรับ MP4, WEBM, OGG (สูงสุด 100 MB)</p>
                        </label>
                    </div>

                    {/* แสดงไฟล์ที่เลือก */}
                    {videoFile && (
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-blue-800">{videoFile.name}</p>
                                    <p className="text-sm text-blue-600">{formatSize(videoFile.size)}</p>
                                </div>
                                {!videoUrl && (
                                    <button
                                        type="button"
                                        onClick={handleUpload}
                                        disabled={uploading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                                    >
                                        {uploading ? '⏳ กำลังอัปโหลด...' : '☁️ อัปโหลด'}
                                    </button>
                                )}
                            </div>

                            {/* Progress Bar (จำลอง) */}
                            {uploading && (
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full" />
                                    </div>
                                </div>
                            )}

                            {videoUrl && (
                                <div className="mt-2 text-green-600 font-medium flex items-center gap-2 text-xs">
                                    <span>✅</span>
                                    <span>ที่อยู่วิดีโอ: {videoUrl}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* หรือป้อนลิงก์วิดีโอโดยตรง เช่น YouTube */}
                <div>
                    <label className="block text-gray-700 font-semibold mb-1 text-sm">หรือ ป้อน Video URL โดยตรง (รองรับ YouTube)</label>
                    <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => {
                            setVideoUrl(e.target.value);
                            setVideoPreview(e.target.value);
                            if (videoFile) setVideoFile(null);
                        }}
                        placeholder="https://www.youtube.com/watch?v=... หรือลิงก์ไฟล์วิดีโอ MP4"
                        className="w-full p-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                        💡 รองรับทั้งลิงก์ YouTube (watch, youtu.be, shorts) ระบบจะแปลงเป็น Embed ให้อัตโนมัติ
                    </p>
                </div>

                {/* Preview วิดีโอ */}
                {(videoPreview || videoUrl) && (
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2 text-sm">ตัวอย่างวิดีโอ</label>
                        {isYouTubeUrl(videoUrl || videoPreview) ? (
                            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-800">
                                <iframe
                                    src={getEmbedUrl(videoUrl || videoPreview)}
                                    title="ตัวอย่างวิดีโอ YouTube"
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : (
                            <video
                                src={videoUrl || videoPreview}
                                controls
                                onLoadedMetadata={handleLoadedMetadata}
                                className="w-full rounded-xl bg-black"
                                style={{ maxHeight: '400px' }}
                            />
                        )}
                    </div>
                )}

                {/* ปุ่มบันทึก */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
                    <button
                        type="submit"
                        className="flex-1 crimson-gradient text-white py-3 rounded-xl font-bold hover:opacity-95 shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2"
                    >
                        <span>💾</span>
                        <span>บันทึกบทเรียน</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-semibold text-slate-600 text-center"
                    >
                        ยกเลิก
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreateLesson;