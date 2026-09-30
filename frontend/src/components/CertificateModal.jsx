import { useState, useRef } from 'react';
import {
  Award,
  Download,
  Printer,
  Copy,
  Check,
  X,
  Share2,
  ShieldCheck,
  Sparkles,
  Calendar,
  User,
  BookOpen,
} from 'lucide-react';

function CertificateModal({ course, user, onClose }) {
  const [copied, setCopied] = useState(false);
  const [downloadingImg, setDownloadingImg] = useState(false);
  const certRef = useRef(null);

  if (!course) return null;

  const studentName = user?.name || 'ผู้สำเร็จการศึกษา (Learner)';
  const courseTitle = course.title || 'หลักสูตรการเรียนรู้';
  const instructorName = course.instructor || 'อาจารย์ผู้เชี่ยวชาญ';
  
  // Format Thai & English Date
  const today = new Date();
  const dateFormattedThai = today.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const dateFormattedEn = today.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const credentialId = `CRIMSON-CERT-${course.id.toString().padStart(4, '0')}-${user?.id || 1}-${Math.abs(course.id * 31 + (user?.id || 1) * 17).toString(16).toUpperCase()}`;

  // คัดลอกรหัสอ้างอิง
  const handleCopyId = () => {
    navigator.clipboard.writeText(credentialId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // พิมพ์ / บันทึกเป็น PDF ผ่าน browser print
  const handlePrint = () => {
    window.print();
  };

  // ดาวน์โหลดเป็นรูปภาพ PNG คุณภาพสูงผ่าน HTML5 Canvas
  const handleDownloadImage = () => {
    setDownloadingImg(true);

    try {
      const canvas = document.createElement('canvas');
      const width = 1920;
      const height = 1200;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      // 1. Background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);

      // Subtle warm tint gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#FFF5F5');
      bgGrad.addColorStop(0.5, '#FFFFFF');
      bgGrad.addColorStop(1, '#FFF1F2');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Outer Ornamental Border
      ctx.lineWidth = 14;
      ctx.strokeStyle = '#E11D48'; // Rose-600
      ctx.strokeRect(36, 36, width - 72, height - 72);

      // Inner thin gold/accent border
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#F59E0B'; // Amber-500
      ctx.strokeRect(54, 54, width - 108, height - 108);

      // Inner subtle border
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.2)';
      ctx.strokeRect(64, 64, width - 128, height - 128);

      // 3. Corner Decorations
      const drawCorner = (x, y, flipX, flipY) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(flipX, flipY);
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 40);
        ctx.lineTo(0, 0);
        ctx.lineTo(40, 0);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.beginPath();
        ctx.arc(12, 12, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      drawCorner(74, 74, 1, 1);
      drawCorner(width - 74, 74, -1, 1);
      drawCorner(74, height - 74, 1, -1);
      drawCorner(width - 74, height - 74, -1, -1);

      // 4. Logo & Header
      ctx.textAlign = 'center';
      
      // Academy Brand
      ctx.font = 'bold 34px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.fillText('CRIMSON ACADEMY', width / 2, 140);

      ctx.font = '500 18px "Inter", sans-serif';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('CENTER FOR ADVANCED LEARNING & TECHNOLOGY', width / 2, 172);

      // Certificate Title
      ctx.font = '800 64px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('CERTIFICATE OF COMPLETION', width / 2, 260);

      ctx.font = '600 24px "Prompt", sans-serif';
      ctx.fillStyle = '#9F1239';
      ctx.fillText('ใบประกาศนียบัตรสำเร็จหลักสูตร', width / 2, 304);

      // Subtitle
      ctx.font = '400 22px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า (This is proudly presented to)', width / 2, 380);

      // Student Name
      ctx.font = 'bold 56px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.fillText(studentName, width / 2, 470);

      // Underline for name
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#FEE2E2';
      ctx.beginPath();
      ctx.moveTo(width / 2 - 300, 495);
      ctx.lineTo(width / 2 + 300, 495);
      ctx.stroke();

      ctx.fillStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(width / 2, 495, 6, 0, Math.PI * 2);
      ctx.fill();

      // Achievement Text
      ctx.font = '400 22px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('ได้สำเร็จหลักสูตรการเรียนรู้และผ่านการประเมินทักษะอย่างสมบูรณ์ในวิชา', width / 2, 570);

      // Course Title
      ctx.font = 'bold 44px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(courseTitle, width / 2, 650);

      // Verification seal / emblem in center bottom
      const sealX = width / 2;
      const sealY = 820;

      // Seal Gold Outer Circle
      ctx.fillStyle = '#FEF3C7';
      ctx.beginPath();
      ctx.arc(sealX, sealY, 68, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 5;
      ctx.strokeStyle = '#F59E0B';
      ctx.stroke();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#E11D48';
      ctx.beginPath();
      ctx.arc(sealX, sealY, 56, 0, Math.PI * 2);
      ctx.stroke();

      // Seal Text
      ctx.font = 'bold 15px "Inter", sans-serif';
      ctx.fillStyle = '#92400E';
      ctx.fillText('VERIFIED', sealX, sealY - 14);
      ctx.font = 'bold 14px "Inter", sans-serif';
      ctx.fillStyle = '#E11D48';
      ctx.fillText('★ ★ ★', sealX, sealY + 6);
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillStyle = '#92400E';
      ctx.fillText('CREDENTIAL', sealX, sealY + 24);

      // Left Signature: Instructor
      const leftSigX = 360;
      const sigY = 960;

      ctx.textAlign = 'center';
      // Stylized signature line
      ctx.font = 'italic 34px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.fillText(instructorName, leftSigX, sigY - 20);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(leftSigX - 160, sigY);
      ctx.lineTo(leftSigX + 160, sigY);
      ctx.stroke();

      ctx.font = 'bold 19px "Prompt", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText(instructorName, leftSigX, sigY + 30);
      ctx.font = '400 15px "Prompt", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('อาจารย์ผู้สอนหลักสูตร (Lead Instructor)', leftSigX, sigY + 54);

      // Right Signature: Dean / Director
      const rightSigX = width - 360;

      ctx.font = 'italic 34px "Brush Script MT", cursive, sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.fillText('Dr. Kittipong Wattanachai', rightSigX, sigY - 20);

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#CBD5E1';
      ctx.beginPath();
      ctx.moveTo(rightSigX - 160, sigY);
      ctx.lineTo(rightSigX + 160, sigY);
      ctx.stroke();

      ctx.font = 'bold 19px "Prompt", sans-serif';
      ctx.fillStyle = '#0F172A';
      ctx.fillText('ดร. กิตติพงษ์ วัฒนชัย', rightSigX, sigY + 30);
      ctx.font = '400 15px "Prompt", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('ผู้อำนวยการฝ่ายวิชาการ (Academic Director)', rightSigX, sigY + 54);

      // Footer Credentials Info
      ctx.textAlign = 'center';
      ctx.font = '500 15px "Prompt", "Inter", sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`วันที่สำเร็จการศึกษา: ${dateFormattedThai} (${dateFormattedEn})`, width / 2, 1070);

      ctx.font = 'bold 14px "Inter", monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`Credential ID: ${credentialId}`, width / 2, 1100);

      // Convert canvas to download link
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Certificate-${courseTitle.replace(/\s+/g, '_')}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      alert('เกิดข้อผิดพลาดในการดาวน์โหลดรูปภาพ กรุณาลองใช้ปุ่มพิมพ์/บันทึก PDF');
    } finally {
      setDownloadingImg(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white animate-in fade-in duration-200">
      <div
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-rose-100 overflow-hidden flex flex-col my-auto print:max-w-none print:shadow-none print:border-none print:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl crimson-gradient text-white flex items-center justify-center font-bold shadow-md shadow-rose-600/30">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                <span>ใบประกาศนียบัตรสำเร็จหลักสูตร</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ผ่านการรับรองแล้ว
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Official Verified Certificate of Completion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Display Container (Printable) */}
        <div className="p-4 sm:p-8 bg-slate-100/60 overflow-y-auto max-h-[calc(85vh-9rem)] flex justify-center print:p-0 print:bg-white print:max-h-none print:overflow-visible">
          <div
            id="printable-certificate"
            ref={certRef}
            className="relative bg-white w-full max-w-3xl aspect-[1.414/1] sm:aspect-[1.5/1] rounded-2xl shadow-xl border-8 border-rose-600 p-6 sm:p-10 flex flex-col justify-between overflow-hidden print:w-full print:h-screen print:rounded-none print:border-[12px] print:shadow-none"
          >
            {/* Guilloche / Security Pattern watermark background */}
            <div className="absolute inset-0 bg-[radial-gradient(#E11D48_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-2 border-2 border-amber-500/70 rounded-xl pointer-events-none" />
            <div className="absolute inset-3 border border-rose-100 rounded-lg pointer-events-none" />

            {/* Corner Decorative Dots */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-amber-500" />
            <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-amber-500" />
            <div className="absolute bottom-4 left-4 w-3 h-3 rounded-full bg-amber-500" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-amber-500" />

            {/* 1. Certificate Header */}
            <div className="text-center relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 text-rose-600 font-extrabold text-sm sm:text-base tracking-wider uppercase">
                <Sparkles className="w-4 h-4 fill-rose-600" />
                <span>Crimson Academy</span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-widest uppercase">
                Center for Advanced Learning & Technology
              </p>

              <div className="pt-2 sm:pt-4">
                <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                  CERTIFICATE OF COMPLETION
                </h2>
                <p className="text-xs sm:text-sm font-bold text-rose-800 mt-0.5">
                  ใบประกาศนียบัตรสำเร็จหลักสูตร
                </p>
              </div>
            </div>

            {/* 2. Certificate Body */}
            <div className="text-center relative z-10 my-auto py-2 sm:py-4 space-y-2 sm:space-y-3">
              <p className="text-xs sm:text-sm text-slate-500">
                ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า (This is proudly presented to)
              </p>

              {/* Student Name */}
              <div className="py-1 sm:py-2">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-rose-600 tracking-tight">
                  {studentName}
                </h1>
                <div className="w-48 sm:w-72 h-0.5 bg-rose-200 mx-auto mt-2 relative">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose-600" />
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
                ได้สำเร็จหลักสูตรการเรียนรู้และผ่านเกณฑ์การประเมินทักษะอย่างสมบูรณ์ในวิชา
              </p>

              {/* Course Title */}
              <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                {courseTitle}
              </h3>
            </div>

            {/* 3. Certificate Signatures & Seal */}
            <div className="relative z-10 pt-3 sm:pt-4 border-t border-slate-200">
              <div className="grid grid-cols-3 items-end">
                {/* Left: Instructor Signature */}
                <div className="text-center space-y-1">
                  <p className="font-serif italic text-base sm:text-xl text-slate-800 font-semibold tracking-wide">
                    {instructorName}
                  </p>
                  <div className="w-28 sm:w-36 h-px bg-slate-300 mx-auto" />
                  <p className="text-[11px] sm:text-xs font-bold text-slate-800">
                    {instructorName}
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">
                    อาจารย์ผู้สอนหลักสูตร
                  </p>
                </div>

                {/* Center: Official Golden Seal */}
                <div className="flex flex-col items-center justify-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 border-4 border-amber-400 text-amber-700 flex flex-col items-center justify-center shadow-md relative">
                    <div className="absolute inset-1 rounded-full border border-rose-400" />
                    <ShieldCheck className="w-5 h-5 text-amber-600 mb-0.5" />
                    <span className="text-[8px] font-black tracking-widest text-amber-800">VERIFIED</span>
                    <span className="text-[7px] text-rose-600 font-bold">★ ★ ★</span>
                  </div>
                </div>

                {/* Right: Academic Director Signature */}
                <div className="text-center space-y-1">
                  <p className="font-serif italic text-base sm:text-xl text-slate-800 font-semibold tracking-wide">
                    Dr. Kittipong W.
                  </p>
                  <div className="w-28 sm:w-36 h-px bg-slate-300 mx-auto" />
                  <p className="text-[11px] sm:text-xs font-bold text-slate-800">
                    ดร. กิตติพงษ์ วัฒนชัย
                  </p>
                  <p className="text-[9px] sm:text-[10px] text-slate-400">
                    ผู้อำนวยการฝ่ายวิชาการ
                  </p>
                </div>
              </div>

              {/* Bottom Metadata */}
              <div className="mt-4 pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-400 gap-1">
                <span>วันที่สำเร็จการศึกษา: {dateFormattedThai}</span>
                <span className="font-mono font-semibold text-slate-500">
                  Credential ID: {credentialId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls (Hidden on print) */}
        <div className="p-4 sm:p-6 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          {/* Credential ID Copy Bar */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs w-full sm:w-auto">
            <span className="text-slate-400 font-mono text-[11px] truncate max-w-[200px] sm:max-w-xs">
              ID: {credentialId}
            </span>
            <button
              onClick={handleCopyId}
              className="text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 shrink-0 cursor-pointer ml-auto"
              title="คัดลอกรหัสอ้างอิง"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">คัดลอกแล้ว</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>คัดลอก</span>
                </>
              )}
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>พิมพ์ / บันทึกเป็น PDF</span>
            </button>

            <button
              disabled={downloadingImg}
              onClick={handleDownloadImage}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl crimson-gradient text-white font-bold text-xs sm:text-sm hover:opacity-95 shadow-md shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{downloadingImg ? 'กำลังประมวลผล...' : 'ดาวน์โหลดรูปภาพ (PNG)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CertificateModal;
