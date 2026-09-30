import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../api';

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
];

function CreateCourse() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructor, setInstructor] = useState(user?.name || '');
  const [thumbnail, setThumbnail] = useState(SAMPLE_THUMBNAILS[0].url);
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }

    if (user.role !== 'admin') {
      alert('หน้านี้สำหรับผู้ดูแลระบบ (Admin) เท่านั้น');
      navigate('/');
    }
  }, []);

  const handlePriceChange = (e) => {
    const val = parseFloat(e.target.value) || 0;
    setPrice(val);
    setIsFree(val === 0);
  };

  const handleToggleFree = (free) => {
    setIsFree(free);
    if (free) {
      setPrice(0);
    } else if (price === 0) {
      setPrice(299);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('กรุณากรอกชื่อคอร์ส');
      return;
    }

    if (!instructor.trim()) {
      setError('กรุณาระบุชื่อผู้สอน');
      return;
    }

    setSubmitting(true);

    try {
      const data = await createCourse({
        title: title.trim(),
        description: description.trim(),
        instructor: instructor.trim(),
        thumbnail: thumbnail.trim() || null,
        price: isFree ? 0 : price,
      });

      if (data.id) {
        alert('🎉 สร้างคอร์สสำเร็จ!');
        navigate(`/course/${data.id}`);
      } else {
        setError(data.error || 'สร้างคอร์สไม่สำเร็จ');
      }
    } catch (err) {
      console.error(err);
      setError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">➕ สร้างคอร์สใหม่</h1>
          <p className="text-slate-500 text-sm mt-1">กรอกข้อมูลเพื่อเปิดคอร์สเรียนใหม่ในระบบ</p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="text-slate-500 hover:text-rose-600 text-sm font-semibold self-start sm:self-auto transition"
        >
          ← ยกเลิกและกลับ
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl sm:rounded-3xl crimson-shadow border border-rose-100/80 p-5 sm:p-8 space-y-6">
        {/* ชื่อคอร์ส */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            ชื่อคอร์ส <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            placeholder="เช่น Next.js 14 Fullstack Development"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* ผู้สอน */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            ชื่อผู้สอน <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
            placeholder="เช่น อ.สมชาย ใจดี"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            required
          />
        </div>

        {/* รายละเอียด */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            รายละเอียดคอร์ส
          </label>
          <textarea
            rows="4"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 resize-y"
            placeholder="อธิบายสิ่งที่จะได้เรียนรู้ในคอร์สนี้ จุดเด่น หรือเนื้อหาเบื้องต้น..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* ราคา */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            ราคาของคอร์ส
          </label>
          <div className="flex gap-4 mb-3">
            <button
              type="button"
              onClick={() => handleToggleFree(true)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium border transition ${
                isFree
                  ? 'bg-green-50 border-green-500 text-green-700 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              🎉 คอร์สฟรี (฿0)
            </button>
            <button
              type="button"
              onClick={() => handleToggleFree(false)}
              className={`flex-1 py-2.5 px-4 rounded-lg font-medium border transition ${
                !isFree
                  ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm'
                  : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }`}
            >
              💳 กำหนดราคา
            </button>
          </div>

          {!isFree && (
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-500 font-bold">฿</span>
              <input
                type="number"
                min="1"
                step="1"
                className="w-full pl-8 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800"
                placeholder="ระบุราคา เช่น 499"
                value={price}
                onChange={handlePriceChange}
              />
            </div>
          )}
        </div>

        {/* รูปภาพหน้าปก */}
        <div>
          <label className="block text-gray-700 font-semibold mb-2">
            รูปภาพหน้าปก (Thumbnail URL)
          </label>
          <input
            type="url"
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 mb-2"
            placeholder="https://example.com/image.jpg"
            value={thumbnail}
            onChange={(e) => setThumbnail(e.target.value)}
          />

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="text-xs text-gray-500 self-center">เลือกภาพตัวอย่าง:</span>
            {SAMPLE_THUMBNAILS.map((sample) => (
              <button
                key={sample.label}
                type="button"
                onClick={() => setThumbnail(sample.url)}
                className={`text-xs px-2.5 py-1 rounded border transition ${
                  thumbnail === sample.url
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {sample.label}
              </button>
            ))}
          </div>

          {/* Preview Image */}
          {thumbnail && (
            <div className="mt-2 border rounded-lg overflow-hidden bg-gray-100">
              <img
                src={thumbnail}
                alt="Thumbnail preview"
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL';
                }}
              />
            </div>
          )}
        </div>

        {/* ปุ่มสร้างคอร์ส */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 crimson-gradient text-white py-3 rounded-xl font-bold hover:opacity-95 shadow-md shadow-rose-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>⏳ กำลังบันทึก...</span>
            ) : (
              <>
                <span>💾</span>
                <span>สร้างคอร์สเรียน</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition font-semibold text-slate-600 text-center"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCourse;
