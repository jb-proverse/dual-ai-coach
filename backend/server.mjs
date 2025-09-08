import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import OpenAI from 'openai';

const fastify = Fastify();
await fastify.register(cors, { origin: true });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

fastify.get('/health', async () => ({ ok: true }));

fastify.post('/chat', async (req, reply) => {
  try {
    const { persona = 'engineer', messages = [], projectContext = {} } = req.body || {};
    const system = persona === 'engineer'
      ? 'You are Engineer Coach. Provide milestones, steps, assumptions, next check. Keep concise.'
      : 'You are Life Coach. Validate, reframe, offer one micro-action, encourage. No technical guidance.';

    const userMessages = Array.isArray(messages)
      ? messages.map(m => ({ role: m.role, content: m.content })).slice(-12)
      : [];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'system', content: 'Project context: ' + JSON.stringify(projectContext).slice(0, 2000) },
        ...userMessages
      ],
      temperature: persona === 'life' ? 0.7 : 0.3,
    });

    const text = response.choices?.[0]?.message?.content || '';
    return { text };
  } catch (err) {
    reply.code(500);
    return { error: 'LLM error', detail: String(err) };
  }
});

fastify.post('/plan', async (req, reply) => {
  try {
    const { goal = '', experience = 'beginner', stack = '' } = req.body || {};
    const system = 'You are Engineer Coach. Create 3-5 milestones with acceptance criteria as JSON under { "milestones": [ { "title": string, "description": string, "acceptance": string[] } ] }.';
    const user = `Goal: ${goal}\nExperience: ${experience}\nStack: ${stack}`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.3
    });
    const text = response.choices?.[0]?.message?.content || '{}';
    let json;
    try { json = JSON.parse(text); } catch { json = { milestones: [] }; }
    return json;
  } catch (err) {
    reply.code(500);
    return { error: 'Plan error', detail: String(err) };
  }
});

const port = Number(process.env.PORT || 3001);
fastify.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`API on ${port}`);
});
