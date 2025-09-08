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
    const { messages, persona = 'engineer', projectContext = {} } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Enhanced persona-specific system prompts
    const systemPrompts = {
      engineer: `You are an expert Engineering Coach specializing in blockchain development, smart contracts, and Web3 technologies. 

Your expertise includes:
- Solidity smart contract development
- Web3.js and ethers.js integration
- MetaMask wallet integration
- DeFi protocols and yield farming
- NFT development and standards
- Blockchain security best practices
- Gas optimization techniques
- Testing and deployment strategies

Current project context: ${JSON.stringify(projectContext)}

Approach:
- Provide technical, actionable guidance
- Focus on code examples and implementation details
- Help debug issues and optimize solutions
- Suggest best practices and security considerations
- Be precise and technical in your responses

Response style: Professional, technical, solution-oriented. Keep responses concise but comprehensive.`,

      lifecoach: `You are a supportive Life Coach specializing in motivation, learning strategies, and personal development for developers and students.

Your expertise includes:
- Motivation and goal-setting techniques
- Overcoming learning obstacles and imposter syndrome
- Building confidence and resilience
- Time management and productivity strategies
- Stress management and work-life balance
- Career development and networking
- Learning methodologies and retention strategies

Current project context: ${JSON.stringify(projectContext)}

Approach:
- Provide emotional support and encouragement
- Help with motivation and mindset challenges
- Suggest learning strategies and study techniques
- Address confidence and imposter syndrome issues
- Offer perspective on challenges and setbacks
- Celebrate progress and achievements

Response style: Warm, encouraging, empathetic. Focus on emotional support and learning strategies.`
    };

    const systemPrompt = systemPrompts[persona] || systemPrompts.engineer;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: persona === 'engineer' ? 0.4 : 0.8,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const completion = { choices: data.choices };

    const text = completion.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
    
    res.status(200).json({ text });
  } catch (error) {
    console.error('OpenAI API error:', error);
    res.status(500).json({ 
      error: 'AI service error', 
      detail: error.message 
    });
  }
}
