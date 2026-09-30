function ProgressBar({ percentage = 0, size = 'md', showText = true, theme = 'crimson' }) {
  // ขนาด: sm, md, lg
  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size] || 'h-2.5';

  const validPercentage = Math.min(100, Math.max(0, Math.round(percentage || 0)));

  // สีและ gradient ตาม Theme และความคืบหน้า
  const getBarColor = (p) => {
    if (p >= 100) return 'bg-emerald-500 shadow-sm shadow-emerald-500/20';
    if (theme === 'crimson') return 'crimson-gradient shadow-sm shadow-rose-500/20';
    if (p >= 50) return 'bg-rose-500';
    return 'bg-amber-500';
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${heightClass} rounded-full transition-all duration-700 ease-out ${getBarColor(validPercentage)}`}
          style={{ width: `${validPercentage}%` }}
        />
      </div>
      {showText && (
        <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5 font-medium">
          <span className="flex items-center gap-1">
            {validPercentage >= 100 ? (
              <span className="text-emerald-600 font-bold">สำเร็จครบ 100%</span>
            ) : (
              <span>ความคืบหน้า</span>
            )}
          </span>
          <span className={`font-bold ${validPercentage >= 100 ? 'text-emerald-600' : 'text-slate-800'}`}>
            {validPercentage}%
          </span>
        </div>
      )}
    </div>
  );
}

export default ProgressBar;