export type Role = 'user' | 'assistant' | 'system';

export async function sendChat(
  persona: 'engineer' | 'life',
  messages: { role: Role; content: string }[],
  projectContext: Record<string, unknown>
): Promise<{ text?: string; error?: string }>{
  const base = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
  const res = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ persona, messages, projectContext })
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => '');
    return { error: `API ${res.status}: ${msg}` };
  }
  return res.json();
}
