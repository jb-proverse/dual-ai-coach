import { useMemo, useState } from 'react';
import './App.css';
import { sendChat, type Role } from './lib/api';
import { ChatTabs } from './components/ChatTabs';
import { ProgressBar } from './components/ProgressBar';
import { Milestones } from './components/Milestones';

function App() {
  const [persona, setPersona] = useState<'engineer' | 'life'>('engineer');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: Role; content: string }[]>([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const progressPct = useMemo(() => {
    try {
      const ms = (window as any).__milestones || [];
      const total = ms.length || 0;
      const done = ms.filter((m: any) => m.complete).length;
      return total ? Math.round((done / total) * 100) : 0;
    } catch {
      return 0;
    }
  }, [(window as any).__milestones]);

  const onSend = async () => {
    if (!input.trim() || loading) return;
    const newMsgs = [...messages, { role: 'user' as Role, content: input.trim() }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    const r = await sendChat(persona, newMsgs, { title: 'Demo' });
    setLoading(false);
    setReply(r.text || r.error || '');
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Dual‑AI Coach</h1>

      <ChatTabs active={persona} onChange={setPersona} />

      <div className="mt-4">
        <input value={input} onChange={e => setInput(e.target.value)} className="w-full border p-2" placeholder="Say something..." />
        <button onClick={onSend} className="mt-2 px-3 py-1 bg-blue-600 text-white" disabled={loading}>{loading ? 'Sending…' : 'Send'}</button>
      </div>

      <div className="mt-4 whitespace-pre-wrap border p-3 min-h-[120px]">{reply}</div>

      <Milestones />

      <div className="mt-6">
        <div className="mb-1 text-sm text-slate-600">Overall progress: {progressPct}%</div>
        <ProgressBar percent={progressPct} />
      </div>
    </div>
  );
}

export default App;
