import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

function Navbar() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload();
  };

  const isActive = (path) => location.pathname === path;

  const scrollToTop = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToCourses = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      // รอให้หน้า Home โหลดก่อนแล้วค่อย scroll
      setTimeout(() => {
        document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { path: '/', label: 'หน้าแรก', onClick: scrollToTop },
    { path: '/#courses', label: 'คอร์สทั้งหมด', onClick: scrollToCourses },
    ...(user ? [{ path: '/my-courses', label: 'คอร์สของฉัน' }] : []),
    { path: '/help', label: 'คำถามที่พบบ่อย' },
    { path: '/contact', label: 'ติดต่อเรา' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center group-hover:bg-emerald-700 transition-colors duration-200">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Edu<span className="text-emerald-600">Pro</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={link.onClick || undefined}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin')
                        ? 'bg-emerald-600 text-white'
                        : 'text-gray-700 bg-gray-100 hover:bg-gray-200/70'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                    จัดการระบบ
                  </Link>
                )}

                {user.role === 'instructor' && (
                  <Link
                    to="/instructor"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/instructor')
                        ? 'bg-blue-600 text-white'
                        : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100/70'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                    </svg>
                    จัดการการสอน
                  </Link>
                )}

                <Link
                  to="/profile"
                  title="ดูและแก้ไขโปรไฟล์"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition ${
                    isActive('/profile')
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-gray-50 border-gray-200/60 hover:bg-gray-100/80 hover:border-gray-300'
                  }`}
                >
                  <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-800">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                      Admin
                    </span>
                  )}
                  {user.role === 'instructor' && (
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                      Instructor
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="text-sm text-gray-500 hover:text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-emerald-700 px-4 py-2 rounded-lg transition-all duration-200"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 animate-slide-down">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map(link => {
              const active = isActive(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={(e) => { setMobileOpen(false); link.onClick && link.onClick(e); }}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'text-emerald-700 bg-emerald-50 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive('/admin')
                    ? 'text-emerald-700 bg-emerald-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                </svg>
                จัดการระบบ
              </Link>
            )}

            {user?.role === 'instructor' && (
              <Link
                to="/instructor"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive('/instructor')
                    ? 'text-blue-700 bg-blue-50'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                </svg>
                จัดการการสอน
              </Link>
            )}

            <div className="pt-3 border-t border-gray-100 space-y-2">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-800">{user.name}</div>
                        <div className="text-[11px] text-emerald-600 font-medium">ดูและตั้งค่าโปรไฟล์ →</div>
                      </div>
                    </div>
                    {user.role === 'admin' && (
                      <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                        Admin
                      </span>
                    )}
                    {user.role === 'instructor' && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wide">
                        Instructor
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition"
                  >
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
                  >
                    เข้าสู่ระบบ
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-emerald-600"
                  >
                    สมัครสมาชิก
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;