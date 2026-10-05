import { useState } from 'react';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
  {
    id: 1,
    category: 'enrollment',
    categoryName: 'คุณสมบัติและการเรียน',
    question: 'ผู้เรียน EduPro e-Learning ต้องมีคุณสมบัติอะไรบ้าง',
    answerText: 'ไม่มีข้อกำหนดคุณสมบัติผู้เรียน เพียงแค่ท่านสนใจอยากเรียนรู้และพัฒนาทักษะด้านเทคโนโลยี การเขียนโปรแกรม หรือทักษะการทำงาน และมีอุปกรณ์ที่เชื่อมต่ออินเทอร์เน็ตได้ก็สามารถเรียน EduPro e-Learning ได้',
    answer: (
      <span>
        ไม่มีข้อกำหนดคุณสมบัติผู้เรียน เพียงแค่ท่านสนใจอยากเรียนรู้และพัฒนาทักษะด้านเทคโนโลยี การเขียนโปรแกรม หรือทักษะการทำงาน และมีอุปกรณ์ที่เชื่อมต่ออินเทอร์เน็ตได้ก็สามารถเรียน EduPro e-Learning ได้
      </span>
    ),
  },
  {
    id: 2,
    category: 'enrollment',
    categoryName: 'การสมัครและการเข้าเรียน',
    question: 'อยากสมัครเรียน EduPro e-Learning ต้องทำอย่างไร',
    answerText: 'ท่านจะต้องสมัครสมาชิก EduPro ก่อนโดยสามารถสมัครได้โดย >> คลิกที่นี่ (ฟรีไม่มีค่าใช้จ่าย) จากนั้นเลือกคอร์สเรียนที่ท่านสนใจในหน้ารวมคอร์ส แล้วกดลงทะเบียนเพื่อเข้าสู่บทเรียนได้ทันที',
    answer: (
      <span>
        ท่านจะต้องสมัครสมาชิก EduPro ก่อนโดยสามารถสมัครสมาชิกได้โดย{' '}
        <Link to="/register" className="text-amber-600 hover:text-amber-700 font-medium hover:underline inline-flex items-center gap-0.5">
          &gt;&gt; คลิกที่นี่ (ฟรีไม่มีค่าใช้จ่าย)
        </Link>{' '}
        จากนั้นเลือกคอร์สเรียนที่ท่านสนใจในหน้ารวมคอร์ส แล้วกดลงทะเบียนเพื่อเข้าสู่บทเรียนได้ทันที
      </span>
    ),
  },
  {
    id: 3,
    category: 'account',
    categoryName: 'การจัดการบัญชี',
    question: 'เป็นสมาชิก EduPro อยู่แล้ว แต่จำ username และ password ไม่ได้ควรทำอย่างไร',
    answerText: 'หากท่านจำรหัสผ่านไม่ได้ สามารถเข้าไปจัดการได้ที่เมนู >> ความปลอดภัยและรหัสผ่าน ในหน้าโปรไฟล์ของท่าน หรือแจ้งเรื่องผ่าน >> แบบฟอร์มติดต่อสอบถาม เพื่อให้เจ้าหน้าที่ฝ่ายสนับสนุนดูแลช่วยเหลือ',
    answer: (
      <span>
        หากท่านจำรหัสผ่านไม่ได้ สามารถเข้าไปจัดการหรือตั้งรหัสผ่านใหม่ได้ที่เมนู{' '}
        <Link to="/profile" className="text-amber-600 hover:text-amber-700 font-medium hover:underline">
          &gt;&gt; ความปลอดภัยและรหัสผ่าน
        </Link>{' '}
        ในหน้าโปรไฟล์ของท่าน หรือแจ้งเรื่องผ่าน{' '}
        <Link to="/contact" className="text-amber-600 hover:text-amber-700 font-medium hover:underline">
          &gt;&gt; แบบฟอร์มติดต่อสอบถาม
        </Link>{' '}
        เพื่อให้เจ้าหน้าที่ฝ่ายสนับสนุนดูแลช่วยเหลือ
      </span>
    ),
  },
  {
    id: 4,
    category: 'enrollment',
    categoryName: 'การสมัครและการเข้าเรียน',
    question: 'เมื่อลงทะเบียนคอร์สแล้ว มีกำหนดระยะเวลาหมดอายุหรือไม่',
    answerText: 'ไม่มีกำหนดระยะเวลา เมื่อท่านลงทะเบียนคอร์สแล้วจะได้รับสิทธิ์เข้าถึงเนื้อหาบทเรียนได้ตลอดชีพ (Lifetime Access) สามารถเข้าดูบทเรียนได้ตลอดเวลาที่หน้า >> คอร์สของฉัน และสามารถกลับมาเรียนซ้ำหรือทบทวนได้ตามความสะดวกของท่าน',
    answer: (
      <span>
        ไม่มีกำหนดระยะเวลา เมื่อท่านลงทะเบียนคอร์สแล้วจะได้รับสิทธิ์เข้าถึงเนื้อหาบทเรียนได้ตลอดชีพ (Lifetime Access) สามารถเข้าดูบทเรียนได้ตลอดเวลาที่หน้า{' '}
        <Link to="/my-courses" className="text-amber-600 hover:text-amber-700 font-medium hover:underline">
          &gt;&gt; คอร์สของฉัน
        </Link>{' '}
        และสามารถกลับมาเรียนซ้ำหรือทบทวนได้ตามความสะดวกของท่าน
      </span>
    ),
  },
  {
    id: 5,
    category: 'certificate',
    categoryName: 'ใบประกาศนียบัตร',
    question: 'เมื่อเรียนจบหลักสูตร จะได้รับใบประกาศนียบัตร (Certificate) หรือไม่',
    answerText: 'ท่านจะได้รับใบประกาศนียบัตรดิจิทัลทันทีเมื่อเรียนครบตามเกณฑ์ 100% โดยระบบจะสร้าง Certificate พร้อมรหัสตรวจสอบความถูกต้อง (Verification ID) ที่สามารถนำไปอ้างอิงใน Resume หรือแฟ้มสะสมผลงานได้ทันที โดยไม่มีค่าใช้จ่ายเพิ่มเติม',
    answer: (
      <span>
        ท่านจะได้รับใบประกาศนียบัตรดิจิทัลทันทีเมื่อเรียนครบตามเกณฑ์ 100% โดยระบบจะสร้าง Certificate พร้อมรหัสตรวจสอบความถูกต้อง (Verification ID) ที่สามารถนำไปอ้างอิงใน Resume หรือแฟ้มสะสมผลงานได้ทันที โดยไม่มีค่าใช้จ่ายเพิ่มเติม
      </span>
    ),
  },
  {
    id: 6,
    category: 'enrollment',
    categoryName: 'คุณสมบัติและการเรียน',
    question: 'สามารถเรียนผ่านโทรศัพท์มือถือหรือแท็บเล็ตได้หรือไม่',
    answerText: 'สามารถเรียนได้ทุกที่ทุกเวลา แพลตฟอร์ม EduPro รองรับการใช้งานผ่าน Web Browser บนอุปกรณ์ทุกชนิด ทั้งคอมพิวเตอร์ โน้ตบุ๊ก แท็บเล็ต iPad และสมาร์ตโฟนทั้งระบบ iOS และ Android โดยไม่ต้องติดตั้งแอปพลิเคชันเพิ่มเติม',
    answer: (
      <span>
        สามารถเรียนได้ทุกที่ทุกเวลา แพลตฟอร์ม EduPro รองรับการใช้งานผ่าน Web Browser บนอุปกรณ์ทุกชนิด ทั้งคอมพิวเตอร์ โน้ตบุ๊ก แท็บเล็ต iPad และสมาร์ตโฟนทั้งระบบ iOS และ Android โดยไม่ต้องติดตั้งแอปพลิเคชันเพิ่มเติม
      </span>
    ),
  },
  {
    id: 7,
    category: 'account',
    categoryName: 'การจัดการบัญชี',
    question: 'สามารถแก้ไขชื่อ-นามสกุล ที่แสดงบนใบประกาศนียบัตรได้หรือไม่',
    answerText: 'ท่านสามารถตรวจสอบและแก้ไขชื่อ-นามสกุล ได้ที่เมนู >> ข้อมูลส่วนตัว ในหน้าโปรไฟล์ของท่าน โดยระบบจะนำชื่อดังกล่าวไปแสดงบนใบประกาศนียบัตรอย่างถูกต้อง',
    answer: (
      <span>
        ท่านสามารถตรวจสอบและแก้ไขชื่อ-นามสกุล ได้ที่เมนู{' '}
        <Link to="/profile" className="text-amber-600 hover:text-amber-700 font-medium hover:underline">
          &gt;&gt; ข้อมูลส่วนตัว
        </Link>{' '}
        ในหน้าโปรไฟล์ของท่าน โดยระบบจะนำชื่อดังกล่าวไปแสดงบนใบประกาศนียบัตรอย่างถูกต้อง
      </span>
    ),
  },
  {
    id: 8,
    category: 'payment',
    categoryName: 'การชำระเงินและเอกสาร',
    question: 'หากต้องการขอใบเสร็จรับเงินหรือใบกำกับภาษี ต้องทำอย่างไร',
    answerText: 'หากท่านต้องการใบเสร็จรับเงินหรือใบกำกับภาษีเต็มรูปแบบ สามารถระบุข้อมูลและเลขอ้างอิงคำสั่งซื้อผ่าน >> แบบฟอร์มติดต่อสอบถาม เจ้าหน้าที่จะประสานงานและจัดส่งเอกสารให้ท่านทาง e-Mail ภายใน 3 วันทำการ',
    answer: (
      <span>
        หากท่านต้องการใบเสร็จรับเงินหรือใบกำกับภาษีเต็มรูปแบบ สามารถระบุข้อมูลและเลขอ้างอิงคำสั่งซื้อผ่าน{' '}
        <Link to="/contact" className="text-amber-600 hover:text-amber-700 font-medium hover:underline">
          &gt;&gt; แบบฟอร์มติดต่อสอบถาม
        </Link>{' '}
        เจ้าหน้าที่จะประสานงานและจัดส่งเอกสารให้ท่านทาง e-Mail ภายใน 3 วันทำการ
      </span>
    ),
  },
];

const CATEGORIES = [
  { id: 'all', label: 'ทั้งหมด' },
  { id: 'enrollment', label: 'การสมัครและการเข้าเรียน' },
  { id: 'account', label: 'การจัดการบัญชี' },
  { id: 'certificate', label: 'ใบประกาศนียบัตร' },
  { id: 'payment', label: 'การชำระเงินและเอกสาร' },
];

function HelpCenter() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState(1); // open first question by default

  // Filter FAQs
  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchCat = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchSearch =
      searchQuery.trim() === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answerText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-900">
      {/* Hero Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            คำถามที่พบบ่อย (FAQ)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2 max-w-xl mx-auto leading-relaxed">
            ข้อสงสัยทั่วไปเกี่ยวกับการสมัคร การเรียน และการใช้งานระบบ หรือส่งข้อความติดต่อทีมงาน
          </p>

          {/* Quick Search Bar */}
          <div className="mt-8 max-w-xl mx-auto relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="พิมพ์คำค้นหา เช่น การสมัคร, ใบรับรอง, รหัสผ่าน..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-xs transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs text-slate-400 hover:text-slate-600"
              >
                ล้างคำค้น
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column: FAQ List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Questions Accordion - SET e-Learning Style */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-200">
              {filteredFaqs.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-slate-700">ไม่พบคำตอบที่ตรงกับคำค้นหา</p>
                  <p className="text-xs text-slate-400 mt-1">
                    ลองใช้คำค้นหาอื่น หรือสามารถส่งข้อความสอบถามทีมงานได้โดยตรงผ่านแบบฟอร์มติดต่อ
                  </p>
                </div>
              ) : (
                filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className="transition-colors">
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/70 transition cursor-pointer"
                      >
                        <span className="text-sm sm:text-base font-medium text-slate-800 leading-snug">
                          {faq.question}
                        </span>
                        <div className="shrink-0 text-slate-600">
                          <svg
                            className={`w-4 h-4 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2.5}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white">
                          <div className="flex items-start gap-1.5">
                            <span className="font-medium text-slate-800 shrink-0">A :</span>
                            <div className="text-slate-600 leading-relaxed space-y-2">
                              {faq.answer}
                            </div>
                          </div>
                          <div className="mt-3.5 pl-5 flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                              หมวดหมู่: {faq.categoryName}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Contact Channels & CTA to Contact Page */}
          <div className="space-y-6">
            {/* Quick Contact Box */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ช่องทางติดต่อฝ่ายบริการ
              </h3>
              <ul className="space-y-3.5 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs">อีเมลฝ่ายสนับสนุน</span>
                    <a href="mailto:support@edupro.com" className="text-emerald-600 hover:underline text-xs sm:text-sm">
                      support@edupro.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs">เบอร์โทรศัพท์</span>
                    <span className="text-slate-700 text-xs sm:text-sm">02-123-4567, 081-234-5678</span>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 border border-slate-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block text-xs">เวลาทำการ</span>
                    <span className="text-slate-500 text-xs sm:text-sm">จันทร์ - ศุกร์ (09:00 - 18:00 น.)</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Need More Help / Contact Us Link Card */}
            <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-xl border border-emerald-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1.5">
                ต้องการความช่วยเหลือเพิ่มเติม?
              </h3>
              <p className="text-xs text-slate-600 mb-4 leading-relaxed">
                หากท่านยังไม่พบคำตอบ หรือมีเรื่องต้องการประสานงานเฉพาะด้าน สามารถส่งข้อความผ่านแบบฟอร์มในหน้าติดต่อเรา
              </p>
              <Link
                to="/contact"
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
              >
                <span>ไปยังหน้าติดต่อเรา (Contact Us)</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
