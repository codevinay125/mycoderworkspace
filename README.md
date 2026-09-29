# 🚀 Real-Time Collaborative Coder Workspace

A modern, high-performance real-time collaborative coding workspace built with **React.js**, **Node.js**, **Express.js**, and **Socket.io**. It enables multiple developers to write, edit, synchronize, and execute code together in shared rooms with zero delay.

---

## ✨ Features

- ⚡ **Real-Time Code Synchronization**: Low-latency bi-directional synchronization of code changes across all connected peers using WebSockets (Socket.io).
- 🚪 **Room Management**: Instant room creation with auto-generated unique IDs or custom names, direct shareable URL invite links (`?room=<roomId>`), and seamless joining.
- 👥 **Multi-User Presence & Avatars**: Dynamic collaborator indicators, distinct color badges, online user counts, and peer connection/disconnection notifications.
- 🎨 **VS Code-Grade Editor**: Powered by **Monaco Editor** with syntax highlighting, automatic indentation, code formatting, line numbers, and minimap.
- 🌐 **Multi-Language Support**: Seamlessly switch between **JavaScript (Node.js)**, **TypeScript**, **Python 3**, **C++ (GCC)**, and **Java**.
- 🚀 **Interactive Code Execution & Sandbox**:
  - Sandboxed execution for JavaScript with execution timer, stdout, stderr, and error handling.
  - Multi-language remote execution engine via Piston API with standard input (stdin) support.
- 💬 **In-Room Live Developer Chat**: Real-time side-drawer chat for brainstorming with peer collaborators with timestamped messages and typing indicators.
- 🌓 **Themes & Utilities**: Switch between Dark (`vs-dark`) and Light themes, format code, and download the current file to disk.

---

## 🛠️ Tech Stack

### Frontend:
- **React 19** with **Vite**
- **Monaco Editor** (`@monaco-editor/react`)
- **Socket.io Client** (`socket.io-client`)
- **Tailwind CSS v4** (`@tailwindcss/vite`)
- **Lucide Icons** (`lucide-react`)
- **React Hot Toast** (`react-hot-toast`)

### Backend:
- **Node.js** (v20+)
- **Express.js** (REST API endpoints & healthchecks)
- **Socket.io** (WebSocket server for room management & real-time events)
- **Node.js VM Sandbox** (Safe local JS execution) & Piston API integration
- **CORS**

---

## 📁 Project Structure

```
mycoderworkspace/
├── client/                     # React Frontend Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Lobby.jsx         # Landing page with Room Creation & Join UI
│   │   │   ├── Navbar.jsx        # Navigation, room controls, run button, avatars
│   │   │   ├── CodeEditor.jsx    # Monaco Editor with live sync & download
│   │   │   ├── OutputTerminal.jsx# Terminal execution console & stdin
│   │   │   ├── ChatDrawer.jsx    # In-room live chat with typing indicators
│   │   │   └── UsersDrawer.jsx   # Collaborators drawer & invite link generator
│   │   ├── App.jsx               # Main state & Socket.io event listeners
│   │   ├── socket.js             # Socket client connection manager
│   │   ├── index.css             # Tailwind v4 styles & custom scrollbars
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                     # Node.js + Express + Socket.io Server
│   ├── server.js                 # WebSocket event handlers, room state & code runner
│   └── package.json
│
├── package.json                # Root package manager scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Install Dependencies

You can install all dependencies from the root directory:
```bash
npm run install:all
```
*(Or install manually in both folders)*:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Start the Backend Server

```bash
cd server
npm start
```
The Socket.io & Express server will start on: **`http://localhost:5000`**

### 3. Start the Frontend Client

In a new terminal window:
```bash
cd client
npm run dev
```
The React app will be live at: **`http://localhost:5173`**

---

## 🧪 Testing Real-Time Collaboration

1. Open `http://localhost:5173` in your browser.
2. Enter your name (e.g., *Alice*) and click **"Launch Workspace"** to create a room.
3. Copy the Room ID or invite link from the top navigation bar.
4. Open an **Incognito Window** or another browser tab and navigate to `http://localhost:5173`.
5. Enter a different name (e.g., *Bob*) and join the same Room ID.
6. **Watch the magic**: As either user edits code, changes synchronize instantly with zero lag. You can also send messages in the chat drawer and run code directly in the terminal!
