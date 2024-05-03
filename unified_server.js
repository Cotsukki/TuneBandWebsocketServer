const fs = require('fs');
const https = require('https');
const http = require('http');
const WebSocket = require('ws');
const os = require('os');
const admin = require("firebase-admin");

var serviceAccount = require("C:\\Users\\Home\\WebsocketServer\\tuneapp-e34e2-firebase-adminsdk-l2lig-c7406c96e3.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tuneapp-e34e2-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();

// SSL/TLS certificates path for secure server
const serverOptions = {
  cert: fs.readFileSync('c:\\Users\\Home\\WebsocketServer\\cert.pem'),
  key: fs.readFileSync('c:\\Users\\Home\\WebsocketServer\\key.pem')
};

// Creating HTTPS server for secure connections
const secureServer = https.createServer(serverOptions);
const wssSecure = new WebSocket.Server({ server: secureServer });

// Creating HTTP server for non-secure connections
const nonSecureServer = http.createServer();
const wssNonSecure = new WebSocket.Server({ server: nonSecureServer });

const clients = {};
const getClientId = (req) => {
  const ip = req.socket.remoteAddress;
  const port = req.socket.remotePort;
  return `${ip}:${port}`;
};

const broadcastMessage = (message, senderId) => {
  Object.keys(clients).forEach(clientId => {
    if (clientId !== senderId) {  // Do not send the message back to the sender
      clients[clientId].ws.send(message);
    }
  });
};

const setupWSConnection = (wss, isSecure) => {
  wss.on('connection', function connection(ws, req) {
    const clientId = getClientId(req);
    clients[clientId] = { ws, isSecure };
    console.log(`Client connected: ${clientId} on ${isSecure ? 'secure' : 'non-secure'} channel`);

    ws.on('message', function incoming(message) {
      console.log(`Received from ${clientId}: ${message}`);
      
      if (typeof message === 'string') {
        handleTextMessage(message, clientId);
      } else {
        // Handle binary data or convert to string if necessary
        console.log(`Received binary message from ${clientId}`);
        handleBinaryMessage(message, clientId);
      }
    });

    ws.on('close', () => {
      console.log(`Client disconnected: ${clientId}`);
      delete clients[clientId];

      // Firebase: Log the disconnect
      const disconnectsRef = db.ref('disconnects');
      disconnectsRef.push({
        clientId: clientId,
        timestamp: admin.database.ServerValue.TIMESTAMP
      });
    });

    ws.on('error', error => {
      console.error(`Error from ${clientId}: ${error}`);

      // Firebase: Log the error
      const errorsRef = db.ref('errors');
      errorsRef.push({
        clientId: clientId,
        error: error.toString(),
        timestamp: admin.database.ServerValue.TIMESTAMP
      });
    });
  });
};

function handleTextMessage(message, clientId) {
    const formattedMessage = message.trim().toUpperCase(); // Normalize the message
    broadcastMessage(formattedMessage, clientId); // Broadcast to all clients

    // Firebase: Log the message
    const messagesRef = db.ref('messages');
    messagesRef.push({
      clientId: clientId,
      message: formattedMessage,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
}

function handleBinaryMessage(message, clientId) {
    const messageString = message.toString('utf8'); // Converts Buffer to UTF-8 string
    const formattedMessage = messageString.trim().toUpperCase();
    broadcastMessage(formattedMessage, clientId);

    // Firebase: Log the binary message as string
    const messagesRef = db.ref('messages');
    messagesRef.push({
      clientId: clientId,
      message: formattedMessage,
      timestamp: admin.database.ServerValue.TIMESTAMP
    });
}

// Setup both WebSocket servers
setupWSConnection(wssSecure, true);
setupWSConnection(wssNonSecure, false);

// Listen on ports for HTTPS/WSS and HTTP/WS
secureServer.listen(8080, () => {
  console.log('Secure WebSocket server started on port 8080');
  logServerIPs();
});

nonSecureServer.listen(8081, () => {
  console.log('WebSocket server started on port 8081');
});

function logServerIPs() {
  const ifaces = os.networkInterfaces();
  Object.keys(ifaces).forEach(ifname => {
    ifaces[ifname].forEach(iface => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`Server IP: ${iface.address} on interface ${ifname}`);
      }
    });
  });
}
