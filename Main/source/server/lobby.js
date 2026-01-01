const WebSocket = require('ws');
const { createRoomServer, cleanupRoom, snapshotRoomsForClients } = require('./room');
const { makeId } = require('./utils');

const rooms = [];
const wssLobby = new WebSocket.Server({ noServer: true });

function broadcastLobbyRooms() {
  const payload = JSON.stringify({ type: 'rooms_list', rooms: snapshotRoomsForClients(rooms) });
  wssLobby.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(payload);
  });
}

function broadcastLobbyChat(sender, message) {
  const payload = JSON.stringify({ type: 'chat_global_msg', sender, message });
  wssLobby.clients.forEach(c => {
    if (c.readyState === WebSocket.OPEN) c.send(payload);
  });
}

wssLobby.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'rooms_list', rooms: snapshotRoomsForClients(rooms) }));

  ws.on('message', (msg) => {
    let data;
    try { data = JSON.parse(msg); } catch { return; }

    if (data.type === 'create_room') {
      const room = {
        id: makeId(),
        name: data.name.trim(),
        pass: data.pass || null,
        state: 'WAITING',
        createdAt: Date.now(),
      };
      createRoomServer(room, rooms, broadcastLobbyRooms);
      rooms.push(room);
      ws.send(JSON.stringify({ type: 'created', room: { id: room.id, name: room.name } }));
      broadcastLobbyRooms();
    }

    else if (data.type === 'join_request') { 
      const room = rooms.find(r => r.id === data.id); 
      if (!room) {
        ws.send(JSON.stringify({ type: 'error', message: '❌ Phòng không tồn tại!' }));
        return;
      }
      if (room.state !== 'WAITING') {
        ws.send(JSON.stringify({ type: 'error', message: '⚠️ Phòng đang chơi, không thể tham gia!' }));
        return;
      }
      if (room.pass && room.pass !== data.pass) {
        ws.send(JSON.stringify({ type: 'error', message: '🔒 Sai mật khẩu phòng!' }));
        return;
      }

      ws.send(JSON.stringify({
        type: 'join_ok',
        room: { id: room.id, name: room.name }
      }));
    }

    else if (data.type === 'chat_global') {
      broadcastLobbyChat(data.player || 'Anonymous', data.message || '');
    }
  });
});

function handleUpgrade(req, socket, head) {
  const { pathname } = new URL(req.url, `ws://${req.headers.host}`);

  if (pathname === '/lobby') {
    wssLobby.handleUpgrade(req, socket, head, ws => wssLobby.emit('connection', ws, req));
  } else if (pathname.startsWith('/room/')) {
    const id = pathname.split('/')[2];
    const room = rooms.find(r => r.id === id); 
    if (!room || !room.wss) {
      socket.write('HTTP/1.1 404 Not Found\r\n\r\n');
      socket.destroy();
      return;
    }
    room.wss.handleUpgrade(req, socket, head, ws => room.wss.emit('connection', ws, req));
  } else {
    socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
    socket.destroy();
  }
}

module.exports = { wssLobby, handleUpgrade, rooms };
