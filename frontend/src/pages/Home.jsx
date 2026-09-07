import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../api';

function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourses().then(data => {
      setCourses(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setCourses([]);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center p-10">กำลังโหลด...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">คอร์สเรียนทั้งหมด</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition bg-white">
            <img 
              src={course.thumbnail || 'https://via.placeholder.com/400x250'} 
              alt={course.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-5">
              <h2 className="text-xl font-bold mb-2 text-gray-800">{course.title}</h2>
              <p className="text-gray-600 mb-2">ผู้สอน: {course.instructor}</p>
              <p className="text-green-600 font-bold text-lg mb-4">
                {course.price === 0 ? 'ฟรี!' : `฿${course.price}`}
              </p>
              <Link 
                to={`/course/${course.id}`}
                className="block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
              >
                ดูรายละเอียด
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;