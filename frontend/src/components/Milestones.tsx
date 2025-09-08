import { useState, useEffect } from 'react';
import { useToast } from './Toast';

interface Milestone {
  title: string;
  description?: string;
  acceptance?: string[];
  complete: boolean;
}

export default function Milestones() {
  const [items, setItems] = useState<Milestone[]>([
    { title: 'Research what a smart contract is', description: 'Learn the fundamentals of smart contracts and how they work on Ethereum', complete: false },
    { title: 'Write a basic smart contract in Solidity', description: 'Create your first smart contract using Solidity programming language', complete: false },
    { title: 'Deploy contract using Remix', description: 'Use Remix IDE to compile and deploy your contract to testnet', complete: false },
    { title: 'Build frontend with Web3.js', description: 'Create a React frontend that interacts with your smart contract', complete: false },
    { title: 'Connect frontend to contract', description: 'Integrate MetaMask and enable full DApp functionality', complete: false },
    { title: 'Write README + LinkedIn post', description: 'Document your project and create a professional showcase post', complete: false },
  ]);
  const [reflections, setReflections] = useState<{[key: number]: string}>({});
  const [savedReflections, setSavedReflections] = useState<{[key: number]: boolean}>({});
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const savedItems = localStorage.getItem('milestones');
      if (savedItems) {
        const parsed: Milestone[] = JSON.parse(savedItems);
        if (Array.isArray(parsed)) setItems(parsed);
        else {
          // Prefill default blockchain milestones if none saved
          setItems([
            { title: 'Research what a smart contract is', description: 'Learn the fundamentals of smart contracts and how they work on Ethereum', complete: false },
            { title: 'Write a basic smart contract in Solidity', description: 'Create your first smart contract using Solidity programming language', complete: false },
            { title: 'Deploy contract using Remix', description: 'Use Remix IDE to compile and deploy your contract to testnet', complete: false },
            { title: 'Build frontend with Web3.js', description: 'Create a React frontend that interacts with your smart contract', complete: false },
            { title: 'Connect frontend to contract', description: 'Integrate MetaMask and enable full DApp functionality', complete: false },
            { title: 'Write README + LinkedIn post', description: 'Document your project and create a professional showcase post', complete: false },
          ]);
        }
      } else {
        setItems([
          { title: 'Research what a smart contract is', description: 'Learn the fundamentals of smart contracts and how they work on Ethereum', complete: false },
          { title: 'Write a basic smart contract in Solidity', description: 'Create your first smart contract using Solidity programming language', complete: false },
          { title: 'Deploy contract using Remix', description: 'Use Remix IDE to compile and deploy your contract to testnet', complete: false },
          { title: 'Build frontend with Web3.js', description: 'Create a React frontend that interacts with your smart contract', complete: false },
          { title: 'Connect frontend to contract', description: 'Integrate MetaMask and enable full DApp functionality', complete: false },
          { title: 'Write README + LinkedIn post', description: 'Document your project and create a professional showcase post', complete: false },
        ]);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('milestones', JSON.stringify(items));
  }, [items]);

  // Load reflections from localStorage on mount
  useEffect(() => {
    const loadedReflections: {[key: number]: string} = {};
    const loadedSavedStates: {[key: number]: boolean} = {};
    for (let i = 0; i < items.length; i++) {
      try {
        const saved = localStorage.getItem(`reflection-${i}`);
        if (saved) {
          loadedReflections[i] = saved;
          loadedSavedStates[i] = true; // Mark as saved if it exists in localStorage
        }
      } catch {
        // ignore
      }
    }
    setReflections(loadedReflections);
    setSavedReflections(loadedSavedStates);
  }, []);

  const toggle = (i: number) => {
    const wasCompleted = items[i].complete;
    
    setItems(prev => prev.map((item, idx) => 
      idx === i ? { ...item, complete: !item.complete } : item
    ));
    
    // If milestone is being unchecked, reset its reflection
    if (wasCompleted && !items[i].complete) {
      setReflections(prev => {
        const newReflections = { ...prev };
        delete newReflections[i];
        return newReflections;
      });
      setSavedReflections(prev => {
        const newSavedStates = { ...prev };
        delete newSavedStates[i];
        return newSavedStates;
      });
      // Remove from localStorage
      try {
        localStorage.removeItem(`reflection-${i}`);
        localStorage.removeItem(`reflection-saved-${i}`);
      } catch {
        // ignore
      }
    }
    
    if (!items[i].complete) {
      showToast('Milestone completed! 🎉', 'success');
    }
  };

  const getReflection = (i: number): string => {
    return reflections[i] || '';
  };

  const updateReflection = (i: number, val: string) => {
    setReflections(prev => ({ ...prev, [i]: val }));
  };

  const saveReflection = (i: number) => {
    try {
      const reflection = reflections[i] || '';
      localStorage.setItem(`reflection-${i}`, reflection);
      setSavedReflections(prev => ({ ...prev, [i]: true }));
      showToast('Reflection saved! 💭', 'success');
    } catch {
      showToast('Failed to save reflection', 'error');
    }
  };

  return (
    <div className="mt-4 sm:mt-6">
      {/* Milestone Cards */}
      <div className="space-y-3 sm:space-y-4">
        {items.map((m, i) => (
          <div 
            key={i} 
            id={`milestone-${i}`} 
            className={`bg-white rounded-xl p-4 sm:p-6 border-2 transition-all duration-300 hover:shadow-lg ${
              m.complete 
                ? 'border-green-200 bg-green-50' 
                : 'border-gray-200 hover:border-indigo-200'
            }`}
          >
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Step Number Circle */}
              <div className={`
                w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-200 flex-shrink-0
                ${m.complete ? 'bg-green-500 text-white' : 'bg-indigo-100 text-indigo-600'}
              `}>
                {m.complete ? '✓' : i + 1}
              </div>
              
              {/* Checkbox */}
              <input 
                type="checkbox" 
                checked={!!m.complete} 
                onChange={() => toggle(i)} 
                className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 rounded focus:ring-indigo-500 transition-all duration-200 hover:scale-110 flex-shrink-0 mt-0.5 sm:mt-0"
                aria-describedby={`desc-${i}`}
                aria-label={`Mark "${m.title}" as complete`}
              />
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-2">
                  <h3 className={`font-semibold transition-all duration-200 text-sm sm:text-base ${
                    m.complete ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}>
                    {m.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      m.complete ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      Step {i + 1}
                    </span>
                    {m.complete && <span className="text-green-600">✅</span>}
                  </div>
                </div>
                
                <p 
                  id={`desc-${i}`}
                  className={`text-xs sm:text-sm mb-3 transition-colors ${
                    m.complete ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {m.description || 'Complete this milestone to move forward.'}
                </p>
                
                {!!m.acceptance?.length && (
                  <ul className="list-disc pl-5 text-sm text-gray-700 mb-3">
                    {m.acceptance.map((a, idx) => (
                      <li key={idx}>{a}</li>
                    ))}
                  </ul>
                )}
                
                {/* Reflection Section (shows after completion) */}
                {m.complete && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    {savedReflections[i] ? (
                      // Collapsed state - reflection saved
                      <div className="flex items-center gap-2">
                        <span className="text-green-600">✅</span>
                        <p className="text-sm text-green-700 font-medium">Reflection added</p>
                        <button 
                          onClick={() => setSavedReflections(prev => ({ ...prev, [i]: false }))}
                          className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          Edit
                        </button>
                      </div>
                    ) : (
                      // Expanded state - editing reflection
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-blue-600">📝</span>
                          <p className="text-xs sm:text-sm text-blue-700 font-medium">Add reflection</p>
                        </div>
                        <p className="text-xs sm:text-sm text-blue-600 mb-2">How did this milestone go? What did you learn?</p>
                        <textarea 
                          value={getReflection(i)} 
                          onChange={e => updateReflection(i, e.target.value)}
                          className="w-full p-2 text-xs sm:text-sm border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none" 
                          placeholder="Optional: What challenges did you overcome?" 
                          rows={2}
                        />
                        <button 
                          onClick={() => saveReflection(i)}
                          className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs sm:text-sm rounded hover:bg-orange-600 transition-colors"
                        >
                          Save reflection
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}