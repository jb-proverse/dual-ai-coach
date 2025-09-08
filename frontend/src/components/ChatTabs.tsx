type Props = { active: 'engineer'|'life'; onChange: (p:'engineer'|'life')=>void };
export function ChatTabs({ active, onChange }: Props){
  const tabs: { key: 'engineer'|'life'; label: string; emoji: string }[] = [
    { key: 'engineer', label: 'Engineer Coach', emoji: '👨‍💻' },
    { key: 'life', label: 'Life Coach', emoji: '🧠' },
  ];
  return (
    <div className="mt-3 inline-flex rounded-lg border overflow-hidden">
      {tabs.map(t => (
        <button
          key={t.key}
          onClick={()=>onChange(t.key)}
          className={
            (active===t.key
              ? (t.key==='engineer' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white')
              : 'bg-white text-gray-700 hover:bg-slate-50')+
            ' px-3 py-1.5 border-r last:border-r-0 flex items-center gap-2 transition-all duration-200'
          }
          aria-pressed={active===t.key}
        >
          <span>{t.emoji}</span>
          <span className="text-sm">{t.label}</span>
        </button>
      ))}
    </div>
  );
}
