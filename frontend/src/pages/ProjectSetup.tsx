import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { generateProject } from '../lib/api';

export default function ProjectSetup(){
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [currentProject, setCurrentProject] = useState({
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
  });

  useEffect(() => {
    // Save the default project to localStorage immediately
    localStorage.setItem('current_project', JSON.stringify(currentProject));
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (cooldownTime > 0) {
      const timer = setTimeout(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldownTime]);

  const loadNewProject = async (isUserInitiated = false) => {
    const now = Date.now();
    
    // 10-second cooldown for user-initiated refreshes
    if (isUserInitiated && now - lastRefreshTime < 10000) {
      console.log('Cooldown active: Please wait before refreshing again');
      return;
    }
    
    // Usage limiting: Prevent excessive API calls (max 10 refreshes per session)
    if (isUserInitiated && refreshCount >= 10) {
      console.log('Usage limit reached: Maximum 10 project refreshes per session');
      return;
    }
    
    setLoading(true);
    
    if (isUserInitiated) {
      setLastRefreshTime(now);
      setRefreshCount(prev => prev + 1);
      setCooldownTime(10); // Start 10-second countdown
    }
    
    try {
      // Always generate new project when refresh is clicked
      const project = await generateProject(true); 
      if (project.title && project.description && project.milestones) {
        setCurrentProject({
          title: project.title,
          description: project.description,
          milestones: project.milestones,
          learningGoals: project.learningGoals || ['Master Blockchain Development', 'Learn Smart Contract Design', 'Understand DApp Architecture', 'Build Real-World Project'],
          skillsToMaster: project.skillsToMaster || ['Solidity', 'Web3.js', 'React', 'Ethereum', 'MetaMask']
        });
        // Store the new project in localStorage so dashboard can access it
        localStorage.setItem('current_project', JSON.stringify({
          ...project,
          learningGoals: project.learningGoals || ['Master Blockchain Development', 'Learn Smart Contract Design', 'Understand DApp Architecture', 'Build Real-World Project'],
          skillsToMaster: project.skillsToMaster || ['Solidity', 'Web3.js', 'React', 'Ethereum', 'MetaMask']
        }));
        localStorage.setItem('milestones', JSON.stringify(project.milestones));
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
    setLoading(false);
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    
    // Store project in localStorage
    const projectData = {
      ...currentProject,
      category: 'blockchain',
      timeline: '2-4 weeks',
      createdAt: new Date().toISOString(),
      progress: 0
    };
    
    localStorage.setItem('current_project', JSON.stringify(projectData));
    localStorage.setItem('milestones', JSON.stringify(currentProject.milestones));
    
    // Navigate to dashboard
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
      {/* Header */}
      <nav className="bg-white border-b sticky top-0 z-10 mb-8">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🚀🧠</span>
            </div>
            <span className="font-bold text-lg">AI Portfolio Companion</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-indigo-600 font-medium">Dashboard</Link>
            <Link to="/chat" className="text-gray-600 hover:text-indigo-600">Chat</Link>
            <button className="px-3 py-1 border rounded hover:bg-gray-50">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-600 mb-4">What do you want to build while you learn?</h1>
          <p className="text-lg text-gray-600">We'll turn this into a structured, motivational project plan.</p>
        </div>

        {/* Dynamic Project Option */}
        <div className="mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentProject.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{currentProject.description}</p>
                <div className="text-xs text-gray-500 mb-4">
                  <strong>Milestones:</strong> {currentProject.milestones?.length || 0} steps to completion
                </div>
              </div>
              <button
                onClick={() => loadNewProject(true)}
                disabled={loading}
                className="ml-4 p-2 text-gray-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
                title="Generate new project"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            {/* Milestone Preview */}
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-500 mb-2">Project Milestones:</div>
              <div className="space-y-1">
                {currentProject.milestones?.slice(0, 3).map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-4 h-4 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span>{milestone.title}</span>
                  </div>
                ))}
                {currentProject.milestones?.length > 3 && (
                  <div className="text-xs text-gray-400 ml-6">
                    +{currentProject.milestones.length - 3} more milestones
                  </div>
                )}
              </div>
            </div>
            
            {/* Usage Info */}
            {refreshCount > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-700">
                  <strong>Project refreshes used:</strong> {refreshCount}/10
                  {refreshCount >= 8 && (
                    <span className="ml-2 text-orange-600">⚠️ Approaching limit</span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-white border-2 border-gray-200 text-gray-600 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all duration-200 disabled:opacity-50"
                onClick={() => loadNewProject(true)}
                disabled={loading || refreshCount >= 10 || cooldownTime > 0}
                title={
                  refreshCount >= 10 ? "Maximum refreshes reached for this session" : 
                  cooldownTime > 0 ? `Please wait ${cooldownTime}s before refreshing again` :
                  "Generate a new random project"
                }
              >
                {loading ? 'Generating...' : 
                 refreshCount >= 10 ? '🚫 Limit Reached' : 
                 cooldownTime > 0 ? `⏳ Wait ${cooldownTime}s` : 
                 '🔄 Generate New Project'}
              </button>
              <button 
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
                onClick={handleGeneratePlan}
                disabled={loading}
              >
                {loading ? 'Starting Project...' : '✅ Start This Project'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
