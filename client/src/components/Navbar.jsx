import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Play, 
  Users, 
  MessageSquare, 
  Terminal, 
  LogOut, 
  Sun, 
  Moon,
  Share2,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar({
  roomId,
  users,
  myUser,
  language,
  onLanguageChange,
  theme,
  onThemeToggle,
  onRunCode,
  isRunning,
  activeTab,
  setActiveTab,
  unreadCount,
  onLeaveRoom
}) {
  const [copied, setCopied] = useState(false);

  const copyRoomLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Room invite link copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast.success('Room ID copied!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between z-20 select-none">
      {/* Left: Branding & Room Info */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-gradient-to-tr from-indigo-600 to-cyan-500 rounded-lg text-white shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <span className="font-bold text-sm tracking-tight text-white hidden md:inline">
            CoderWorkspace
          </span>
        </div>

        <div className="h-4 w-px bg-slate-700 hidden sm:block" />

        {/* Room ID Tag */}
        <div className="flex items-center space-x-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1 text-xs">
          <span className="text-slate-400">Room:</span>
          <span className="font-mono font-semibold text-indigo-300 max-w-[120px] truncate sm:max-w-none">
            {roomId}
          </span>
          <button
            onClick={copyRoomId}
            title="Copy Room ID"
            className="p-1 hover:text-white text-slate-400 rounded transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={copyRoomLink}
            title="Copy Invite URL"
            className="p-1 hover:text-white text-slate-400 rounded transition hidden sm:inline"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center: Language & Controls */}
      <div className="flex items-center space-x-3">
        {/* Language Selector */}
        <div className="relative">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="appearance-none bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-lg px-3 py-1.5 pr-8 text-xs font-medium text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer transition"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onThemeToggle}
          title={`Switch to ${theme === 'vs-dark' ? 'Light' : 'Dark'} Theme`}
          className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg transition"
        >
          {theme === 'vs-dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
        </button>

        {/* Run Code Button */}
        <button
          onClick={onRunCode}
          disabled={isRunning}
          className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
            isRunning
              ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30 active:scale-95'
          }`}
          title="Run Code (Ctrl + Enter)"
        >
          {isRunning ? (
            <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current" />
          )}
          <span>{isRunning ? 'Running...' : 'Run'}</span>
          <span className="hidden lg:inline text-[10px] opacity-75 ml-1 bg-emerald-700/60 px-1 py-0.5 rounded">
            Ctrl+↵
          </span>
        </button>
      </div>

      {/* Right: Active Collaborators, Panel Toggles & Exit */}
      <div className="flex items-center space-x-2">
        {/* Collaborators Avatars */}
        <div className="flex items-center -space-x-1.5 mr-1" title={`${users.length} user(s) online`}>
          {users.slice(0, 4).map((u) => (
            <div
              key={u.socketId}
              style={{ backgroundColor: u.color }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white ring-2 ring-slate-900 shadow-sm transition hover:scale-110"
              title={`${u.username} ${u.socketId === myUser?.socketId ? '(You)' : ''}`}
            >
              {u.username.charAt(0).toUpperCase()}
            </div>
          ))}
          {users.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-slate-700 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-200">
              +{users.length - 4}
            </div>
          )}
        </div>

        {/* Users list toggle */}
        <button
          onClick={() => setActiveTab(activeTab === 'users' ? null : 'users')}
          className={`p-2 rounded-lg text-xs font-medium border transition ${
            activeTab === 'users'
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Collaborators"
        >
          <Users className="w-4 h-4" />
        </button>

        {/* Chat toggle */}
        <button
          onClick={() => setActiveTab(activeTab === 'chat' ? null : 'chat')}
          className={`p-2 rounded-lg text-xs font-medium border relative transition ${
            activeTab === 'chat'
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Live Room Chat"
        >
          <MessageSquare className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-slate-900 animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Console / Terminal toggle */}
        <button
          onClick={() => setActiveTab(activeTab === 'terminal' ? null : 'terminal')}
          className={`p-2 rounded-lg text-xs font-medium border transition ${
            activeTab === 'terminal'
              ? 'bg-indigo-600 border-indigo-500 text-white'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
          }`}
          title="Terminal Output"
        >
          <Terminal className="w-4 h-4" />
        </button>

        {/* Leave Workspace */}
        <button
          onClick={onLeaveRoom}
          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition"
          title="Leave Workspace"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
