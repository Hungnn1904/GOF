const express = require('express');
const http = require('http');
const path = require('path');
const os = require('os');
const url = require('url');
const WebSocket = require('ws');

const { handleUpgrade, wssLobby, rooms } = require('./lobby');
const { findLocalIp } = require('./utils');
const { cleanupRoom } = require('./room');

const app = express();
app.use(express.static(path.join(__dirname, '../client')));

const server = http.createServer(app);

server.on('upgrade', (req, socket, head) => {
  handleUpgrade(req, socket, head);
});

setInterval(() => {
  cleanupRoom(rooms);
}, 10000);

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  const ip = findLocalIp();
  console.log('🚀 Server started:');
  console.log(`  - Cho bạn (localhost): http://localhost:${PORT}`);
  console.log(`  - Cho bạn bè (cùng mạng): http://${ip}:${PORT}`);
});
