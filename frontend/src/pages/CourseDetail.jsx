import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCourse } from '../api';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getCourse(id).then(data => {
      if (data.error) {
        alert('ไม่พบคอร์สนี้');
        navigate('/');
      } else {
        setCourse(data);
        setLoading(false);
      }
    });
  }, [id, navigate]);

  if (loading) return <div className="text-center p-10">กำลังโหลด...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        <img 
          src={course.thumbnail || 'https://via.placeholder.com/800x400'} 
          alt={course.title}
          className="w-full h-80 object-cover"
        />
        <div className="p-8">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <span className="text-2xl font-bold text-green-600">
              {course.price === 0 ? 'ฟรี!' : `฿${course.price}`}
            </span>
          </div>
          
          <p className="text-gray-600 text-lg mb-2">ผู้สอน: {course.instructor}</p>
          
          <div className="border-t pt-6 mt-6">
            <h2 className="text-xl font-semibold mb-3">รายละเอียดคอร์ส</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          <button className="mt-8 w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition">
            {course.price === 0 ? 'เริ่มเรียนฟรีเลย!' : 'ซื้อคอร์สนี้'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;