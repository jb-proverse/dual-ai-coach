import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendChat, type Role } from '../lib/api';

export default function Chat(){
  const [persona, setPersona] = useState<'engineer'|'life'>('engineer');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: Role; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    if (!input.trim() || loading) return;
    const newMsgs = [...messages, { role: 'user' as Role, content: input.trim() }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);
    
    // Get comprehensive project context
    let projectContext: any = { title: 'Decentralized Voting App' };
    let milestones: any[] = [];
    let reflections: any = {};
    
    try {
      const projectData = localStorage.getItem('current_project');
      if (projectData) {
        projectContext = JSON.parse(projectData);
      }
      
      const savedMilestones = localStorage.getItem('milestones');
      if (savedMilestones) {
        milestones = JSON.parse(savedMilestones);
      }
      
      // Get reflections for completed milestones
      const completedMilestones = milestones.filter(m => m.complete);
      reflections = completedMilestones.map((m) => {
        try {
          const reflection = localStorage.getItem(`reflection-${milestones.indexOf(m)}`);
          return reflection ? { milestone: m.title, reflection } : null;
        } catch {
          return null;
        }
      }).filter(Boolean);
      
    } catch {
      // ignore
    }
    
    const completedCount = milestones.filter(m => m.complete).length;
    const totalCount = milestones.length;
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    // Enhanced project context
    const enhancedContext = {
      ...projectContext,
      milestones: milestones.map(m => ({
        title: m.title,
        description: m.description,
        complete: m.complete
      })),
      progress: progress,
      completedCount: completedCount,
      totalCount: totalCount,
      reflections: reflections,
      currentMilestone: milestones.find(m => !m.complete)?.title || 'All complete!'
    };
    
    const r = await sendChat(persona, newMsgs, enhancedContext);
    setLoading(false);
    if (r.text) setMessages(msgs => [...msgs, { role: 'assistant' as Role, content: r.text! }]);
  };

  const bg = persona==='engineer' ? 'bg-blue-50' : 'bg-violet-50';
  const avatar = persona==='engineer' ? '🤖' : '🧠';

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b sticky top-0 bg-white z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 flex items-center gap-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Back to Tracker</span>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-indigo-600">AI Coaching</h1>
              <p className="text-sm text-gray-500">Get help with Decentralized Voting App</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Coach Selection */}
        <div className="flex flex-col sm:flex-row gap-2 mb-6">
          <button
            onClick={() => setPersona('engineer')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition ${
              persona === 'engineer' 
                ? 'bg-indigo-600 text-white' 
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <span>🤖</span>
            <span>Engineer Coach</span>
          </button>
          <button
            onClick={() => setPersona('life')}
            className={`px-4 py-2 rounded-full flex items-center gap-2 transition ${
              persona === 'life' 
                ? 'bg-purple-600 text-white' 
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            <span>🧠</span>
            <span>Life Coach</span>
          </button>
        </div>

        {/* Chat Area */}
        <div className={`${bg} rounded-xl p-6 min-h-[400px] mb-6`}>
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <div className="text-4xl mb-4">{avatar}</div>
              <div className="text-lg font-medium mb-2">
                Hi! I'm your AI {persona === 'engineer' ? 'Engineer' : 'Life'} Coach.
              </div>
              <div className="text-sm">
                I see you're working on "Decentralized Voting App". 
                {persona === 'engineer' 
                  ? " Let's break down the technical implementation step by step. What specific technical challenge would you like to tackle first?"
                  : " How are you feeling about this project? What's on your mind?"
                }
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-4 ${
                    m.role === 'user' 
                      ? 'bg-white shadow-sm' 
                      : 'bg-white shadow-sm'
                  }`}>
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{avatar}</span>
                        <span className="text-sm font-medium text-gray-600">
                          {persona === 'engineer' ? 'Engineer Coach' : 'Life Coach'}
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className="text-xs text-gray-400 mt-2">
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask your ${persona === 'engineer' ? 'Engineering' : 'Life'} coach anything...`}
            className="flex-1 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            onKeyPress={e => e.key === 'Enter' && onSend()}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="px-6 py-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
