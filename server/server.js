import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import vm from 'vm';

const app = express();
const server = http.createServer(app);

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST']
}));
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;

// Vibrant user colors for avatars and cursors
const USER_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const DEFAULT_CODES = {
  javascript: `// Welcome to the Real-Time Coder Workspace!
// Collaborative editing enabled. Changes sync in real-time.

function calculateStats(items) {
  const sum = items.reduce((acc, curr) => acc + curr, 0);
  const avg = sum / items.length;
  return { sum, avg };
}

const numbers = [12, 45, 68, 23, 89, 94];
console.log("Sample numbers:", numbers);
console.log("Stats calculated:", calculateStats(numbers));
`,
  python: `# Welcome to Real-Time Coder Workspace
# Edit together in real-time!

def fibonacci(n):
    sequence = [0, 1]
    while len(sequence) < n:
        sequence.append(sequence[-1] + sequence[-2])
    return sequence

print("First 10 Fibonacci numbers:")
print(fibonacci(10))
`,
  cpp: `#include <iostream>
#include <vector>
#include <numeric>

int main() {
    std::cout << "Real-Time Coder Workspace - C++" << std::endl;
    std::vector<int> data = {10, 20, 30, 40, 50};
    int total = std::accumulate(data.begin(), data.end(), 0);
    std::cout << "Sum of elements: " << total << std::endl;
    return 0;
}
`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Real-Time Coder Workspace - Java");
        String message = "Collaborative coding in real-time!";
        System.out.println(message);
    }
}
`,
  typescript: `// Real-Time Coder Workspace - TypeScript
interface UserSession {
  username: string;
  role: 'editor' | 'viewer';
  joinedAt: Date;
}

const session: UserSession = {
  username: "Developer",
  role: "editor",
  joinedAt: new Date()
};

console.log("Active Session:", session);
`
};

// In-memory store: roomId -> room data
const rooms = new Map();

// Helper to get or create room
function getOrCreateRoom(roomId, initialLanguage = 'javascript') {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, {
      code: DEFAULT_CODES[initialLanguage] || DEFAULT_CODES.javascript,
      language: initialLanguage,
      users: new Map(),
      chat: [],
      createdAt: Date.now()
    });
  }
  return rooms.get(roomId);
}

// REST Endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    activeRooms: rooms.size,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = rooms.get(roomId);
  if (!room) {
    return res.status(404).json({ exists: false });
  }
  res.json({
    exists: true,
    userCount: room.users.size,
    language: room.language
  });
});

// Piston API language mapping
const PISTON_LANGUAGE_MAP = {
  javascript: { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  python: { language: 'python', version: '3.10.0' },
  cpp: { language: 'cpp', version: '10.2.0' },
  c: { language: 'c', version: '10.2.0' },
  java: { language: 'java', version: '15.0.2' },
  go: { language: 'go', version: '1.16.2' },
  rust: { language: 'rust', version: '1.68.2' },
  ruby: { language: 'ruby', version: '3.0.1' },
  php: { language: 'php', version: '8.2.3' }
};

// Code execution endpoint
app.post('/api/execute', async (req, res) => {
  const { language = 'javascript', code, input = '' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'Code string is required' });
  }

  // Fallback / Fast execution for JavaScript in sandboxed Node.js VM
  if (language === 'javascript') {
    try {
      let consoleOutput = [];
      const sandbox = {
        console: {
          log: (...args) => consoleOutput.push(args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          error: (...args) => consoleOutput.push('[ERROR] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          warn: (...args) => consoleOutput.push('[WARN] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
          info: (...args) => consoleOutput.push('[INFO] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ')),
        },
        setTimeout,
        clearTimeout,
        setInterval,
        clearInterval,
        Math,
        Date,
        JSON,
        Array,
        Object,
        String,
        Number,
        Boolean,
        RegExp,
        Map,
        Set
      };

      const context = vm.createContext(sandbox);
      const script = new vm.Script(code);
      const startTime = performance.now();
      const result = script.runInContext(context, { timeout: 3000 });
      const executionTime = (performance.now() - startTime).toFixed(2);

      let outputStr = consoleOutput.join('\n');
      if (!outputStr && result !== undefined) {
        outputStr = typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result);
      }

      return res.json({
        output: outputStr || 'Code executed successfully with no output.',
        executionTime: `${executionTime}ms`,
        status: 'success'
      });
    } catch (vmErr) {
      return res.json({
        output: `Runtime Error:\n${vmErr.message}`,
        status: 'error'
      });
    }
  }

  // For other languages or full standard libraries, try Piston public API
  const pistonConfig = PISTON_LANGUAGE_MAP[language];
  if (pistonConfig) {
    try {
      const response = await fetch('https://emkc.org/api/v2/piston/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: pistonConfig.language,
          version: pistonConfig.version,
          files: [{ content: code }],
          stdin: input
        })
      });

      if (response.ok) {
        const data = await response.json();
        const runOutput = (data.run.stdout || '') + (data.run.stderr ? `\n[Stderr]:\n${data.run.stderr}` : '');
        return res.json({
          output: runOutput.trim() || 'Code executed with no console output.',
          status: data.run.stderr ? 'warning' : 'success'
        });
      }
    } catch (err) {
      console.warn('Piston execution error, falling back:', err.message);
    }
  }

  // If outside sandbox and Piston not reached
  return res.json({
    output: `[Notice] Remote execution server is currently unreachable for ${language}. For instant client-side execution, try JavaScript!`,
    status: 'info'
  });
});

// Socket.io Real-Time Synchronization
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentUser = null;

  // 1. Join room
  socket.on('join-room', ({ roomId, username }) => {
    if (!roomId || !username) return;

    currentRoomId = roomId;
    const room = getOrCreateRoom(roomId);

    // Pick a distinct color based on existing count
    const colorIndex = room.users.size % USER_COLORS.length;
    const color = USER_COLORS[colorIndex];

    currentUser = {
      socketId: socket.id,
      username: username.trim(),
      color,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.users.set(socket.id, currentUser);
    socket.join(roomId);

    const usersList = Array.from(room.users.values());

    // Send initial room snapshot to joining user
    socket.emit('room-state', {
      code: room.code,
      language: room.language,
      users: usersList,
      chat: room.chat.slice(-30),
      myUser: currentUser
    });

    // Notify other users in the room
    socket.to(roomId).emit('user-joined', {
      user: currentUser,
      users: usersList
    });

    console.log(`[Socket] ${currentUser.username} joined room: ${roomId} (${usersList.length} users)`);
  });

  // 2. Real-time code change
  socket.on('code-change', ({ roomId, code }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.code = code;
    // Broadcast changes to everyone else in the room
    socket.to(roomId).emit('code-update', { code });
  });

  // 3. Language switch
  socket.on('language-change', ({ roomId, language }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    room.language = language;
    // If the room code is currently empty or default, update to default code for new language
    if (!room.code.trim() || Object.values(DEFAULT_CODES).some(d => d.trim() === room.code.trim())) {
      room.code = DEFAULT_CODES[language] || '';
    }

    io.to(roomId).emit('language-update', {
      language: room.language,
      code: room.code
    });
  });

  // 4. Cursor position tracking
  socket.on('cursor-change', ({ roomId, cursor }) => {
    if (!currentUser) return;
    socket.to(roomId).emit('cursor-update', {
      socketId: socket.id,
      username: currentUser.username,
      color: currentUser.color,
      cursor
    });
  });

  // 5. Typing indicator
  socket.on('typing', ({ roomId, isTyping }) => {
    if (!currentUser) return;
    socket.to(roomId).emit('user-typing', {
      username: currentUser.username,
      isTyping
    });
  });

  // 6. Live Chat Messages
  socket.on('send-message', ({ roomId, text }) => {
    const room = rooms.get(roomId);
    if (!room || !currentUser || !text.trim()) return;

    const chatMsg = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      username: currentUser.username,
      color: currentUser.color,
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    room.chat.push(chatMsg);
    if (room.chat.length > 50) room.chat.shift();

    io.to(roomId).emit('new-message', chatMsg);
  });

  // 7. Disconnection
  const handleLeave = () => {
    if (!currentRoomId || !currentUser) return;

    const room = rooms.get(currentRoomId);
    if (room) {
      room.users.delete(socket.id);
      const remainingUsers = Array.from(room.users.values());

      socket.to(currentRoomId).emit('user-left', {
        user: currentUser,
        users: remainingUsers
      });

      console.log(`[Socket] ${currentUser.username} left room ${currentRoomId}. (${remainingUsers.length} left)`);

      // If room is empty, preserve code for a while or keep in memory
      if (remainingUsers.length === 0) {
        // Keep code and history so users can reconnect
      }
    }

    socket.leave(currentRoomId);
    currentRoomId = null;
    currentUser = null;
  };

  socket.on('leave-room', handleLeave);
  socket.on('disconnect', handleLeave);
});

server.listen(PORT, () => {
  console.log(`🚀 Real-Time Coder Workspace Server listening on http://localhost:${PORT}`);
});
