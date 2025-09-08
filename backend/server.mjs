import Fastify from 'fastify';
import cors from '@fastify/cors';
import 'dotenv/config';
import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';

const fastify = Fastify();
await fastify.register(cors, { origin: true });

// Rate limiting for project generation
const projectGenerationLimits = new Map(); // IP -> { count, resetTime }
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5; // Max 5 project generations per minute per IP

const hasApiKey = !!process.env.OPENAI_API_KEY;
const openai = hasApiKey ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

// Load export templates
async function loadTemplate(fileName) {
  const fullPath = path.resolve(process.cwd(), '../docs/templates/', fileName);
  try {
    return await fs.readFile(fullPath, 'utf8');
  } catch {
    return '';
  }
}

function getByPath(obj, keyPath) {
  const parts = String(keyPath).split('.');
  let cur = obj;
  for (const p of parts) {
    if (p === 'this') continue;
    cur = cur?.[p];
  }
  return cur;
}

function renderTemplate(tpl, data) {
  if (!tpl) return '';
  // Handle each blocks (supports nested and paths like this.acceptance)
  const eachRe = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
  let out = tpl;
  out = out.replace(eachRe, (_m, key, inner) => {
    const arr = getByPath(data, key) || [];
    if (!Array.isArray(arr)) return '';
    return arr.map(item => renderTemplate(inner, item)).join('');
  });
  // Replace variables like {{foo}} or {{this.bar}}
  out = out.replace(/\{\{\s*([^#\/{][^}]*)\s*\}\}/g, (_m, key) => {
    const val = getByPath(data, key.trim());
    if (val == null) return '';
    if (Array.isArray(val)) return val.join(', ');
    return String(val);
  });
  return out;
}

const templates = {
  readme: await loadTemplate('README.template.md'),
  linkedin: await loadTemplate('linkedin.template.md'),
};

fastify.get('/health', async () => ({ ok: true }));

fastify.post('/chat', async (req, reply) => {
  try {
    const { persona = 'engineer', messages = [], projectContext = {} } = req.body || {};
    
    // Enhanced persona-specific system prompts
    const engineerPrompt = `You are an expert Engineering Coach specializing in blockchain development and Web3 technologies. Your role is to provide technical guidance, debugging help, and step-by-step implementation advice.

**Your Expertise:**
- Smart contract development (Solidity)
- Web3.js integration
- MetaMask connection
- Remix IDE deployment
- Blockchain concepts and best practices
- Frontend development (React, JavaScript)

**Your Approach:**
- Provide clear, actionable technical guidance
- Break down complex concepts into manageable steps
- Include code examples when helpful
- Suggest debugging strategies
- Reference current project progress and milestones
- Be encouraging but focused on technical solutions

**Response Style:**
- Use technical terminology appropriately
- Include emojis sparingly (🚀, 💻, ⚡)
- Structure responses with clear sections
- Provide next steps and actionable items
- Reference the user's current project context

**Current Project Context:** ${JSON.stringify(projectContext).slice(0, 1000)}`;

    const lifeCoachPrompt = `You are a compassionate Life Coach specializing in supporting learners through challenging technical projects. Your role is to provide emotional support, motivation, and learning strategies.

**Your Expertise:**
- Motivation and encouragement
- Overcoming overwhelm and stress
- Building confidence in learning
- Managing procrastination
- Celebrating progress and achievements
- Learning strategies and mindset

**Your Approach:**
- Validate the user's feelings and challenges
- Provide emotional support and encouragement
- Suggest practical learning strategies
- Help break down overwhelming tasks
- Celebrate small wins and progress
- Offer perspective on the learning journey

**Response Style:**
- Use warm, encouraging language
- Include supportive emojis (💙, 🌟, 💪, 🎯)
- Acknowledge the difficulty of learning complex topics
- Provide actionable micro-steps
- Focus on mindset and emotional well-being
- Reference current project progress positively

**Current Project Context:** ${JSON.stringify(projectContext).slice(0, 1000)}`;

    const system = persona === 'engineer' ? engineerPrompt : lifeCoachPrompt;

    const userMessages = Array.isArray(messages)
      ? messages.map(m => ({ role: m.role, content: m.content })).slice(-12)
      : [];
    
    if (!hasApiKey) {
      const last = userMessages[userMessages.length - 1]?.content || '';
      const mock = persona === 'engineer'
        ? `I'm your Engineering Coach! 🚀\n\nI can help you with:\n• Smart contract development\n• Web3.js integration\n• MetaMask connection\n• Remix IDE deployment\n• Debugging and troubleshooting\n\nWhat technical challenge are you facing?`
        : `Hi there! I'm your Life Coach! 🧠\n\nI'm here to help with:\n• Motivation and encouragement\n• Managing overwhelm and stress\n• Building confidence\n• Staying consistent\n• Celebrating your progress\n\nHow are you feeling about your project today?`;
      return { text: mock };
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        ...userMessages
      ],
      temperature: persona === 'life' ? 0.8 : 0.4,
      max_tokens: 500,
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
    const { goal = '', experience = 'beginner', stack = '', generateNew = false } = req.body || {};
    
    // Rate limiting for project generation
    if (generateNew) {
      const clientIP = req.ip || req.headers['x-forwarded-for'] || 'unknown';
      const now = Date.now();
      const limit = projectGenerationLimits.get(clientIP);
      
      if (limit) {
        if (now < limit.resetTime) {
          if (limit.count >= MAX_REQUESTS_PER_WINDOW) {
            reply.code(429);
            return { 
              error: 'Rate limit exceeded', 
              message: 'Too many project generations. Please wait before trying again.',
              retryAfter: Math.ceil((limit.resetTime - now) / 1000)
            };
          }
          limit.count++;
        } else {
          // Reset window
          projectGenerationLimits.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        }
      } else {
        // First request
        projectGenerationLimits.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    }
    
    if (!hasApiKey) {
      // Mock project generation with variety
      const mockProjects = [
        {
          title: 'Decentralized Voting App',
          description: 'A blockchain-based voting system using smart contracts',
          milestones: [
            { title: 'Research what a smart contract is', description: 'Learn the fundamentals of smart contracts and how they work on Ethereum', complete: false },
            { title: 'Write a basic smart contract in Solidity', description: 'Create your first smart contract using Solidity programming language', complete: false },
            { title: 'Deploy contract using Remix', description: 'Use Remix IDE to compile and deploy your contract to testnet', complete: false },
            { title: 'Build frontend with Web3.js', description: 'Create a React frontend that interacts with your smart contract', complete: false },
            { title: 'Connect frontend to contract', description: 'Integrate MetaMask and enable full DApp functionality', complete: false },
            { title: 'Write README + LinkedIn post', description: 'Document your project and create a professional showcase post', complete: false },
          ]
        },
        {
          title: 'NFT Marketplace',
          description: 'A decentralized marketplace for buying and selling NFTs',
          milestones: [
            { title: 'Learn NFT basics', description: 'Understand what NFTs are and how they work on blockchain', complete: false },
            { title: 'Create NFT smart contract', description: 'Build a Solidity contract for minting and managing NFTs', complete: false },
            { title: 'Add marketplace functionality', description: 'Implement buying, selling, and bidding features', complete: false },
            { title: 'Build React frontend', description: 'Create a user-friendly interface for the marketplace', complete: false },
            { title: 'Integrate IPFS storage', description: 'Store NFT metadata on decentralized storage', complete: false },
            { title: 'Deploy and document', description: 'Deploy to testnet and create portfolio documentation', complete: false },
          ]
        },
        {
          title: 'DeFi Yield Farming App',
          description: 'A decentralized finance application for yield farming',
          milestones: [
            { title: 'Understand DeFi concepts', description: 'Learn about liquidity pools, yield farming, and AMMs', complete: false },
            { title: 'Create token contracts', description: 'Build ERC-20 tokens for the farming protocol', complete: false },
            { title: 'Implement staking mechanism', description: 'Create smart contracts for staking and rewards', complete: false },
            { title: 'Build user interface', description: 'Create a React app for interacting with the protocol', complete: false },
            { title: 'Add liquidity features', description: 'Implement adding and removing liquidity functionality', complete: false },
            { title: 'Test and deploy', description: 'Comprehensive testing and deployment to testnet', complete: false },
          ]
        }
      ];
      
      const randomProject = mockProjects[Math.floor(Math.random() * mockProjects.length)];
      return {
        title: randomProject.title,
        description: randomProject.description,
        milestones: randomProject.milestones
      };
    }

    // Real LLM project generation
    const system = `You are an expert project generator for blockchain development learning. Create a complete project plan tailored for coding bootcamp students and self-taught developers.

Generate a project that:
- Is achievable in 2-4 weeks
- Teaches real blockchain/Web3 skills
- Has 6 specific, actionable milestones
- Includes smart contract development
- Has a clear portfolio value
- Is beginner-friendly but impressive

Return JSON format:
{
  "title": "Project Name",
  "description": "Brief project description",
  "milestones": [
    {
      "title": "Milestone title",
      "description": "What the user will learn/do",
      "complete": false
    }
  ]
}`;

    const user = `Generate a ${generateNew ? 'completely new and different' : 'tailored'} blockchain project for ${experience} developers. ${goal ? `Focus on: ${goal}` : 'Choose an engaging project that teaches valuable skills.'} ${generateNew ? 'Make it unique and different from common projects like voting apps, NFT marketplaces, or DeFi protocols.' : ''}`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: generateNew ? 1.0 : 0.8 // Maximum creativity for new projects, moderate for tailored
    });
    
    const text = response.choices?.[0]?.message?.content || '{}';
    let json;
    try { 
      json = JSON.parse(text);
      // Ensure milestones have complete property
      if (json.milestones) {
        json.milestones = json.milestones.map(m => ({ ...m, complete: false }));
      }
    } catch { 
      json = { 
        title: 'Blockchain Learning Project',
        description: 'A comprehensive blockchain development project',
        milestones: [] 
      }; 
    }
    
    return json;
  } catch (err) {
    reply.code(500);
    return { error: 'Plan error', detail: String(err) };
  }
});

// Export README from template
fastify.post('/export/readme', async (req, reply) => {
  try {
    const payload = req.body || {};
    const content = renderTemplate(templates.readme, payload);
    return { content };
  } catch (err) {
    reply.code(500);
    return { error: 'Export README error', detail: String(err) };
  }
});

// Export LinkedIn post from template
fastify.post('/export/linkedin', async (req, reply) => {
  try {
    const payload = req.body || {};
    const content = renderTemplate(templates.linkedin, payload);
    return { content };
  } catch (err) {
    reply.code(500);
    return { error: 'Export LinkedIn error', detail: String(err) };
  }
});

const port = Number(process.env.PORT || 3001);
fastify.listen({ port, host: '0.0.0.0' }).then(() => {
  console.log(`API on ${port}`);
});
