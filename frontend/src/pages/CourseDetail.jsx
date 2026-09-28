import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourse, enrollCourse, checkEnrollment } from '../api';

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  
  // เช็คว่า User ล็อกอินอยู่หรือไม่
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    // 1. โหลดข้อมูลคอร์ส
    getCourse(id).then(data => {
      if (data.error) {
        alert('ไม่พบคอร์สนี้');
        navigate('/');
      } else {
        setCourse(data);
        setLoading(false);
      }
    });

    // 2. เช็คสถานะการลงทะเบียน (ถ้า login อยู่)
    if (user) {
      checkEnrollment(id).then(data => {
        if (data.enrolled) setEnrolled(true);
      });
    }
  }, [id]); // ← รันใหม่ทุกครั้งที่เปลี่ยนคอร์ส

  // ฟังก์ชันกดลงทะเบียน
  const handleEnroll = async () => {
    // ถ้ายังไม่ login → ไปหน้า login
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนลงทะเบียน');
      navigate('/login');
      return;
    }

    setEnrolling(true);
    const data = await enrollCourse(id);
    setEnrolling(false);

    if (data.enrollment || data.message) {
      setEnrolled(true);
      alert('🎉 ลงทะเบียนสำเร็จ!');
    } else {
      alert(data.error || 'ลงทะเบียนไม่สำเร็จ');
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* รูปปกคอร์ส */}
        <img 
          src={course.thumbnail || 'https://via.placeholder.com/800x400'} 
          alt={course.title}
          className="w-full h-80 object-cover"
        />
        
        <div className="p-8">
          {/* หัวข้อ + ราคา */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
            <h1 className="text-3xl font-bold text-gray-800">{course.title}</h1>
            <span className="text-2xl font-bold text-green-600 bg-green-50 px-4 py-2 rounded-lg">
              {course.price === 0 ? 'ฟรี!' : `฿${course.price}`}
            </span>
          </div>
          
          <p className="text-gray-600 text-lg mb-6">👨‍🏫 ผู้สอน: {course.instructor}</p>
          
          {/* รายละเอียด */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">รายละเอียดคอร์ส</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">
              {course.description}
            </p>
          </div>

          {/* ปุ่ม Action */}
          <div className="mt-8">
            {enrolled ? (
              <div className="space-y-3">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg text-center font-semibold flex items-center justify-center gap-2">
                  <span>✅</span>
                  <span>คุณได้ลงทะเบียนคอร์สนี้แล้ว</span>
                </div>
                <Link 
                  to={`/learn/${course.id}`}  // หน้าเรียน (ทำทีหลังได้)
                  className="block w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition text-center"
                >
                  🎬 เข้าเรียนเลย
                </Link>
              </div>
            ) : (
              <button 
                onClick={handleEnroll}
                disabled={enrolling}
                className="w-full bg-green-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {enrolling 
                  ? '⏳ กำลังลงทะเบียน...' 
                  : (course.price === 0 ? '🚀 ลงทะเบียนเรียนฟรี!' : `💳 ซื้อคอร์สนี้ ฿${course.price}`)
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;