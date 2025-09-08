export function ProgressBar({ percent }: { percent: number }){
  const pct = Math.max(0, Math.min(100, Math.round(percent)));
  return (
    <div className="w-full bg-slate-200 h-2 rounded">
      <div className="bg-green-600 h-2 rounded" style={{ width: pct + '%' }} />
    </div>
  );
}
