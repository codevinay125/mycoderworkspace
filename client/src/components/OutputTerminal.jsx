import React, { useState } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Maximize2, 
  Minimize2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OutputTerminal({
  output,
  status,
  executionTime,
  isRunning,
  stdin,
  setStdin,
  onClear,
  onClose
}) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const copyOutput = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success('Console output copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`bg-slate-950 border-l border-slate-800 flex flex-col transition-all duration-200 z-10 ${
        isExpanded ? 'w-full md:w-[600px]' : 'w-full md:w-96'
      }`}
    >
      {/* Console Header */}
      <div className="h-10 bg-slate-900 border-b border-slate-800 px-4 flex items-center justify-between text-xs select-none">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold text-slate-200">Terminal & Output</span>
          {executionTime && (
            <span className="flex items-center space-x-1 text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{executionTime}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {output && (
            <>
              <button
                onClick={copyOutput}
                title="Copy Output"
                className="p-1 hover:text-white text-slate-400 rounded transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={onClear}
                title="Clear Output"
                className="p-1 hover:text-white text-slate-400 rounded transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse width' : 'Expand width'}
            className="p-1 hover:text-white text-slate-400 rounded transition hidden md:inline"
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            title="Close Panel"
            className="p-1 hover:text-rose-400 text-slate-400 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Output Window */}
      <div className="flex-1 p-4 overflow-y-auto font-mono text-xs leading-relaxed">
        {isRunning ? (
          <div className="flex flex-col items-center justify-center h-48 space-y-3 text-slate-400">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <p>Executing code in secure sandbox...</p>
          </div>
        ) : output ? (
          <div>
            <div className="mb-2 flex items-center space-x-2">
              {status === 'error' ? (
                <span className="inline-flex items-center space-x-1 text-rose-400 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Execution Failed</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-emerald-400 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Program Exited (0)</span>
                </span>
              )}
            </div>
            <pre className="whitespace-pre-wrap break-words text-slate-200 selection:bg-indigo-500 selection:text-white">
              {output}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-center text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 opacity-40 text-slate-400" />
            <p>Click "Run" or press Ctrl+Enter to execute the code.</p>
          </div>
        )}
      </div>

      {/* Standard Input (Stdin) Section */}
      <div className="p-3 border-t border-slate-800 bg-slate-900/60">
        <label className="block text-[11px] font-medium text-slate-400 mb-1">
          Standard Input (stdin)
        </label>
        <textarea
          rows={2}
          value={stdin}
          onChange={(e) => setStdin(e.target.value)}
          placeholder="Input data passed to program..."
          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
        />
      </div>
    </div>
  );
}
