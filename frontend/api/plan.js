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
          title: 'Health Tracker Mobile App',
          description: 'A B2C mobile app for tracking fitness goals and health metrics',
          milestones: [
            { title: 'Set up React Native project', description: 'Initialize React Native with navigation and state management', complete: false },
            { title: 'Design user authentication', description: 'Implement secure login and user registration system', complete: false },
            { title: 'Build data tracking features', description: 'Create forms for logging workouts, meals, and health metrics', complete: false },
            { title: 'Add data visualization', description: 'Create charts and graphs to display progress over time', complete: false },
            { title: 'Implement push notifications', description: 'Add reminders and motivational notifications', complete: false },
            { title: 'Deploy and document', description: 'Deploy to app stores and create portfolio documentation', complete: false },
          ],
          learningGoals: [
            'Mobile Development',
            'Data Visualization',
            'User Authentication',
            'App Store Deployment'
          ],
          skillsToMaster: [
            'React Native',
            'Firebase',
            'Chart.js',
            'Push Notifications',
            'App Store'
          ]
        },
        {
          title: 'E-commerce Analytics Dashboard',
          description: 'A B2B web application for analyzing e-commerce performance metrics',
          milestones: [
            { title: 'Set up React dashboard', description: 'Create responsive dashboard layout with routing', complete: false },
            { title: 'Integrate analytics API', description: 'Connect to Google Analytics and e-commerce APIs', complete: false },
            { title: 'Build data processing', description: 'Process and aggregate sales, traffic, and conversion data', complete: false },
            { title: 'Create interactive charts', description: 'Build dynamic charts and tables for data visualization', complete: false },
            { title: 'Add export features', description: 'Implement PDF and CSV export functionality', complete: false },
            { title: 'Deploy and document', description: 'Deploy to production and create portfolio documentation', complete: false },
          ],
          learningGoals: [
            'Data Analytics',
            'API Integration',
            'Dashboard Design',
            'Business Intelligence'
          ],
          skillsToMaster: [
            'React',
            'D3.js',
            'Node.js',
            'MongoDB',
            'AWS'
          ]
        },
        {
          title: 'Social Learning Platform',
          description: 'A B2C web platform for collaborative learning and knowledge sharing',
          milestones: [
            { title: 'Set up full-stack project', description: 'Initialize React frontend and Node.js backend with database', complete: false },
            { title: 'Build user profiles', description: 'Create user registration, profiles, and social features', complete: false },
            { title: 'Implement content creation', description: 'Add tools for creating and sharing educational content', complete: false },
            { title: 'Add collaboration features', description: 'Build commenting, rating, and discussion systems', complete: false },
            { title: 'Create search and discovery', description: 'Implement search functionality and content recommendations', complete: false },
            { title: 'Deploy and document', description: 'Deploy to production and create portfolio documentation', complete: false },
          ],
          learningGoals: [
            'Social Features',
            'Content Management',
            'Search Algorithms',
            'Community Building'
          ],
          skillsToMaster: [
            'React',
            'Node.js',
            'PostgreSQL',
            'Elasticsearch',
            'Docker'
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
    const system = `You are an expert project generator for software development learning. Create diverse, portfolio-worthy projects for coding bootcamp students and self-taught developers.

Generate a project that:
- Is achievable in 2-4 weeks
- Teaches real, marketable skills
- Has 6 specific, actionable milestones
- Has clear portfolio value
- Is beginner-friendly but impressive

DIVERSIFY ACROSS:
- Industries: Healthcare, Finance, E-commerce, Education, Entertainment, Social, Productivity, Gaming, Travel, Food, Real Estate, Fitness, etc.
- Platforms: Web App, Mobile App, Desktop App, API, Chrome Extension, CLI Tool, etc.
- Business Models: B2C (consumer), B2B (business), B2B2C, Marketplace, SaaS, etc.
- Tech Stacks: React, Vue, Angular, Node.js, Python, Java, C#, Go, Rust, etc.

IMPORTANT: Keep learningGoals and skillsToMaster SHORT:
- Learning goals: 1-4 words each (max 25 characters)
- Skills: 1-3 words each (max 20 characters)
- Use concise, impactful phrases
- Examples: "API Development", "Database Design", "User Authentication", "React", "Node.js", "MongoDB"

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
    "Short Goal 1",
    "Short Goal 2",
    "Short Goal 3",
    "Short Goal 4"
  ],
  "skillsToMaster": [
    "Skill 1",
    "Skill 2", 
    "Skill 3",
    "Skill 4",
    "Skill 5"
  ]
}`;

    const user = `Generate a ${generateNew ? 'completely new and different' : 'tailored'} software project for ${experience} developers. ${goal ? `Focus on: ${goal}` : 'Choose a diverse project from different industries, platforms, and business models.'} ${generateNew ? 'Make it unique - avoid common projects like todo apps, weather apps, or basic CRUD apps. Think creatively across industries: healthcare, finance, e-commerce, education, entertainment, social, productivity, gaming, travel, food, real estate, fitness, etc.' : ''}`;
    
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
      console.log('OpenAI response keys:', Object.keys(json));
      
      // Ensure milestones have complete property
      if (json.milestones) {
        json.milestones = json.milestones.map(m => ({ ...m, complete: false }));
      }
      
      // Ensure learning goals and skills exist, provide defaults if missing
      if (!json.learningGoals) {
        json.learningGoals = ['Smart Contracts', 'Web3 Integration', 'DApp Architecture', 'Portfolio Project'];
      }
      if (!json.skillsToMaster) {
        json.skillsToMaster = ['Solidity', 'Web3.js', 'React', 'Ethereum', 'MetaMask'];
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
