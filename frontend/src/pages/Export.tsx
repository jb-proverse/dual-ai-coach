import { Link } from 'react-router-dom';
import { useMemo, useState, useEffect } from 'react';
import { useToast } from '../components/Toast';
import Navbar from '../components/Navbar';

export default function ExportPage(){
  const { showToast, ToastContainer } = useToast();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  
  useEffect(() => {
    // Load milestones from localStorage
    try {
      const savedMilestones = localStorage.getItem('milestones');
      if (savedMilestones) {
        setMilestones(JSON.parse(savedMilestones));
      }
    } catch {
      // ignore
    }

    // Load project from localStorage
    try {
      const projectData = localStorage.getItem('current_project');
      if (projectData) {
        setProject(JSON.parse(projectData));
      }
    } catch {
      // ignore
    }
  }, []);
  
  const payload = useMemo(()=>{
    const completedMilestones = milestones.filter(m => m.complete);
    const totalMilestones = milestones.length;
    const progress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;
    
    return { 
      milestones, 
      completedMilestones, 
      totalMilestones, 
      progress,
      project: project || { title: 'Decentralized Voting App', description: 'A blockchain learning project' }
    };
  }, [milestones, project]);

  const readme = useMemo(() => {
    const { project, completedMilestones, totalMilestones, progress } = payload;
    
    const completedList = completedMilestones.map(m => `- ✅ ${m.title}`).join('\n');
    const remainingList = milestones.filter(m => !m.complete).map(m => `- ⏳ ${m.title}`).join('\n');
    
    // Get reflections for completed milestones
    const reflections = completedMilestones.map((m) => {
      try {
        const reflection = localStorage.getItem(`reflection-${milestones.indexOf(m)}`);
        return reflection ? `**${m.title}**: ${reflection}` : null;
      } catch {
        return null;
      }
    }).filter(Boolean).join('\n\n');

    return `# ${project.title} 🗳️

${project.description}

## Progress
${progress}% complete (${completedMilestones.length}/${totalMilestones} milestones)

## Completed Milestones
${completedList}

${remainingList ? `## Remaining Milestones\n${remainingList}` : ''}

## What I Learned
${reflections || '- How smart contracts work\n- How to deploy and interact with them\n- How to connect a React frontend to a contract'}

## Built With
- Solidity
- Remix IDE  
- Web3.js
- React
- MetaMask

## Next Steps
- Add authentication
- Improve UI
- Deploy to mainnet

![Screenshot](screenshot.png)`;
  }, [payload, milestones]);

  const linkedin = useMemo(() => {
    const { project, completedMilestones, totalMilestones, progress } = payload;
    
    const completedCount = completedMilestones.length;
    const totalCount = totalMilestones;
    
    // Get reflections for completed milestones
    const reflections = completedMilestones.slice(0, 3).map((m) => {
      try {
        const reflection = localStorage.getItem(`reflection-${milestones.indexOf(m)}`);
        return reflection ? `• ${reflection}` : `• Completed ${m.title}`;
      } catch {
        return `• Completed ${m.title}`;
      }
    }).join('\n');

    return `I just finished building ${project.title.toLowerCase()}! 🚀

Completed ${completedCount}/${totalCount} milestones (${progress}% done).

Here's what I learned:
${reflections}

This project taught me:
• How smart contracts work in practice
• How to deploy and interact with them  
• How to connect a React frontend to a contract

Next, I want to:
• Add authentication
• Improve the UI
• Deploy to mainnet

#100Devs #Web3 #ProjectBasedLearning #Blockchain #Solidity`;
  }, [payload, milestones]);

  const copy = async (text:string) => { 
    try { 
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <ToastContainer />
      {/* Header */}
      <Navbar showExport={true} />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Celebration Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉✨🚀</div>
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">You did it! Here's what you built.</h1>
          <p className="text-lg text-gray-600">Export and share your project with the world.</p>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-1">{payload.progress}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="text-3xl font-bold text-purple-600 mb-1">{payload.completedMilestones.length}/{payload.totalMilestones}</div>
            <div className="text-sm text-gray-500">Milestones</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
            <div className="text-3xl font-bold text-green-600 mb-1">{payload.completedMilestones.length > 0 ? '⭐' : '🎯'}</div>
            <div className="text-sm text-gray-500">Achievement</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* README Preview */}
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📄</span>
              <span>README Draft</span>
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm font-mono max-h-48 overflow-y-auto">
              <div className="text-gray-800 font-semibold"># {payload.project.title} 🗳️</div>
              <div className="text-gray-600 mt-2">{payload.project.description}</div>
              <div className="text-gray-600 mt-3 font-semibold">## Progress</div>
              <div className="text-gray-500 mt-1">{payload.progress}% complete ({payload.completedMilestones.length}/{payload.totalMilestones} milestones)</div>
              <div className="text-gray-600 mt-3 font-semibold">## Completed Milestones</div>
              {payload.completedMilestones.map((m:any, i:number)=>(
                <div key={i} className="text-gray-500 mt-1">- ✅ {m.title}</div>
              ))}
              {milestones.filter(m => !m.complete).length > 0 && (
                <>
                  <div className="text-gray-600 mt-3 font-semibold">## Remaining Milestones</div>
                  {milestones.filter(m => !m.complete).map((m:any, i:number)=>(
                    <div key={i} className="text-gray-500 mt-1">- ⏳ {m.title}</div>
                  ))}
                </>
              )}
            </div>
            <button 
              onClick={()=>copy(readme)} 
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📄 Copy README
            </button>
          </div>

          {/* LinkedIn Post */}
          <div className="bg-white border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🔗</span>
              <span>LinkedIn Post</span>
            </h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm max-h-48 overflow-y-auto">
              <div className="text-gray-800 font-semibold">I just finished building {payload.project.title.toLowerCase()}! 🚀</div>
              <div className="text-gray-600 mt-2">Completed {payload.completedMilestones.length}/{payload.totalMilestones} milestones ({payload.progress}% done).</div>
              <div className="text-gray-600 mt-3 font-semibold">Here's what I learned:</div>
              {payload.completedMilestones.slice(0, 3).map((m:any, i:number)=> {
                try {
                  const reflection = localStorage.getItem(`reflection-${milestones.indexOf(m)}`);
                  return (
                    <div key={i} className="text-gray-500 mt-1">
                      • {reflection || `Completed ${m.title}`}
                    </div>
                  );
                } catch {
                  return (
                    <div key={i} className="text-gray-500 mt-1">
                      • Completed {m.title}
                    </div>
                  );
                }
              })}
              <div className="text-gray-600 mt-3 font-semibold">This project taught me:</div>
              <div className="text-gray-500 mt-1">• How smart contracts work in practice</div>
              <div className="text-gray-500">• How to deploy and interact with them</div>
              <div className="text-gray-500">• How to connect a React frontend to a contract</div>
              <div className="text-gray-600 mt-3 font-semibold">Next, I want to:</div>
              <div className="text-gray-500 mt-1">• Add authentication</div>
              <div className="text-gray-500">• Improve the UI</div>
              <div className="text-gray-500">• Deploy to mainnet</div>
              <div className="text-gray-600 mt-3">#100Devs #Web3 #ProjectBasedLearning #Blockchain #Solidity</div>
            </div>
            <button 
              onClick={()=>copy(linkedin)} 
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              🔗 Copy LinkedIn Post
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/dashboard" className="px-6 py-3 bg-white border border-indigo-200 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-200">
              ← Back to Tracker
            </Link>
            <Link to="/chat" className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
              💬 Continue Chatting
            </Link>
            <Link to="/setup" className="px-6 py-3 bg-gray-100 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-200 transition-all duration-200">
              🔄 Start New Project
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}