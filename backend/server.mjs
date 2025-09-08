import Fastify from 'fastify';

const fastify = Fastify();

fastify.get('/health', async () => ({ ok: true }));

fastify.post('/chat', async (req, reply) => {
  return { message: 'LLM proxy placeholder' };
});

fastify.listen({ port: 3001, host: '0.0.0.0' }).then(() => {
  console.log('API on 3001');
});
