import React from 'react';
import { Users, X, Shield, Copy, Check, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersDrawer({
  users,
  myUser,
  roomId,
  language,
  onClose
}) {
  const copyInvite = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomId}`;
    navigator.clipboard.writeText(url);
    toast.success('Room link copied!');
  };

  return (
    <div className="w-full md:w-80 bg-slate-950 border-l border-slate-800 flex flex-col h-full z-10 select-none">
      {/* Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Collaborators</span>
          <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
            {users.length} Online
          </span>
        </div>

        <button
          onClick={onClose}
          title="Close Panel"
          className="p-1 hover:text-rose-400 text-slate-400 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Users List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2">
        {users.map((user) => {
          const isMe = user.socketId === myUser?.socketId;
          return (
            <div
              key={user.socketId}
              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                isMe
                  ? 'bg-slate-900/90 border-indigo-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  style={{ backgroundColor: user.color }}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm ring-2 ring-slate-800"
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="text-xs font-semibold text-white">
                      {user.username}
                    </span>
                    {isMe && (
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded font-medium">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Joined at {user.joinedAt || 'Just now'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Room Details & Share Box */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60 space-y-2.5">
        <div className="text-xs text-slate-400 flex justify-between">
          <span>Active Language:</span>
          <span className="font-semibold text-slate-200 capitalize">{language}</span>
        </div>
        <div className="text-xs text-slate-400 flex justify-between">
          <span>Room Status:</span>
          <span className="text-emerald-400 font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Synced</span>
          </span>
        </div>

        <button
          onClick={copyInvite}
          className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-medium flex items-center justify-center space-x-1.5 transition"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Invite Link</span>
        </button>
      </div>
    </div>
  );
}
