import { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  Upload,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileVideo,
  Play,
  RotateCcw,
} from 'lucide-react';
import { updateLesson, uploadVideo } from '../api';

export default function EditLessonModal({ isOpen, onClose, lesson, onSuccess }) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState(0);
  const [order, setOrder] = useState(1);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [useUrlDirectly, setUseUrlDirectly] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title || '');
      setVideoUrl(lesson.videoUrl || '');
      setVideoPreview(lesson.videoUrl || '');
      setDuration(lesson.duration || 0);
      setOrder(lesson.order || 1);
      setVideoFile(null);
      setError('');
      setUseUrlDirectly(!lesson.videoUrl?.startsWith('/uploads'));
    }
  }, [lesson, isOpen]);

  if (!isOpen || !lesson) return null;

  const formatDuration = (secs) => {
    if (!secs) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')} นาที`;
  };

  const handleLoadedMetadata = (e) => {
    const d = e.target.duration;
    if (d && isFinite(d) && d > 0) {
      setDuration(Math.round(d));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setError('กรุณาเลือกไฟล์วิดีโอเท่านั้น (MP4, WEBM, OGG)');
      return;
    }

    setVideoFile(file);
    const previewUrl = URL.createObjectURL(file);
    setVideoPreview(previewUrl);
    setError('');
  };

  const handleManualUpload = async () => {
    if (!videoFile) return;

    setUploading(true);
    setError('');
    try {
      const data = await uploadVideo(videoFile);
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setVideoPreview(data.videoUrl);
        setVideoFile(null);
      } else {
        setError(data.error || 'อัปโหลดวิดีโอไม่สำเร็จ');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการอัปโหลดวิดีโอ');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('กรุณาระบุชื่อบทเรียน');
      return;
    }

    let finalVideoUrl = videoUrl;

    if (videoFile) {
      setUploading(true);
      setError('');
      try {
        const uploadRes = await uploadVideo(videoFile);
        if (uploadRes.videoUrl) {
          finalVideoUrl = uploadRes.videoUrl;
        } else {
          setError(uploadRes.error || 'อัปโหลดวิดีโอไม่สำเร็จ');
          setUploading(false);
          return;
        }
      } catch {
        setError('เกิดข้อผิดพลาดในการอัปโหลดไฟล์วิดีโอ');
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    if (!finalVideoUrl || !finalVideoUrl.trim()) {
      setError('กรุณาระบุ URL วิดีโอ หรือเลือกไฟล์วิดีโอ');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await updateLesson(lesson.id, {
        title: title.trim(),
        videoUrl: finalVideoUrl.trim(),
        duration: duration ? parseInt(duration) : null,
        order: order ? parseInt(order) : lesson.order,
      });

      if (res.error) {
        setError(res.error);
      } else {
        onSuccess?.(res.lesson);
        onClose();
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 space-y-6 animate-in zoom-in-95 duration-150 text-slate-800 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                แก้ไขบทเรียน (Edit Lesson)
              </h3>
              <p className="text-xs text-slate-500">
                ปรับปรุงชื่อบทเรียน, ลำดับ, หรือเปลี่ยนไฟล์วิดีโอประกอบการสอน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Order */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ชื่อบทเรียน (Lesson Title) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น บทที่ 1: แนะนำพื้นฐาน React Component"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ลำดับที่ (Order)
              </label>
              <input
                type="number"
                min="1"
                value={order}
                onChange={(e) => setOrder(parseInt(e.target.value) || 1)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition text-center"
              />
            </div>
          </div>

          {/* Video Preview Player */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-rose-600" />
                <span>ตัวอย่างวิดีโอ (Video Preview)</span>
              </label>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>ความยาว: </span>
                <span className="font-bold text-rose-600">{formatDuration(duration)}</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center relative border border-slate-800 shadow-inner">
              {videoPreview ? (
                <video
                  key={videoPreview}
                  controls
                  onLoadedMetadata={handleLoadedMetadata}
                  className="w-full h-full object-contain"
                  src={videoPreview}
                >
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                </video>
              ) : (
                <div className="text-center p-6 text-slate-500">
                  <FileVideo className="w-12 h-12 mx-auto mb-2 text-slate-600" />
                  <p className="text-xs">ยังไม่มีไฟล์วิดีโอสำหรับบทเรียนนี้</p>
                </div>
              )}
            </div>
          </div>

          {/* Video Source Selection */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">แหล่งที่มาของวิดีโอ (Video Source)</span>
              <button
                type="button"
                onClick={() => setUseUrlDirectly(!useUrlDirectly)}
                className="text-xs text-rose-600 font-semibold hover:underline cursor-pointer"
              >
                {useUrlDirectly ? '← เปลี่ยนเป็นอัปโหลดไฟล์วิดีโอ' : '🔗 ป้อน Video URL หรือ Direct Link โดยตรง'}
              </button>
            </div>

            {useUrlDirectly ? (
              <div>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    setVideoPreview(e.target.value);
                  }}
                  placeholder="https://... หรือ /uploads/videos/xxx.mp4"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  รองรับไฟล์วิดีโอ direct link .mp4, .webm หรือพาธไฟล์ที่อัปโหลดไว้ในระบบ
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="video/mp4,video/webm,video/ogg"
                  className="hidden"
                  id="edit-video-file-input"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-rose-200 hover:border-rose-400 bg-rose-50/40 hover:bg-rose-50/80 rounded-2xl p-5 text-center cursor-pointer transition"
                >
                  <Upload className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">
                    {videoFile ? `ไฟล์ที่เลือก: ${videoFile.name}` : 'คลิกเพื่อเลือกไฟล์วิดีโอใหม่เพื่อแทนที่'}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    รองรับ MP4, WEBM, OGG (สูงสุด 100 MB)
                  </p>
                </div>

                {videoFile && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <FileVideo className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="text-xs font-medium text-slate-800 truncate">
                        {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleManualUpload}
                        disabled={uploading}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer flex items-center gap-1"
                      >
                        {uploading ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                            <span>กำลังอัปโหลด...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3 h-3" />
                            <span>อัปโหลดทันที</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview(videoUrl);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition"
                        title="ยกเลิกไฟล์นี้"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duration manual adjust */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                ความยาววิดีโอ (วินาที)
              </label>
              <input
                type="number"
                min="0"
                value={duration || ''}
                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                placeholder="คำนวณอัตโนมัติจากไฟล์"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                ระบบจะตรวจจับความยาวอัตโนมัติเมื่อเล่นวิดีโอ
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                URL ปัจจุบันในฐานข้อมูล
              </label>
              <div className="p-2.5 bg-slate-100 rounded-xl text-xs text-slate-600 truncate border border-slate-200 font-mono">
                {videoUrl || 'ยังไม่มี URL'}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-600/30 hover:opacity-95 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>บันทึกการแก้ไขบทเรียน</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
