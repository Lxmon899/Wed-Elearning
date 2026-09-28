import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyCourses, unenrollCourse } from '../api';

function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getMyCourses().then(data => {
      if (Array.isArray(data)) {
        setCourses(data);
      }
      setLoading(false);
    });
  }, []);

  const handleUnenroll = async (courseId) => {
    if (!confirm('คุณต้องการยกเลิกลงทะเบียนคอร์สนี้ใช่หรือไม่?')) return;

    const data = await unenrollCourse(courseId);
    if (data.message) {
      setCourses(courses.filter(c => c.id !== courseId));
      alert('ยกเลิกลงทะเบียนสำเร็จ');
    }
  };

  if (loading) return <div className="text-center p-10 text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">📚 คอร์สของฉัน</h1>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl shadow">
          <p className="text-gray-500 text-xl mb-4">ยังไม่มีคอร์สที่ลงทะเบียน</p>
          <Link to="/" className="text-blue-600 hover:underline font-semibold text-lg">
            ไปดูคอร์สทั้งหมด →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition bg-white flex flex-col">
              <img
                src={course.thumbnail || 'https://via.placeholder.com/400x250'}
                alt={course.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-5 flex-1 flex flex-col">
                <h2 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h2>
                <p className="text-gray-600 mb-4">ผู้สอน: {course.instructor}</p>

                <div className="mt-auto space-y-2">
                  <button
                    onClick={() => navigate(`/learn/${course.id}`)}
                    className="block w-full text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                  >
                    🎬 เข้าเรียน
                  </button>
                  <button
                    onClick={() => handleUnenroll(course.id)}
                    className="block w-full text-center border border-red-300 text-red-600 py-2 rounded-lg hover:bg-red-50 transition"
                  >
                    ยกเลิกลงทะเบียน
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyCourses;