export function ProgressBar({ percent }: { percent: number }){
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full bg-gray-200 h-3 rounded-full">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out" style={{ width: pct + '%' }} />
    </div>
  );
}
