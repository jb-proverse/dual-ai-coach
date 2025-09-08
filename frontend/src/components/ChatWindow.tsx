import { useState } from 'react';
import { sendChat, type Role } from '../lib/api';

type Props = { persona: 'engineer'|'life'; onPersonaChange?: (p:'engineer'|'life')=>void };

export function ChatWindow({ persona }: Props){
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: Role; content: string }[]>([]);

  const onSend = async () => {
    if (!input.trim() || loading) return;
    const newMsgs = [...messages, { role: 'user' as Role, content: input.trim() }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    const r = await sendChat(persona, newMsgs, { title: 'Demo' });
    setLoading(false);
    if (r.text) setMessages(msgs => [...msgs, { role: 'assistant' as Role, content: r.text! }]);
  };

  const bg = persona==='engineer' ? 'bg-blue-50' : 'bg-violet-50';
  const avatar = persona==='engineer' ? '👨‍💻' : '🧠';

  return (
    <div>
      <div className={`${bg} rounded p-3 min-h-[220px] transition-colors`}>
        {messages.map((m,i)=> (
          <div key={i} className={(m.role==='user'?'text-right':'text-left')+" mb-2 flex "+(m.role==='user'? 'justify-end':'justify-start')}>
            <div className={(m.role==='user'?'bg-white':'bg-black text-white')+" inline-flex items-start gap-2 px-3 py-1 rounded max-w-[80%] shadow-sm"}>
              {m.role==='assistant' && <span className="mt-0.5">{avatar}</span>}
              <span className="whitespace-pre-wrap">{m.content}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={input} onChange={e=>setInput(e.target.value)} className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-200" placeholder="Ask for help…" />
        <button onClick={onSend} disabled={loading} className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 active:scale-95 transition">{loading?'Sending…':'Send'}</button>
      </div>
    </div>
  );
}


