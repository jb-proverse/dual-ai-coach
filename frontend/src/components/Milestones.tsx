import { useState } from 'react';

type Milestone = { title: string; description?: string; acceptance?: string[] };

export function Milestones() {
  const [goal, setGoal] = useState('Build a portfolio project');
  const [items, setItems] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(false);
  const plan = async () => {
    setLoading(true);
    const base = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
    const res = await fetch(`${base}/plan`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ goal }) });
    const data = await res.json();
    setItems(Array.isArray(data?.milestones) ? data.milestones : []);
    setLoading(false);
  };
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold">Milestones</h2>
      <div className="mt-2 flex gap-2">
        <input value={goal} onChange={e=>setGoal(e.target.value)} className="flex-1 border p-2" />
        <button className="px-3 py-1 bg-indigo-600 text-white" onClick={plan} disabled={loading}>{loading?'Planning…':'Generate plan'}</button>
      </div>
      <ol className="mt-4 list-decimal pl-6 space-y-2">
        {items.map((m,i)=> (
          <li key={i}>
            <div className="font-medium">{m.title}</div>
            {m.description && <div className="text-sm text-slate-600">{m.description}</div>}
            {!!m.acceptance?.length && (
              <ul className="list-disc pl-5 text-sm mt-1">
                {m.acceptance.map((a,idx)=>(<li key={idx}>{a}</li>))}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
