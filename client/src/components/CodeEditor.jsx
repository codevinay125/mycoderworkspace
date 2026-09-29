import React, { useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Download, RefreshCw, FileCode, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CodeEditor({
  code,
  onChange,
  language,
  theme,
  onRunCode,
  remoteCursors,
  activeTypers
}) {
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const decorationsRef = useRef([]);

  // Monaco Mount Handler
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Add keyboard shortcut: Ctrl+Enter (or Cmd+Enter on Mac) to Run Code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRunCode) onRunCode();
    });

    // Focus editor
    editor.focus();
  };

  // Remote cursors / collaborator cursor decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;

    const newDecorations = Object.entries(remoteCursors || {}).map(([socketId, data]) => {
      const { cursor, username, color } = data;
      return {
        range: new monaco.Range(cursor.lineNumber, cursor.column, cursor.lineNumber, cursor.column + 1),
        options: {
          className: `remote-cursor-${socketId}`,
          hoverMessage: { value: `**${username}**` }
        }
      };
    });

    decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecorations);
  }, [remoteCursors]);

  // Download code as a file
  const handleDownload = () => {
    const extMap = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      cpp: 'cpp',
      java: 'java'
    };
    const extension = extMap[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `workspace-code.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded as workspace-code.${extension}`);
  };

  // Format code with Monaco built-in action
  const handleFormatCode = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
      toast.success('Document formatted');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1e1e1e] relative overflow-hidden">
      {/* Editor Sub-header */}
      <div className="h-8 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between text-xs text-slate-400 select-none">
        <div className="flex items-center space-x-2">
          <FileCode className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-mono text-slate-300">
            main.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'typescript' ? 'ts' : 'js'}
          </span>
          {activeTypers && activeTypers.length > 0 && (
            <span className="text-[11px] text-cyan-400 animate-pulse ml-3 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{activeTypers.join(', ')} typing...</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleFormatCode}
            className="hover:text-slate-200 transition flex items-center space-x-1"
            title="Auto-format code"
          >
            <Sparkles className="w-3 h-3" />
            <span className="hidden sm:inline">Format</span>
          </button>

          <button
            onClick={handleDownload}
            className="hover:text-slate-200 transition flex items-center space-x-1"
            title="Download code to disk"
          >
            <Download className="w-3 h-3" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div className="flex-1 relative w-full h-[calc(100%-2rem)]">
        <Editor
          height="100%"
          width="100%"
          language={language}
          value={code}
          theme={theme}
          onChange={(value) => onChange(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
            fontLigatures: true,
            minimap: { enabled: true, scale: 0.8 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            padding: { top: 12, bottom: 12 },
            tabSize: 2
          }}
          loading={
            <div className="flex items-center justify-center h-full text-slate-400 space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>Loading Monaco Editor...</span>
            </div>
          }
        />
      </div>
    </div>
  );
}
