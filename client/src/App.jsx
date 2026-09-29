import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { socket, connectSocket, disconnectSocket } from './socket';
import Lobby from './components/Lobby';
import Navbar from './components/Navbar';
import CodeEditor from './components/CodeEditor';
import OutputTerminal from './components/OutputTerminal';
import ChatDrawer from './components/ChatDrawer';
import UsersDrawer from './components/UsersDrawer';

export default function App() {
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [username, setUsername] = useState('');
  const [myUser, setMyUser] = useState(null);
  const [users, setUsers] = useState([]);
  
  // Editor state
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [theme, setTheme] = useState('vs-dark');

  // Tabs: 'terminal' | 'chat' | 'users' | null
  const [activeTab, setActiveTab] = useState('terminal');
  const [unreadCount, setUnreadCount] = useState(0);

  // Chat state
  const [messages, setMessages] = useState([]);

  // Terminal / Execution state
  const [output, setOutput] = useState('');
  const [status, setStatus] = useState('idle');
  const [executionTime, setExecutionTime] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [stdin, setStdin] = useState('');

  // Collaborator indicators
  const [remoteCursors, setRemoteCursors] = useState({});
  const [activeTypers, setActiveTypers] = useState([]);

  // Ref to avoid infinite loop when remote changes arrive
  const isIncomingCodeChange = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Handle joining a room from the Lobby
  const handleJoin = ({ roomId, username, language: initialLanguage }) => {
    setRoomId(roomId);
    setUsername(username);
    if (initialLanguage) setLanguage(initialLanguage);

    // Update URL query parameter
    const url = new URL(window.location);
    url.searchParams.set('room', roomId);
    window.history.pushState({}, '', url);

    connectSocket(username, roomId);
    setInRoom(true);
  };

  // Handle leaving the room
  const handleLeave = () => {
    disconnectSocket();
    setInRoom(false);
    setUsers([]);
    setMessages([]);
    setOutput('');
    setMyUser(null);
    setUnreadCount(0);

    // Clear URL query parameter
    const url = new URL(window.location);
    url.searchParams.delete('room');
    window.history.pushState({}, '', url);

    toast('Left the workspace', { icon: '👋' });
  };

  // Socket Event Listeners
  useEffect(() => {
    if (!inRoom) return;

    // 1. Initial Room Snapshot
    const handleRoomState = (data) => {
      isIncomingCodeChange.current = true;
      setCode(data.code || '');
      setLanguage(data.language || 'javascript');
      setUsers(data.users || []);
      setMessages(data.chat || []);
      setMyUser(data.myUser);
      setTimeout(() => {
        isIncomingCodeChange.current = false;
      }, 50);
    };

    // 2. Someone joined
    const handleUserJoined = ({ user, users }) => {
      setUsers(users);
      toast.success(`${user.username} joined the workspace!`, {
        icon: '👋',
        style: { borderRadius: '10px', background: '#1e293b', color: '#fff' }
      });
    };

    // 3. Code update from a peer
    const handleCodeUpdate = ({ code: newCode }) => {
      isIncomingCodeChange.current = true;
      setCode(newCode);
      setTimeout(() => {
        isIncomingCodeChange.current = false;
      }, 50);
    };

    // 4. Language update
    const handleLanguageUpdate = ({ language: newLang, code: newCode }) => {
      setLanguage(newLang);
      if (newCode) {
        isIncomingCodeChange.current = true;
        setCode(newCode);
        setTimeout(() => {
          isIncomingCodeChange.current = false;
        }, 50);
      }
      toast(`Language switched to ${newLang}`, { icon: '🔄' });
    };

    // 5. Chat message
    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (activeTab !== 'chat') {
        setUnreadCount((c) => c + 1);
      }
    };

    // 6. User typing
    const handleUserTyping = ({ username: typer, isTyping }) => {
      setActiveTypers((prev) => {
        if (isTyping && !prev.includes(typer)) return [...prev, typer];
        if (!isTyping) return prev.filter((t) => t !== typer);
        return prev;
      });
    };

    // 7. Someone left
    const handleUserLeft = ({ user, users }) => {
      setUsers(users);
      toast(`${user.username} left the workspace`, {
        icon: '🚪',
        style: { borderRadius: '10px', background: '#1e293b', color: '#fff' }
      });
    };

    // 8. Cursor update
    const handleCursorUpdate = (cursorData) => {
      setRemoteCursors((prev) => ({
        ...prev,
        [cursorData.socketId]: cursorData
      }));
    };

    socket.on('room-state', handleRoomState);
    socket.on('user-joined', handleUserJoined);
    socket.on('code-update', handleCodeUpdate);
    socket.on('language-update', handleLanguageUpdate);
    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('user-left', handleUserLeft);
    socket.on('cursor-update', handleCursorUpdate);

    return () => {
      socket.off('room-state', handleRoomState);
      socket.off('user-joined', handleUserJoined);
      socket.off('code-update', handleCodeUpdate);
      socket.off('language-update', handleLanguageUpdate);
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('user-left', handleUserLeft);
      socket.off('cursor-update', handleCursorUpdate);
    };
  }, [inRoom, activeTab]);

  // Clear unread count when switching to chat
  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
    }
  }, [activeTab]);

  // Code change in local editor -> propagate to peers
  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (!isIncomingCodeChange.current && socket.connected) {
      socket.emit('code-change', { roomId, code: newCode });

      // Emit typing indicator
      socket.emit('typing', { roomId, isTyping: true });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { roomId, isTyping: false });
      }, 1500);
    }
  };

  // Language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (socket.connected) {
      socket.emit('language-change', { roomId, language: newLanguage });
    }
  };

  // Send Chat Message
  const handleSendMessage = (text) => {
    if (socket.connected) {
      socket.emit('send-message', { roomId, text });
    }
  };

  // Execute Code via Backend API
  const handleRunCode = async () => {
    if (!code.trim()) {
      toast.error('Code editor is empty!');
      return;
    }

    setIsRunning(true);
    setStatus('idle');
    setActiveTab('terminal'); // Auto-switch to terminal on run

    const backendUrl = import.meta.env.VITE_BACKEND_URL || 
      (window.location.hostname === 'localhost' ? 'http://localhost:5000' : `${window.location.protocol}//${window.location.hostname}:5000`);

    try {
      const response = await fetch(`${backendUrl}/api/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          code,
          input: stdin
        })
      });

      const data = await response.json();
      if (response.ok) {
        setOutput(data.output || 'Code executed successfully.');
        setStatus(data.status || 'success');
        setExecutionTime(data.executionTime || '');
        if (data.status === 'error') {
          toast.error('Execution encountered an error');
        } else {
          toast.success('Execution completed!');
        }
      } else {
        setOutput(data.error || 'Failed to execute code.');
        setStatus('error');
      }
    } catch (err) {
      setOutput(`Failed to reach code execution server: ${err.message}`);
      setStatus('error');
      toast.error('Execution server unreachable');
    } finally {
      setIsRunning(false);
    }
  };

  if (!inRoom) {
    return (
      <>
        <Toaster position="top-right" />
        <Lobby onJoin={handleJoin} />
      </>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      <Toaster position="top-right" />

      {/* Top Navigation */}
      <Navbar
        roomId={roomId}
        users={users}
        myUser={myUser}
        language={language}
        onLanguageChange={handleLanguageChange}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
        onRunCode={handleRunCode}
        isRunning={isRunning}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        onLeaveRoom={handleLeave}
      />

      {/* Main Workspace: Editor + Collapsible Sidebar Tabs */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Collaborative Monaco Editor */}
        <CodeEditor
          code={code}
          onChange={handleCodeChange}
          language={language}
          theme={theme}
          onRunCode={handleRunCode}
          remoteCursors={remoteCursors}
          activeTypers={activeTypers}
        />

        {/* Dynamic Side Drawers */}
        {activeTab === 'terminal' && (
          <OutputTerminal
            output={output}
            status={status}
            executionTime={executionTime}
            isRunning={isRunning}
            stdin={stdin}
            setStdin={setStdin}
            onClear={() => setOutput('')}
            onClose={() => setActiveTab(null)}
          />
        )}

        {activeTab === 'chat' && (
          <ChatDrawer
            messages={messages}
            onSendMessage={handleSendMessage}
            myUser={myUser}
            onClose={() => setActiveTab(null)}
            activeTypers={activeTypers}
          />
        )}

        {activeTab === 'users' && (
          <UsersDrawer
            users={users}
            myUser={myUser}
            roomId={roomId}
            language={language}
            onClose={() => setActiveTab(null)}
          />
        )}
      </div>
    </div>
  );
}
