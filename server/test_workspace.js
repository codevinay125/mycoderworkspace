import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

async function runTest() {
  console.log('--- Starting Real-Time Workspace Verification Test ---');

  // Test 1: Healthcheck endpoint
  try {
    const healthRes = await fetch(`${BACKEND_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✓ Healthcheck endpoint responsive:', healthData);
  } catch (err) {
    console.error('✗ Healthcheck failed:', err.message);
    process.exit(1);
  }

  // Test 2: Code execution API
  try {
    const execRes = await fetch(`${BACKEND_URL}/api/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: 'javascript',
        code: 'const a = 10; const b = 25; console.log("Result:", a + b);'
      })
    });
    const execData = await execRes.json();
    console.log('✓ Code Execution API response:', execData);
    if (!execData.output.includes('Result: 35')) {
      throw new Error(`Unexpected output: ${execData.output}`);
    }
  } catch (err) {
    console.error('✗ Code execution test failed:', err.message);
    process.exit(1);
  }

  // Test 3: Real-Time WebSocket Synchronization between 2 clients
  return new Promise((resolve, reject) => {
    const roomId = 'verify-room-42';
    let aliceReceivedState = false;
    let bobReceivedCodeUpdate = false;
    let bobReceivedMessage = false;

    console.log('Connecting Alice to socket...');
    const aliceSocket = io(BACKEND_URL);
    const bobSocket = io(BACKEND_URL);

    aliceSocket.on('connect', () => {
      console.log('✓ Alice connected to server');
      aliceSocket.emit('join-room', { roomId, username: 'Alice' });
    });

    aliceSocket.on('room-state', (state) => {
      console.log('✓ Alice received room state with initial code');
      aliceReceivedState = true;

      // Now connect Bob
      bobSocket.connect();
    });

    bobSocket.on('connect', () => {
      console.log('✓ Bob connected to server');
      bobSocket.emit('join-room', { roomId, username: 'Bob' });
    });

    bobSocket.on('room-state', () => {
      console.log('✓ Bob received room state');
      // Alice makes a code change
      setTimeout(() => {
        console.log('Alice emitting code change...');
        aliceSocket.emit('code-change', {
          roomId,
          code: 'console.log("Hello from Alice in real-time!");'
        });
      }, 200);
    });

    bobSocket.on('code-update', ({ code }) => {
      console.log('✓ Bob received live code-update:', code);
      bobReceivedCodeUpdate = true;

      // Alice sends a chat message
      aliceSocket.emit('send-message', {
        roomId,
        text: 'Hey Bob, look at this synchronized code!'
      });
    });

    bobSocket.on('new-message', (msg) => {
      console.log('✓ Bob received new chat message from:', msg.username, '->', msg.text);
      bobReceivedMessage = true;

      if (aliceReceivedState && bobReceivedCodeUpdate && bobReceivedMessage) {
        console.log('\n🎉 ALL REAL-TIME TESTS PASSED SUCCESSFULLY! 🎉\n');
        aliceSocket.disconnect();
        bobSocket.disconnect();
        resolve();
      }
    });

    setTimeout(() => {
      if (!bobReceivedCodeUpdate || !bobReceivedMessage) {
        reject(new Error('Timed out waiting for socket sync events.'));
      }
    }, 5000);
  });
}

runTest()
  .then(() => {
    console.log('Test completed with exit 0');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test failed with error:', err);
    process.exit(1);
  });
