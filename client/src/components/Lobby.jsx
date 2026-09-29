import React, { useState, useEffect } from 'react';
import { 
  Code2, 
  Users, 
  Sparkles, 
  Terminal, 
  MessageSquare, 
  ArrowRight, 
  Copy, 
  Check, 
  Globe2,
  Zap,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Lobby({ onJoin }) {
  const [mode, setMode] = useState('create'); // 'create' | 'join'
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [language, setLanguage] = useState('javascript');

  useEffect(() => {
    // Check if room ID exists in URL search params (e.g. ?room=xyz)
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setRoomId(roomParam);
      setMode('join');
    }

    // Retrieve saved username if available
    const savedUser = localStorage.getItem('coderspace_username');
    if (savedUser) {
      setUsername(savedUser);
    }
  }, []);

  const generateRandomRoomId = () => {
    const adj = ['hyper', 'cyber', 'swift', 'cloud', 'nexus', 'pulse', 'quantum', 'algo', 'syntax'];
    const noun = ['room', 'space', 'node', 'core', 'lab', 'dev', 'code', 'hub'];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const randomAdj = adj[Math.floor(Math.random() * adj.length)];
    const randomNoun = noun[Math.floor(Math.random() * noun.length)];
    const newId = `${randomAdj}-${randomNoun}-${randomNum}`;
    setRoomId(newId);
    toast.success('Generated new unique Room ID!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Please enter your display name');
      return;
    }
    if (!roomId.trim()) {
      toast.error('Please enter or generate a Room ID');
      return;
    }

    // Save username for future visits
    localStorage.setItem('coderspace_username', username.trim());

    // Trigger join in parent
    onJoin({
      username: username.trim(),
      roomId: roomId.trim().toLowerCase(),
      language
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-y-auto selection:bg-indigo-500 selection:text-white">
      {/* Background ambient decorative glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Header */}
      <header className="px-6 py-6 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Real-Time Coder Workspace
            </h1>
            <p className="text-xs text-slate-400">Live Pair-Programming & Collaboration</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-4 text-xs text-slate-400">
          <span className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Socket.io Server Online</span>
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 z-10">
        
        {/* Left Column: Hero & Key Features */}
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Powered by React 19, Node.js & WebSockets</span>
          </div>

          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Code Together in Real Time, <br />
            <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-teal-300 bg-clip-text text-transparent">
              Zero Delay, Pure Flow.
            </span>
          </h2>

          <p className="text-slate-400 text-base max-w-xl">
            Create or join a shared collaborative workspace in seconds. Write code simultaneously, run snippets in a live sandbox, chat with peers, and inspect outputs in real time.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 pt-4 text-left max-w-lg">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-1">
                <Zap className="w-4 h-4" />
                <span>Live Synchronization</span>
              </div>
              <p className="text-xs text-slate-400">Low-latency bi-directional code streaming using WebSockets.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center space-x-2 text-cyan-400 font-semibold text-sm mb-1">
                <Users className="w-4 h-4" />
                <span>Peer Presence</span>
              </div>
              <p className="text-xs text-slate-400">See who is in the room, active cursor positions, and avatars.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center space-x-2 text-teal-400 font-semibold text-sm mb-1">
                <Terminal className="w-4 h-4" />
                <span>Code Execution</span>
              </div>
              <p className="text-xs text-slate-400">Run code in a sandboxed runner with stdout and execution time.</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition">
              <div className="flex items-center space-x-2 text-pink-400 font-semibold text-sm mb-1">
                <MessageSquare className="w-4 h-4" />
                <span>In-Room Chat</span>
              </div>
              <p className="text-xs text-slate-400">Instant messaging with collaborators alongside your editor.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Card */}
        <div className="w-full max-w-md">
          <div className="bg-slate-900/90 border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8 backdrop-blur-xl relative">
            
            {/* Mode Switcher Tabs */}
            <div className="flex p-1 bg-slate-950/80 rounded-xl mb-6 border border-slate-800/80">
              <button
                type="button"
                onClick={() => setMode('create')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'create'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create Room
              </button>
              <button
                type="button"
                onClick={() => setMode('join')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                  mode === 'join'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Join Existing
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Display Name Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Your Display Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice, Bob, Alex"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Room ID Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-medium text-slate-300">
                    Room ID
                  </label>
                  {mode === 'create' && (
                    <button
                      type="button"
                      onClick={generateRandomRoomId}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Random ID</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder={mode === 'create' ? "Click 'Random ID' or type name" : "Paste Room ID"}
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Language selection on create */}
              {mode === 'create' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Starter Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python 3</option>
                    <option value="cpp">C++ (GCC)</option>
                    <option value="java">Java</option>
                  </select>
                </div>
              )}

              {/* Action Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-medium rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all transform active:scale-[0.98]"
              >
                <span>{mode === 'create' ? 'Launch Workspace' : 'Enter Workspace'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Demo Help */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-500">
                Want to test with two people? Open this app in an incognito window or another browser tab and join the same Room ID!
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
        Real-Time Coder Workspace &copy; {new Date().getFullYear()} &bull; React.js &bull; Node.js &bull; Express.js &bull; Socket.io
      </footer>
    </div>
  );
}
