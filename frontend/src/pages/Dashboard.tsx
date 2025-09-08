import { Link, useNavigate } from 'react-router-dom';
import Milestones from '../components/Milestones';
import { supabase } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { useToast } from '../components/Toast';

export default function Dashboard(){
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [learningGoals, setLearningGoals] = useState<string[]>([]);
  const [skillsToMaster, setSkillsToMaster] = useState<string[]>([]);
  
  const total = milestones.length || 0;
  const done = milestones.filter((m: any) => m.complete).length;
  const pct = total ? Math.round((done/total)*100) : 0;

  // Generate learning goals and skills based on project
  const generateProjectInsights = (project: any) => {
    if (!project) return { goals: [], skills: [] };

    const title = project.title?.toLowerCase() || '';
    const description = project.description?.toLowerCase() || '';
    const milestones = project.milestones || [];
    
    // Extract skills from project content
    const skillKeywords = {
      'solidity': ['solidity', 'smart contract', 'contract'],
      'web3.js': ['web3', 'web3.js', 'ethereum'],
      'react': ['react', 'frontend', 'ui', 'interface'],
      'javascript': ['javascript', 'js', 'programming'],
      'typescript': ['typescript', 'ts'],
      'node.js': ['node', 'backend', 'server'],
      'html': ['html', 'markup'],
      'css': ['css', 'styling'],
      'blockchain': ['blockchain', 'distributed', 'decentralized'],
      'ethereum': ['ethereum', 'eth'],
      'metamask': ['metamask', 'wallet'],
      'ipfs': ['ipfs', 'storage'],
      'truffle': ['truffle', 'testing'],
      'hardhat': ['hardhat', 'development'],
      'remix': ['remix', 'ide'],
      'defi': ['defi', 'finance', 'yield'],
      'nft': ['nft', 'token'],
      'dao': ['dao', 'governance'],
      'dapp': ['dapp', 'application']
    };

    const detectedSkills: string[] = [];
    const allText = `${title} ${description} ${milestones.map(m => `${m.title} ${m.description}`).join(' ')}`;
    
    Object.entries(skillKeywords).forEach(([skill, keywords]) => {
      if (keywords.some(keyword => allText.includes(keyword))) {
        detectedSkills.push(skill);
      }
    });

    // Generate learning goals based on project type
    const goals: string[] = [];
    if (title.includes('voting') || title.includes('governance')) {
      goals.push('Understand Decentralized Governance', 'Learn Voting Mechanisms', 'Master Smart Contract Security');
    } else if (title.includes('nft') || title.includes('marketplace')) {
      goals.push('Master NFT Standards', 'Learn Marketplace Economics', 'Understand Digital Ownership');
    } else if (title.includes('defi') || title.includes('yield')) {
      goals.push('Understand DeFi Protocols', 'Learn Yield Farming', 'Master Liquidity Concepts');
    } else if (title.includes('charity') || title.includes('donation')) {
      goals.push('Learn Transparency Mechanisms', 'Master Donation Tracking', 'Understand Trust Systems');
    } else {
      goals.push('Master Blockchain Development', 'Learn Smart Contract Design', 'Understand DApp Architecture');
    }

    // Add generic blockchain goals
    goals.push('Build Real-World DApp', 'Deploy to Testnet', 'Create Portfolio Project');

    return {
      goals: goals.slice(0, 4), // Limit to 4 goals
      skills: [...new Set(detectedSkills)].slice(0, 5) // Limit to 5 unique skills
    };
  };

  useEffect(() => {
    // Load current project from localStorage
    const projectData = localStorage.getItem('current_project');
    if (projectData) {
      const project = JSON.parse(projectData);
      setCurrentProject(project);
      
      // Generate learning goals and skills based on project
      const insights = generateProjectInsights(project);
      setLearningGoals(insights.goals);
      setSkillsToMaster(insights.skills);
    } else {
      // If no project, redirect to project setup
      navigate('/setup');
    }

  }, [navigate]);

  // Update milestones from localStorage
  useEffect(() => {
    const loadMilestones = () => {
      try {
        const savedMilestones = localStorage.getItem('milestones');
        if (savedMilestones) {
          const ms = JSON.parse(savedMilestones);
          setMilestones(ms);
        }
      } catch {
        // ignore
      }
    };

    // Load initially
    loadMilestones();

    // Listen for storage changes (when milestones are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'milestones') {
        loadMilestones();
      }
      if (e.key === 'current_project') {
        const projectData = localStorage.getItem('current_project');
        if (projectData) {
          const project = JSON.parse(projectData);
          setCurrentProject(project);
          // Regenerate learning goals and skills based on new project
          const insights = generateProjectInsights(project);
          setLearningGoals(insights.goals);
          setSkillsToMaster(insights.skills);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check periodically for changes within the same tab
    const interval = setInterval(loadMilestones, 1000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  // Auto-navigate to export when all milestones are completed
  useEffect(() => {
    if (milestones.length > 0 && done === total && total > 0) {
      // Small delay to show the completion state briefly
      const timer = setTimeout(() => {
        navigate('/export');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [done, total, milestones.length, navigate]);

  const handleCopyREADME = async () => {
    try {
      const readme = `# ${currentProject?.title || 'My Project'}\n\n## Overview\n${currentProject?.description || 'A learning project'}\n\n## Progress\n${pct}% complete (${done}/${total} milestones)\n\n## Milestones\n${milestones.map(m => `- ${m.title} ${m.complete ? '✅' : '⏳'}`).join('\n')}\n\n## Next Steps\nContinue building and learning!`;
      await navigator.clipboard.writeText(readme);
      showToast('README copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy README', 'error');
    }
  };

  const handleCopyLinkedIn = async () => {
    try {
      const linkedin = `🚀 Just hit ${pct}% completion on my "${currentProject?.title || 'project'}"!\n\nWhat I've built so far:\n${milestones.filter(m => m.complete).map(m => `✅ ${m.title}`).join('\n')}\n\nStill working on:\n${milestones.filter(m => !m.complete).map(m => `⏳ ${m.title}`).join('\n')}\n\n#PortfolioProject #LearningInPublic #WebDevelopment`;
      await navigator.clipboard.writeText(linkedin);
      showToast('LinkedIn post copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy LinkedIn post', 'error');
    }
  };

  if (!currentProject) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      
      {/* Top Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs sm:text-sm">🚀🧠</span>
            </div>
            <span className="font-bold text-sm sm:text-lg hidden xs:block">AI Portfolio Companion</span>
            <span className="font-bold text-sm sm:text-lg xs:hidden">AI Coach</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link to="/dashboard" className="text-indigo-600 font-medium px-1 sm:px-0">Dashboard</Link>
            <Link to="/chat" className="text-gray-600 hover:text-indigo-600 transition-colors px-1 sm:px-0">Chat</Link>
            <button className="px-2 py-1 border rounded hover:bg-gray-50 transition-colors text-xs sm:text-sm" onClick={async()=>{ if (supabase) await supabase.auth.signOut(); window.location.href = '/'; }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6" role="main" aria-label="Project Dashboard">
        {/* Progress Header Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-4 sm:mb-6" role="region" aria-label="Project Progress">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <div>
              <div className="text-lg sm:text-xl font-semibold text-gray-800">Overall progress: {pct}%</div>
              <div className="text-sm text-gray-500">{done} of {total} milestones completed</div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button 
                onClick={handleCopyREADME}
                className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-all duration-200 text-sm"
              >
                <span>📄</span>
                <span className="hidden sm:inline">Copy README draft</span>
                <span className="sm:hidden">README</span>
              </button>
              <button 
                onClick={handleCopyLinkedIn}
                className="px-3 py-2 sm:px-4 sm:py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-all duration-200 text-sm"
              >
                <span>📄</span>
                <span className="hidden sm:inline">Copy LinkedIn draft</span>
                <span className="sm:hidden">LinkedIn</span>
              </button>
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out progress-bar" 
              style={{ width: `${pct}%` }}
              aria-label={`Progress: ${pct}% complete`}
            />
          </div>
          
          {pct > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3" aria-live="polite" aria-atomic="true">
              <p className="text-amber-800 flex items-center gap-2">
                <span>✨</span>
                <span>Amazing work so far!</span>
              </p>
            </div>
          )}
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">2-months</div>
            <div className="text-sm text-gray-500">Timeline</div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-1">{learningGoals.length}</div>
            <div className="text-sm text-gray-500">Learning Goals</div>
          </div>
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-1">{skillsToMaster.length}</div>
            <div className="text-sm text-gray-500">Skills</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Left Side - Milestones */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <span className="text-lg sm:text-xl">🗓️</span>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Project Milestones</h2>
              </div>
              <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Track your progress step by step.</p>
              <Milestones />
            </div>
          </div>

          {/* Right Side - Learning Goals & Skills */}
          <div className="w-full lg:w-80 space-y-4 sm:space-y-6">
            {/* Learning Goals */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-3 sm:mb-4 text-gray-800 text-sm sm:text-base">Learning Goals</h3>
              <div className="flex flex-wrap gap-2">
                {learningGoals.length > 0 ? learningGoals.map(goal => (
                  <span key={goal} className="bg-purple-600 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
                    {goal}
                  </span>
                )) : (
                  <span className="text-gray-500 text-sm">Loading goals...</span>
                )}
              </div>
            </div>

            {/* Skills to Master */}
            <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-3 sm:mb-4 text-gray-800 text-sm sm:text-base">Skills to Master</h3>
              <div className="flex flex-wrap gap-2">
                {skillsToMaster.length > 0 ? skillsToMaster.map(skill => (
                  <span key={skill} className="bg-purple-600 text-white px-2 py-1 sm:px-3 rounded-full text-xs sm:text-sm font-medium">
                    {skill}
                  </span>
                )) : (
                  <span className="text-gray-500 text-sm">Loading skills...</span>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <Link 
          to="/chat"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap text-sm sm:text-base"
        >
          <span>💬</span>
          <span className="hidden sm:inline">Get AI Coaching Help</span>
          <span className="sm:hidden">AI Help</span>
        </Link>
      </div>
    </div>
  );
}