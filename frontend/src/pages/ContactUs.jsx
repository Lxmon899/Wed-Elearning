import { useState } from 'react';
import { Link } from 'react-router-dom';

function ContactUs() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    topic: 'general',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วนในช่องที่จำเป็น (*)');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        topic: 'general',
        subject: '',
        message: '',
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 text-slate-900">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-center">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-3">
            บริการและช่วยเหลือ
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            ติดต่อเรา (Contact Us)
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-2.5 max-w-xl mx-auto leading-relaxed">
            หากท่านมีข้อสงสัย ต้องการความช่วยเหลือในการเรียน หรือประสานงานด้านหลักสูตร
            ทีมงาน EduPro ยินดีให้บริการทุกช่องทาง
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Contact Channels & Location (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quick Contact Information Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                ช่องทางการติดต่อฝ่ายบริการ
              </h2>

              <ul className="space-y-4 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">อีเมลฝ่ายสนับสนุนผู้เรียน</span>
                    <a href="mailto:support@edupro.com" className="text-emerald-600 hover:text-emerald-700 hover:underline">
                      support@edupro.com
                    </a>
                    <span className="text-[11px] text-slate-400 block mt-0.5">ตอบกลับภายใน 24 ชม.</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">โทรศัพท์ฝ่ายบริการ</span>
                    <span className="text-slate-800 font-medium">02-123-4567, 081-234-5678</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">วันจันทร์ - ศุกร์ (09:00 - 18:00 น.)</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-200">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.03 2 11c0 2.87 1.5 5.43 3.84 7.02l-.98 3.59a.5.5 0 0 0 .68.58l4.13-1.8c.74.2 1.52.31 2.33.31 5.52 0 10-4.03 10-9s-4.48-9-10-9zm0 16c-.74 0-1.46-.1-2.15-.29a.5.5 0 0 0-.35.04l-2.77 1.21.65-2.4a.5.5 0 0 0-.15-.47C5.87 14.86 4 13.08 4 11c0-3.86 3.58-7 8-7s8 3.14 8 7-3.58 7-8 7z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block text-xs">LINE Official</span>
                    <span className="text-emerald-700 font-semibold">@edupro_th</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">ติดต่อเจ้าหน้าที่แบบแชทด่วน</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Office & Operating Hours Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-3">
                สำนักงานและเวลาทำการ
              </h2>
              <div className="text-xs sm:text-sm text-slate-600 space-y-3 leading-relaxed">
                <div>
                  <span className="font-semibold text-slate-800 block text-xs mb-1">ที่อยู่สำนักงาน:</span>
                  <p className="text-slate-600">
                    อาคาร EduPro Learning Hub ชั้น 15 เลขที่ 123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <span className="font-semibold text-slate-800 block text-xs mb-1">เวลาให้บริการ:</span>
                  <p className="text-slate-600">
                    วันจันทร์ - วันศุกร์ เวลา 09:00 - 18:00 น.<br />
                    (หยุดวันเสาร์ - อาทิตย์ และวันหยุดนักขัตฤกษ์)
                  </p>
                </div>
              </div>
            </div>

            {/* FAQ Helper Card */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 rounded-2xl border border-amber-200/80 p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-950">
                    มีข้อสงสัยเร่งด่วนหรือไม่?
                  </h3>
                  <p className="text-xs text-amber-800/80 mt-1 leading-relaxed">
                    ท่านสามารถค้นหาคำตอบเกี่ยวกับคุณสมบัติผู้เรียน การสมัคร คอร์สเรียน หรือใบประกาศนียบัตรได้ทันที
                  </p>
                  <Link
                    to="/help"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-800 hover:underline mt-2.5"
                  >
                    &gt;&gt; ดูคำถามที่พบบ่อย (FAQ) ทั้งหมด
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">
                  ส่งข้อความติดต่อทีมงาน
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  กรุณากรอกข้อมูลและรายละเอียดที่ต้องการสอบถาม เจ้าหน้าที่จะติดต่อกลับทางอีเมลโดยเร็วที่สุด
                </p>
              </div>

              {submitSuccess ? (
                <div className="py-12 px-6 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-emerald-900">ส่งข้อความเรียบร้อยแล้ว</h3>
                  <p className="text-xs sm:text-sm text-emerald-700 mt-1.5 max-w-md mx-auto leading-relaxed">
                    ขอบคุณที่ติดต่อ EduPro ทางทีมงานได้รับข้อความของท่านแล้ว และจะประสานงานติดต่อกลับไปยังอีเมลที่ท่านระบุไว้โดยเร็วที่สุด
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-medium transition shadow-xs"
                  >
                    ส่งข้อความอื่นเพิ่มเติม
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="เช่น สมชาย ใจดี"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                        อีเมลติดต่อกลับ <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                        เบอร์โทรศัพท์ (ไม่บังคับ)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="08X-XXX-XXXX"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      />
                    </div>

                    <div>
                      <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                        เรื่องที่ต้องการติดต่อ <span className="text-rose-500">*</span>
                      </label>
                      <select
                        name="topic"
                        value={formData.topic}
                        onChange={handleChange}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      >
                        <option value="general">สอบถามข้อมูลทั่วไป / หลักสูตร</option>
                        <option value="enrollment">ปัญหาเกี่ยวกับการสมัครและเข้าเรียน</option>
                        <option value="payment">ปัญหาการชำระเงิน / ขอใบกำกับภาษี</option>
                        <option value="certificate">ปัญหาเกี่ยวกับใบประกาศนียบัตร</option>
                        <option value="instructor">สนใจสมัครเป็นผู้สอน / วิทยากร</option>
                        <option value="technical">แจ้งปัญหาทางเทคนิคของระบบ</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                      หัวข้อข้อความ
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="ระบุหัวข้อย่อ เช่น สอบถามเงื่อนไขการรับเกียรติบัตร"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1.5 text-xs">
                      รายละเอียดข้อความ <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="โปรดระบุรายละเอียดข้อสงสัย ปัญหาที่พบ หรือข้อมูลที่ต้องการความช่วยเหลือ..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition resize-none"
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold transition shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmitting ? 'กำลังส่งข้อมูล...' : 'ส่งข้อความถึงทีมงาน'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
