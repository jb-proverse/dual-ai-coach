import { ReactNode } from 'react';

type Props = { active: 'engineer'|'life'; onChange: (p:'engineer'|'life')=>void };
export function ChatTabs({ active, onChange }: Props){
  return (
    <div className="mt-3 inline-flex rounded border overflow-hidden">
      {(['engineer','life'] as const).map(p => (
        <button key={p} onClick={()=>onChange(p)}
          className={(active===p? 'bg-black text-white':'bg-white text-black')+ ' px-3 py-1 border-r last:border-r-0'}>
          {p==='engineer'?'Engineer':'Life'}
        </button>
      ))}
    </div>
  );
}
