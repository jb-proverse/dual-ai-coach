import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login(){
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-indigo-50 to-white text-center px-4">
      <div className="w-full max-w-md flex flex-col items-center space-y-6">
        {/* Logo */}
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4">
          <span className="text-white text-2xl">🚀🧠</span>
        </div>
        
        {/* Main Heading */}
        <div className="text-4xl md:text-5xl font-bold text-indigo-600 leading-tight">
          Turn your learning<br />
          goals into<br />
          portfolio-ready<br />
          projects.
        </div>
        
        {/* Subheading */}
        <div className="text-lg text-gray-600">Built for students who want to finish what they start.</div>
        
        {/* Coach Selection */}
        <div className="flex gap-4 w-full">
          <button className="flex-1 bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition">
            <div className="text-2xl mb-2">👷</div>
            <div className="font-medium">Engineer Coach</div>
          </button>
          <button className="flex-1 bg-white rounded-lg p-4 border shadow-sm hover:shadow-md transition">
            <div className="text-2xl mb-2">🧠</div>
            <div className="font-medium">Life Coach</div>
          </button>
        </div>
        
        {/* Sign In Button */}
        <button
          className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium text-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          onClick={async ()=>{
            if (!supabase) { window.location.href = '/setup'; return; }
            await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin + '/setup' } });
          }}
        >
          <span>🚀🧠</span>
          <span>Sign in with Google</span>
        </button>
        
        {/* Email Option */}
        <div className="text-gray-600">Or sign in with email</div>
        
        {/* Demo Link */}
        <Link to="/setup" className="text-blue-600 underline hover:text-blue-700">Skip to demo</Link>
      </div>
    </div>
  );
}
