import { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  CheckCircle2, 
  XCircle, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  Sparkles, 
  AlertCircle,
  Clock,
  BookOpen,
  Lightbulb,
  Check
} from 'lucide-react';
import { getCourseQuiz, submitCourseQuiz } from '../api';

export default function QuizModal({ courseId, courseTitle, onClose, onPassQuiz }) {
  const [loading, setLoading] = useState(true);
  const [quizData, setQuizData] = useState(null);
  const [error, setError] = useState(null);
  
  // Quiz taking state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: choiceId }
  const [submitting, setSubmitting] = useState(false);
  
  // Results state
  const [quizResult, setQuizResult] = useState(null);
  const [viewMode, setViewMode] = useState('quiz'); // 'quiz' | 'result'

  useEffect(() => {
    loadQuiz();
  }, [courseId]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCourseQuiz(courseId);
      if (data.error) {
        setError(data.error);
      } else {
        setQuizData(data);
      }
    } catch (err) {
      setError('ไม่สามารถโหลดแบบทดสอบได้ โปรดลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = (questionId, choiceId) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleNext = () => {
    if (quizData && currentIndex < quizData.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quizData || !quizData.questions.length) return;

    // Check if all questions are answered
    const unansweredCount = quizData.questions.filter(q => !answers[q.id]).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(`คุณยังไม่ได้ตอบคำถามอีก ${unansweredCount} ข้อ ต้องการส่งคำตอบเลยหรือไม่?`);
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const res = await submitCourseQuiz(courseId, answers);
      if (res.error) {
        alert(res.error);
      } else {
        setQuizResult(res);
        setViewMode('result');
        if (res.passed && onPassQuiz) {
          onPassQuiz(res);
        }
      }
    } catch (err) {
      alert('ส่งคำตอบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentIndex(0);
    setQuizResult(null);
    setViewMode('quiz');
  };

  const questions = quizData?.questions || [];
  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-rose-100/60 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-rose-100/70 bg-gradient-to-r from-rose-50/70 via-white to-rose-50/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 shadow-sm border border-rose-200/60">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-slate-900">แบบทดสอบวัดความรู้ (Quiz)</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                  เกณฑ์ผ่าน 70%
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[280px] sm:max-w-md">
                {courseTitle || quizData?.courseTitle || 'คอร์สเรียน'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
              <div className="w-10 h-10 border-3 border-rose-200 border-t-rose-600 rounded-full animate-spin"></div>
              <p className="text-sm font-medium">กำลังโหลดแบบทดสอบ...</p>
            </div>
          ) : error ? (
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center my-6">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-800 mb-4">{error}</p>
              <button
                onClick={loadQuiz}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700 transition"
              >
                ลองใหม่อีกครั้ง
              </button>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-14 px-4">
              <div className="w-16 h-16 rounded-3xl bg-rose-50 flex items-center justify-center text-rose-500 mx-auto mb-4 border border-rose-100">
                <BookOpen className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-800 mb-1">ยังไม่มีแบบทดสอบสำหรับคอร์สนี้</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                ผู้สอนกำลังจัดทำชุดคำถามสำหรับคอร์สนี้ คุณสามารถทบทวนบทเรียนและรอการอัปเดตได้เลย
              </p>
            </div>
          ) : viewMode === 'result' && quizResult ? (
            /* ================= Result Screen ================= */
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Score Card Banner */}
              <div className={`p-6 rounded-3xl border text-center relative overflow-hidden ${
                quizResult.passed 
                  ? 'bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-emerald-200 text-emerald-950' 
                  : 'bg-gradient-to-br from-rose-50 via-amber-50/30 to-white border-rose-200 text-rose-950'
              }`}>
                <div className="inline-flex p-3 rounded-2xl mb-3 shadow-sm border ${quizResult.passed ? 'bg-emerald-100 text-emerald-600 border-emerald-200' : 'bg-rose-100 text-rose-600 border-rose-200'}">
                  {quizResult.passed ? (
                    <Award className="w-8 h-8 text-emerald-600" />
                  ) : (
                    <RotateCcw className="w-8 h-8 text-rose-600" />
                  )}
                </div>

                <h4 className="text-xl font-bold mb-1">
                  {quizResult.passed ? '🎉 ยินดีด้วย! คุณผ่านแบบทดสอบแล้ว' : '💪 ยังไม่ผ่านเกณฑ์ พยายามอีกนิดนะ!'}
                </h4>
                <p className="text-xs font-medium opacity-80 mb-5">
                  {quizResult.passed 
                    ? 'คุณทำคะแนนผ่านเกณฑ์ที่กำหนด (70%) สามารถขอรับใบประกาศนียบัตรได้' 
                    : 'เกณฑ์การผ่านคือ 70% ขึ้นไป ทบทวนบทเรียนแล้วลองทำใหม่อีกครั้ง'}
                </p>

                {/* Score Stats */}
                <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-slate-200/60 shadow-xs">
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">คะแนนที่ได้</p>
                    <p className="text-lg font-bold text-slate-900">{quizResult.score} / {quizResult.totalQuestions}</p>
                  </div>
                  <div className="border-x border-slate-100">
                    <p className="text-[11px] text-slate-500 font-medium">คิดเป็น</p>
                    <p className={`text-lg font-bold ${quizResult.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {quizResult.percentage}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500 font-medium">ผลการประเมิน</p>
                    <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                      quizResult.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {quizResult.passed ? 'ผ่าน' : 'ไม่ผ่าน'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review of each question */}
              <div>
                <h5 className="font-bold text-sm text-slate-800 mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-600" />
                  <span>เฉลยและคำอธิบายโดยละเอียด ({quizResult.results.length} ข้อ)</span>
                </h5>

                <div className="space-y-4">
                  {quizResult.results.map((item, idx) => (
                    <div 
                      key={item.questionId}
                      className={`p-4 rounded-2xl border transition-all ${
                        item.isCorrect 
                          ? 'border-emerald-200 bg-emerald-50/20' 
                          : 'border-rose-200 bg-rose-50/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-start gap-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                            item.isCorrect ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                          }`}>
                            {idx + 1}
                          </span>
                          <p className="font-semibold text-sm text-slate-900 leading-snug">
                            {item.questionText}
                          </p>
                        </div>
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1 ${
                          item.isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                        }`}>
                          {item.isCorrect ? (
                            <>
                              <Check className="w-3 h-3" /> ถูกต้อง
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" /> ไม่ถูกต้อง
                            </>
                          )}
                        </span>
                      </div>

                      {/* Choices Breakdown */}
                      <div className="space-y-1.5 pl-7 mb-3">
                        {item.choices.map((c) => {
                          const isSelected = c.isSelected;
                          const isCorrect = c.isCorrect;

                          let choiceStyle = 'border-slate-100 bg-white text-slate-600';
                          if (isCorrect) {
                            choiceStyle = 'border-emerald-300 bg-emerald-50/80 text-emerald-900 font-semibold';
                          } else if (isSelected && !isCorrect) {
                            choiceStyle = 'border-rose-300 bg-rose-50/80 text-rose-900 line-through';
                          }

                          return (
                            <div
                              key={c.id}
                              className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-colors ${choiceStyle}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                  isCorrect ? 'bg-emerald-600 text-white' : isSelected ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {isCorrect ? '✓' : isSelected ? '✕' : ''}
                                </span>
                                <span>{c.text}</span>
                              </div>
                              <div className="text-[10px] font-bold">
                                {isCorrect && <span className="text-emerald-700">(คำตอบที่ถูกต้อง)</span>}
                                {isSelected && !isCorrect && <span className="text-rose-600">(คำตอบของคุณ)</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation if exists */}
                      {item.explanation && (
                        <div className="ml-7 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-bold">คำอธิบาย: </span>
                            <span>{item.explanation}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ================= Taking Quiz Screen ================= */
            <div className="space-y-6">
              {/* Previous Attempt Summary if any */}
              {quizData?.lastAttempt && (
                <div className="p-3 px-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${quizData.lastAttempt.passed ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span className="text-slate-600 font-medium">
                      ประวัติการทำล่าสุด: <strong>{quizData.lastAttempt.score}/{quizData.lastAttempt.totalQuestions} คะแนน</strong> ({Math.round((quizData.lastAttempt.score / quizData.lastAttempt.totalQuestions) * 100)}%)
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                    quizData.lastAttempt.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {quizData.lastAttempt.passed ? 'ผ่านแล้ว' : 'ยังไม่ผ่าน'}
                  </span>
                </div>
              )}

              {/* Question Progress bar */}
              <div>
                <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    ข้อที่ {currentIndex + 1} จากทั้งหมด {questions.length} ข้อ
                  </span>
                  <span>ตอบแล้ว {answeredCount}/{questions.length} ข้อ ({progressPercent}%)</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-rose-500 to-rose-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>

                {/* Quick Nav Badges */}
                <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1">
                  {questions.map((q, idx) => {
                    const isAnswered = Boolean(answers[q.id]);
                    const isCurrent = idx === currentIndex;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={`w-7 h-7 rounded-lg text-xs font-bold transition flex items-center justify-center shrink-0 cursor-pointer ${
                          isCurrent
                            ? 'bg-rose-600 text-white ring-2 ring-rose-200 shadow-sm'
                            : isAnswered
                            ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current Question Card */}
              {currentQ && (
                <div className="p-5 sm:p-6 rounded-3xl border border-rose-100/80 bg-white shadow-xs">
                  <div className="flex items-start gap-3 mb-5">
                    <span className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold shrink-0 mt-0.5">
                      ข้อ {currentIndex + 1}
                    </span>
                    <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                      {currentQ.text}
                    </h4>
                  </div>

                  {/* Choices list */}
                  <div className="space-y-3">
                    {currentQ.choices.map((choice, choiceIdx) => {
                      const letter = String.fromCharCode(65 + choiceIdx); // A, B, C, D
                      const isSelected = answers[currentQ.id] === choice.id;

                      return (
                        <button
                          key={choice.id}
                          onClick={() => handleSelectChoice(currentQ.id, choice.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3.5 cursor-pointer group ${
                            isSelected
                              ? 'border-rose-600 bg-rose-50/80 text-rose-950 shadow-sm ring-1 ring-rose-600/30'
                              : 'border-slate-200/90 bg-white text-slate-700 hover:border-rose-300 hover:bg-rose-50/20'
                          }`}
                        >
                          <div className={`w-7 h-7 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                            isSelected 
                              ? 'bg-rose-600 text-white' 
                              : 'bg-slate-100 text-slate-600 group-hover:bg-rose-100 group-hover:text-rose-700'
                          }`}>
                            {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : letter}
                          </div>

                          <span className="text-sm font-medium flex-1">
                            {choice.text}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-rose-100/70 bg-slate-50/70 flex items-center justify-between shrink-0 gap-3">
          {viewMode === 'result' ? (
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4 text-slate-500" />
                <span>ทำแบบทดสอบใหม่อีกครั้ง</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition cursor-pointer shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0 || loading}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">ข้อก่อนหน้า</span>
              </button>

              <div className="flex items-center gap-2">
                {currentIndex < questions.length - 1 ? (
                  <button
                    onClick={handleNext}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-600/20"
                  >
                    <span>ข้อถัดไป</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || loading || questions.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 text-white text-xs font-bold hover:from-rose-700 hover:to-rose-800 transition flex items-center gap-2 cursor-pointer shadow-md shadow-rose-600/25 disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                        <span>กำลังตรวจคำตอบ...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-rose-200" />
                        <span>ส่งคำตอบ (Submit Quiz)</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
