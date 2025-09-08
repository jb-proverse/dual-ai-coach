// Using fetch instead of OpenAI client for better compatibility

module.exports = async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { goal = '', experience = 'beginner', stack = '', generateNew = false } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      // Mock project generation when no API key
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
          ],
          learningGoals: [
            'Master Smart Contract Development',
            'Understand Decentralized Governance',
            'Learn Voting Mechanisms',
            'Build Real-World DApp'
          ],
          skillsToMaster: [
            'Solidity',
            'Web3.js',
            'React',
            'Ethereum',
            'MetaMask'
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
          ],
          learningGoals: [
            'Master NFT Standards',
            'Learn Marketplace Economics',
            'Understand Digital Ownership',
            'Build Real-World DApp'
          ],
          skillsToMaster: [
            'Solidity',
            'IPFS',
            'React',
            'Ethereum',
            'NFT'
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
          ],
          learningGoals: [
            'Understand DeFi Protocols',
            'Learn Yield Farming',
            'Master Liquidity Concepts',
            'Build Real-World DApp'
          ],
          skillsToMaster: [
            'Solidity',
            'DeFi',
            'Web3.js',
            'Ethereum',
            'React'
          ]
        }
      ];
      
      const randomProject = mockProjects[Math.floor(Math.random() * mockProjects.length)];
      return res.status(200).json({
        title: randomProject.title,
        description: randomProject.description,
        milestones: randomProject.milestones,
        learningGoals: randomProject.learningGoals,
        skillsToMaster: randomProject.skillsToMaster
      });
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
  ],
  "learningGoals": [
    "Specific learning objective 1",
    "Specific learning objective 2",
    "Specific learning objective 3",
    "Specific learning objective 4"
  ],
  "skillsToMaster": [
    "Technology/Skill 1",
    "Technology/Skill 2", 
    "Technology/Skill 3",
    "Technology/Skill 4",
    "Technology/Skill 5"
  ]
}`;

    const user = `Generate a ${generateNew ? 'completely new and different' : 'tailored'} blockchain project for ${experience} developers. ${goal ? `Focus on: ${goal}` : 'Choose an engaging project that teaches valuable skills.'} ${generateNew ? 'Make it unique and different from common projects like voting apps, NFT marketplaces, or DeFi protocols.' : ''}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user }
        ],
        temperature: generateNew ? 1.0 : 0.8
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const completion = { choices: data.choices };
    
    const text = completion.choices?.[0]?.message?.content || '{}';
    let json;
    try { 
      json = JSON.parse(text);
      // Ensure milestones have complete property
      if (json.milestones) {
        json.milestones = json.milestones.map(m => ({ ...m, complete: false }));
      }
    } catch (e) {
      console.error('JSON parse error:', e);
      return res.status(500).json({ error: 'Invalid response format' });
    }
    
    res.status(200).json(json);
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'AI service error', 
      detail: error.message,
      hasApiKey: !!process.env.OPENAI_API_KEY,
      apiKeyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      errorType: error.constructor.name,
      stack: error.stack
    });
  }
}
