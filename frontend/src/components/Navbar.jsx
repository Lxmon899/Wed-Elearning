import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Bookmark,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Award,
  Compass,
  CheckCircle2,
  Sparkles,
  Layers,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useBookmarks } from '../context/BookmarkContext';
import { useNotifications } from '../context/NotificationContext';
import { logout as apiLogout } from '../api';

function formatRelativeTime(dateString) {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'เมื่อสักครู่';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} นาทีที่แล้ว`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ชม. ที่แล้ว`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'เมื่อวานนี้';
  if (diffInDays < 7) return `${diffInDays} วันที่แล้ว`;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });
}

function renderNotificationBadge(type) {
  switch (type) {
    case 'certificate':
      return (
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
          <Award className="w-4 h-4" />
        </div>
      );
    case 'course':
      return (
        <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 shadow-xs">
          <BookOpen className="w-4 h-4" />
        </div>
      );
    case 'quiz':
      return (
        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
          <Bell className="w-4 h-4" />
        </div>
      );
  }
}

function Navbar({ onSearchChange, searchQuery = '' }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { bookmarkCount } = useBookmarks();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotifications();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileRef = useRef(null);
  const notificationRef = useRef(null);

  // Sync user state with localStorage and custom auth events
  useEffect(() => {
    const handleAuthChange = () => {
      try {
        setUser(JSON.parse(localStorage.getItem('user') || 'null'));
      } catch {
        setUser(null);
      }
    };

    window.addEventListener('auth:expired', handleAuthChange);
    window.addEventListener('auth:logout', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth:expired', handleAuthChange);
      window.removeEventListener('auth:logout', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const logout = () => {
    setProfileDropdownOpen(false);
    apiLogout({ redirect: true, expired: false });
  };

  const handleNotificationClick = (n) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    if (n.link) {
      setNotificationOpen(false);
      navigate(n.link);
    }
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-rose-100 crimson-shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4">
          {/* Left: Brand Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl crimson-gradient flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition duration-200">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-rose-600 transition flex items-center gap-1.5">
                  Crimson<span className="text-rose-600">Academy</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 hidden sm:inline-block">
                    PRO
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium -mt-1 hidden sm:block">
                  Modern E-Learning Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  location.pathname === '/'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <Compass className="w-4 h-4" />
                <span>Explore Courses</span>
              </Link>
              <Link
                to="/my-courses"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  location.pathname === '/my-courses'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>My Learning</span>
              </Link>
              <Link
                to="/certificates"
                className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                  location.pathname === '/certificates'
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-600 hover:text-rose-600 hover:bg-slate-50'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>Certificates</span>
              </Link>
            </div>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm relative">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาคอร์ส, เทคโนโลยี, ผู้สอน..."
                value={searchQuery}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 focus:bg-white transition"
              />
            </div>
          </div>

          {/* Right: User Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">


            {/* Bookmarks Icon with Realtime Counter */}
            <button
              onClick={() => {
                const el = document.getElementById('course-catalog');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition shrink-0"
              title={`บันทึกไว้ ${bookmarkCount} คอร์ส`}
            >
              <Bookmark className="w-5 h-5" />
              {bookmarkCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center shadow-sm">
                  {bookmarkCount}
                </span>
              )}
            </button>

            {/* Notification Bell with Dropdown */}
            {user && (
              <div className="relative shrink-0" ref={notificationRef}>
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="การแจ้งเตือน"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-4 h-4 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Popover */}
                {notificationOpen && (
                  <div className="absolute right-[-48px] sm:right-0 mt-2 w-[calc(100vw-32px)] max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-rose-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-rose-600" />
                        <h4 className="font-bold text-slate-800 text-sm">การแจ้งเตือน</h4>
                        {unreadCount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                            {unreadCount} ใหม่
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium">
                            ทั้งหมด {notifications.length} รายการ
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-xs text-rose-600 hover:text-rose-700 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>อ่านทั้งหมด</span>
                          </button>
                        )}
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAll}
                            className="text-xs text-slate-400 hover:text-rose-600 font-medium flex items-center gap-1 cursor-pointer ml-1"
                            title="ล้างการแจ้งเตือนทั้งหมด"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ล้าง</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="divide-y divide-slate-100 mt-2 max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-slate-400">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                            <Bell className="w-5 h-5" />
                          </div>
                          <p className="text-xs font-semibold text-slate-600">ไม่มีการแจ้งเตือน</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">ข่าวสารและประกาศใหม่จะแจ้งให้ทราบที่นี่</p>
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 rounded-xl transition hover:bg-slate-50 flex items-start gap-3 cursor-pointer group relative ${
                              !n.isRead ? 'bg-rose-50/50' : ''
                            }`}
                          >
                            {renderNotificationBadge(n.type)}
                            <div className="flex-1 min-w-0 pr-4">
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-bold text-slate-900 truncate">{n.title}</p>
                                {!n.isRead && (
                                  <span className="w-2 h-2 rounded-full bg-rose-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5 leading-snug line-clamp-2">
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {formatRelativeTime(n.createdAt)}
                              </span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(n.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition absolute right-2 top-3"
                              title="ลบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar Dropdown / Login Button */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition group"
                >
                  <div className="w-8 h-8 rounded-full crimson-gradient text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-none group-hover:text-rose-600 transition">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-slate-400 capitalize">
                      {user.role === 'admin' ? 'Administrator' : 'Student'}
                    </span>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-rose-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="p-3 border-b border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full crimson-gradient text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/my-courses"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        <span>คอร์สเรียนของฉัน</span>
                      </Link>
                      <Link
                        to="/instructor"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition"
                      >
                        <Layers className="w-4 h-4 text-rose-600" />
                        <span>แดชบอร์ดผู้สอน (Instructor Hub)</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-rose-600 transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white crimson-gradient hover:opacity-95 rounded-xl shadow-md shadow-rose-500/20 transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาคอร์ส, เทคโนโลยี..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500"
            />
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-rose-100 py-4 space-y-3 animate-in fade-in slide-in-from-top-4 duration-200">
            {/* User Quick Info & Streak Banner for Mobile */}
            {user && (
              <div className="p-3 bg-rose-50/60 rounded-2xl border border-rose-100/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full crimson-gradient text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'ผู้เรียน (Student)'}</p>
                  </div>
                </div>

              </div>
            )}

            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <Compass className="w-5 h-5 text-rose-500" />
                <span>สำรวจคอร์สทั้งหมด (Explore Courses)</span>
              </Link>

              <Link
                to="/my-courses"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition"
              >
                <BookOpen className="w-5 h-5 text-rose-500" />
                <span>คอร์สเรียนของฉัน (My Learning)</span>
              </Link>

              <button
                onClick={() => {
                  const el = document.getElementById('course-catalog');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Bookmark className="w-5 h-5 text-rose-500" />
                  <span>คอร์สที่บันทึกไว้ (Bookmarks)</span>
                </div>
                {bookmarkCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
                    {bookmarkCount}
                  </span>
                )}
              </button>

              <Link
                to="/certificates"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-slate-700 hover:bg-rose-50 hover:text-rose-600 transition text-left"
              >
                <Award className="w-5 h-5 text-rose-500" />
                <span>ใบรับรอง (Certificates)</span>
              </Link>

              {user && (
                <Link
                  to="/instructor"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-rose-700 bg-rose-50 hover:bg-rose-100/70 transition"
                >
                  <Layers className="w-5 h-5 text-rose-600" />
                  <span>แดชบอร์ดผู้สอน (Instructor Hub)</span>
                </Link>
              )}
            </div>

            {user ? (
              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-5 h-5" />
                  <span>ออกจากระบบ</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center font-bold text-sm text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center font-bold text-sm text-white crimson-gradient hover:opacity-95 rounded-xl shadow-xs transition"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;