import { Link, useNavigate } from 'react-router-dom';

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav className="bg-blue-600 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold hover:text-blue-100 transition">
          📚 E-Learning
        </Link>
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <Link to="/my-courses" className="hover:text-blue-200 transition font-medium">
                คอร์สของฉัน
              </Link>
              <span className="text-blue-100">สวัสดี, {user.name}</span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition font-medium"
              >
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link 
              to="/login" 
              className="bg-white text-blue-600 px-5 py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;