import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">
                Edu<span className="text-emerald-600">Pro</span>
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              แพลตฟอร์มเรียนออนไลน์คุณภาพ<br />
              เรียนรู้ทักษะใหม่จากผู้เชี่ยวชาญตัวจริง
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">เรียนรู้</h4>
            <ul className="space-y-2.5">
              <li><Link to="/" className="text-sm text-gray-500 hover:text-emerald-600 transition">คอร์สทั้งหมด</Link></li>
              <li><span className="text-sm text-gray-400">คอร์สยอดนิยม</span></li>
              <li><span className="text-sm text-gray-400">คอร์สใหม่ล่าสุด</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">เกี่ยวกับเรา</h4>
            <ul className="space-y-2.5">
              <li><Link to="/help" className="text-sm text-gray-500 hover:text-emerald-600 transition">คำถามที่พบบ่อย</Link></li>
              <li><span className="text-sm text-gray-400">เงื่อนไขการใช้งาน</span></li>
              <li><span className="text-sm text-gray-400">นโยบายความเป็นส่วนตัว</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">ติดต่อ</h4>
            <ul className="space-y-2.5">
              <li>
                <Link to="/contact" className="text-sm text-emerald-600 font-medium hover:text-emerald-700 hover:underline inline-flex items-center gap-1">
                  แบบฟอร์มติดต่อเรา &rarr;
                </Link>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                contact@edupro.com
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-500">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                02-123-4567
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            © 2026 EduPro. สงวนลิขสิทธิ์ทุกประการ
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
