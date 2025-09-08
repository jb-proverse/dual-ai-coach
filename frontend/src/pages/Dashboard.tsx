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
  
  const total = milestones.length || 0;
  const done = milestones.filter((m: any) => m.complete).length;
  const pct = total ? Math.round((done/total)*100) : 0;

  useEffect(() => {
    // Load current project from localStorage
    const projectData = localStorage.getItem('current_project');
    if (projectData) {
      setCurrentProject(JSON.parse(projectData));
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
          setCurrentProject(JSON.parse(projectData));
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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🚀🧠</span>
            </div>
            <span className="font-bold text-lg">AI Portfolio Companion</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link to="/dashboard" className="text-indigo-600 font-medium">Dashboard</Link>
            <Link to="/chat" className="text-gray-600 hover:text-indigo-600 transition-colors">Chat</Link>
            <button className="px-3 py-1 border rounded hover:bg-gray-50 transition-colors" onClick={async()=>{ if (supabase) await supabase.auth.signOut(); window.location.href = '/'; }}>Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6" role="main" aria-label="Project Dashboard">
        {/* Progress Header Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6" role="region" aria-label="Project Progress">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-lg font-semibold text-gray-800">Overall progress: {pct}%</div>
              <div className="text-sm text-gray-500">{done} of {total} milestones completed</div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleCopyREADME}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
              >
                <span>📄</span>
                <span>Copy README draft</span>
              </button>
              <button 
                onClick={handleCopyLinkedIn}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all duration-200"
              >
                <span>📄</span>
                <span>Copy LinkedIn draft</span>
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
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">2-months</div>
            <div className="text-sm text-gray-500">Timeline</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">4</div>
            <div className="text-sm text-gray-500">Learning Goals</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">5</div>
            <div className="text-sm text-gray-500">Skills</div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Side - Milestones */}
          <div className="flex-1">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🗓️</span>
                <h2 className="text-xl font-semibold text-gray-800">Project Milestones</h2>
              </div>
              <p className="text-gray-600 mb-6">Track your progress step by step.</p>
              <Milestones />
            </div>
          </div>

          {/* Right Side - Learning Goals & Skills */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Learning Goals */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Learning Goals</h3>
              <div className="flex flex-wrap gap-2">
                {['Learn Smart Contracts', 'Master Web3.js', 'Understand Blockchain', 'Build DApps'].map(goal => (
                  <span key={goal} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {goal}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills to Master */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="font-semibold mb-4 text-gray-800">Skills to Master</h3>
              <div className="flex flex-wrap gap-2">
                {['Solidity', 'Web3.js', 'React', 'Ethereum', 'MetaMask'].map(skill => (
                  <span key={skill} className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link 
          to="/chat"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
        >
          <span>💬</span>
          <span>Get AI Coaching Help</span>
        </Link>
      </div>
    </div>
  );
}