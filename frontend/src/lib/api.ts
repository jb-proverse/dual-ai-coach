export type Role = 'user' | 'assistant' | 'system';

export async function generateProject(generateNew: boolean = false): Promise<{ title?: string; description?: string; milestones?: any[]; learningGoals?: string[]; skillsToMaster?: string[]; error?: string }> {
  // Always use real API in production (Vercel), mocks only in localhost development
  const useMocks = window.location.hostname === 'localhost' && (String(import.meta.env.VITE_USE_MOCKS || '').toLowerCase() === 'true' || !import.meta.env.VITE_API_BASE);
  if (useMocks) {
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
    return randomProject;
  }
  
  try {
    // Use Vercel API endpoints in production, localhost in development
    const base = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api');
    const res = await fetch(`${base}/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ generateNew })
    });
    if (!res.ok) {
      const msg = await res.text().catch(() => '');
      return { error: `API ${res.status}: ${msg}` };
    }
    return res.json();
  } catch (e: any) {
    return { error: `Network error: ${e.message}` };
  }
}

export async function sendChat(
  persona: 'engineer' | 'life',
  messages: { role: Role; content: string }[],
  projectContext: Record<string, unknown>
): Promise<{ text?: string; error?: string }>{
  // Always use real API in production (Vercel), mocks only in localhost development
  const useMocks = window.location.hostname === 'localhost' && (String(import.meta.env.VITE_USE_MOCKS || '').toLowerCase() === 'true' || !import.meta.env.VITE_API_BASE);
  if (useMocks) {
    // Simple mock responses when no API key is available
    // const lastMessage = messages[messages.length - 1]?.content || '';
    return {
      text: persona === 'engineer'
        ? `I'm your Engineering Coach! 🚀\n\nI can help you with:\n• Smart contract development\n• Web3.js integration\n• MetaMask connection\n• Remix IDE deployment\n• Debugging and troubleshooting\n\nWhat technical challenge are you facing?`
        : `Hi there! I'm your Life Coach! 🧠\n\nI'm here to help with:\n• Motivation and encouragement\n• Managing overwhelm and stress\n• Building confidence\n• Staying consistent\n• Celebrating your progress\n\nHow are you feeling about your project today?`
    };
  }
  try {
    // Use Vercel API endpoints in production, localhost in development
    const base = import.meta.env.VITE_API_BASE || (window.location.hostname === 'localhost' ? 'http://localhost:3001' : '/api');
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
  } catch (e:any) {
    // Network fallback
    const last = messages[messages.length - 1]?.content || '';
    return {
      text: persona === 'engineer'
        ? `Plan: break it down into 3 steps.\n1) Initialize project\n2) Build MVP\n3) Ship and document.\nNext action: ${last ? 'Address: ' + last.slice(0, 100) : 'Define your first milestone.'}`
        : 'I hear you. Take a breath. One tiny step: write for 5 minutes about why this matters.'
    };
  }
}
