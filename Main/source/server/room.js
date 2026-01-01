const WebSocket = require('ws');
const { makeId } = require('./utils');

const COUNTDOWN_SECONDS = 5;
let nextPlayerId = 1;

function createRoomServer(room, roomsArray, broadcastLobbyRooms = () => {}) {
  const wssRoom = new WebSocket.Server({ noServer: true });
  room.wss = wssRoom;
  room.players = new Set();
  room.playersData = new Map();
  room.wsToPlayerId = new Map();
  room.countdownTimer = null;
  room.hostId = null;

  function broadcastRoomJson(msg) {
    const payload = JSON.stringify(msg);
    if (msg.type !== 'chat_room_msg' && !msg.type.startsWith('webrtc_')) {
      console.log(`📤 Broadcast to room ${room.name}:`, msg.type);
    }
    room.players.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try { ws.send(payload); } catch (e) {}
      }
    });
  }

  function sendTo(ws, msg) {
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (msg.type !== 'chat_room_msg' && !msg.type.startsWith('webrtc_')) {
        console.log(`📤 Gửi riêng cho ${room.playersData.get(room.wsToPlayerId.get(ws))?.name}:`, msg.type);
      }
      ws.send(JSON.stringify(msg));
    }
  }

  function getWsByPlayerId(playerId) {
    for (let [ws, id] of room.wsToPlayerId.entries()) {
      if (id === playerId) return ws;
    }
    return null;
  }

  function broadcastLobbyUpdate() {
    const playersList = Array.from(room.playersData.values());
    console.log(`🔄 Lobby update for room ${room.name}:`, {
      players: playersList.length,
      hostId: room.hostId,
      state: room.state
    });
    broadcastRoomJson({
      type: 'lobby_update',
      players: playersList,
      hostId: room.hostId,
      state: room.state
    });
  }

  wssRoom.on('connection', (ws, req) => {
    const { searchParams } = new URL(req.url, `ws://${req.headers.host}`);
    const playerName = searchParams.get('name') || 'Anonymous';
    console.log(`🔗 New connection to room ${room.name}: ${playerName}`);

    if (room.state === 'IN_PROGRESS' || room.state === 'COUNTDOWN') {
      console.log(`❌ Room ${room.name} is busy, rejecting ${playerName}`);
      sendTo(ws, { type: 'error', message: 'Trận đấu đang diễn ra hoặc sắp bắt đầu, không thể tham gia!' });
      ws.close();
      return;
    }

    const player = {
      id: nextPlayerId++,
      name: playerName,
    };

    if (room.hostId === null) {
      room.hostId = player.id;
      console.log(`👑 ${playerName} (id: ${player.id}) is now host of room ${room.name}`);
    }

    room.playersData.set(player.id, player);
    room.players.add(ws);
    room.wsToPlayerId.set(ws, player.id);

    console.log(`✅ Player ${player.id} (${player.name}) connected to room ${room.id}. Players: ${room.players.size}`);

    try {
      const buf0 = new ArrayBuffer(5);
      const dv0 = new DataView(buf0);
      dv0.setUint8(0, 0);
      dv0.setUint32(1, player.id);
      ws.send(buf0);
    } catch (e) { console.error('send welcome error', e); }

    broadcastLobbyUpdate();
    broadcastLobbyRooms();

    ws.on('message', (data) => {
      const pid = room.wsToPlayerId.get(ws);
      const p = room.playersData.get(pid);
      if (!p) return;

      let msg = null;
      try {
        msg = JSON.parse(data.toString());
      } catch (e) {}

      if (msg) {
        if (msg.type === 'chat_room') {
          const message = String(msg.message || '').trim();
          if (message) {
            broadcastRoomJson({ type: 'chat_room_msg', sender: p.name, message });
          }
          return;
        }

        if (msg.type === 'webrtc_offer') {
          console.log(`[Signaling] Nhận offer từ ${p.name} (Guest), gửi cho Host (id: ${room.hostId})`);
          const hostWs = getWsByPlayerId(room.hostId);
          if (hostWs) {
            sendTo(hostWs, {
              type: 'webrtc_offer',
              senderId: p.id,
              offer: msg.offer
            });
          }
        }
        else if (msg.type === 'webrtc_answer') {
          console.log(`[Signaling] Nhận answer từ Host, gửi cho ${msg.targetId} (Guest)`);
          const guestWs = getWsByPlayerId(msg.targetId);
          if (guestWs) {
            sendTo(guestWs, {
              type: 'webrtc_answer',
              senderId: p.id,
              answer: msg.answer
            });
          }
        }
        else if (msg.type === 'webrtc_candidate') {
          const targetWs = getWsByPlayerId(msg.targetId);
          if (targetWs) {
            sendTo(targetWs, {
              type: 'webrtc_candidate',
              senderId: p.id,
              candidate: msg.candidate
            });
          }
        }

        if (pid !== room.hostId) {
          if (msg.type === 'start_game' || msg.type === 'cancel_countdown' || msg.type === 'end_game') {
            console.log(`❌ LỆNH BỊ TỪ CHỐI: ${p.name} không phải host`);
            sendTo(ws, { type: 'error', message: 'Chỉ chủ phòng mới có quyền này!' });
          }
          return;
        }

        if (msg.type === 'start_game') {
          if (room.state === 'WAITING') {
            room.state = 'COUNTDOWN';
            let countdown = COUNTDOWN_SECONDS;
            broadcastRoomJson({ type: 'countdown', seconds: countdown });

            if (room.countdownTimer) clearInterval(room.countdownTimer);

            room.countdownTimer = setInterval(() => {
              countdown--;
              broadcastRoomJson({ type: 'countdown', seconds: countdown });

              if (countdown <= 0) {
                clearInterval(room.countdownTimer);
                room.countdownTimer = null;
                room.state = 'IN_PROGRESS';
                console.log(`🎯 MATCH START in ${room.name}`);
                broadcastRoomJson({ type: 'game_start' });
                broadcastLobbyRooms();
              }
            }, 1000);
          }
        } 
        else if (msg.type === 'cancel_countdown') {
          if (room.state === 'COUNTDOWN') {
            if (room.countdownTimer) clearInterval(room.countdownTimer);
            room.countdownTimer = null;
            room.state = 'WAITING';
            console.log(`✅ Countdown cancelled. Back to WAITING.`);
            broadcastRoomJson({ type: 'countdown', seconds: 0 });
            broadcastLobbyRooms();
          }
        } 
        else if (msg.type === 'end_game') {
          if (room.state === 'IN_PROGRESS' || room.state === 'COUNTDOWN') {
            if (room.countdownTimer) clearInterval(room.countdownTimer);
            room.countdownTimer = null;
            room.state = 'WAITING';
            console.log(`✅ Game ended by Host. Back to WAITING.`);
            broadcastRoomJson({ type: 'game_end' });
            broadcastLobbyRooms();
          }
        }

        return;
      }

      try {
        const ab = Buffer.isBuffer(data)
          ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
          : data;
        const dv = new DataView(ab);
        const t = dv.getUint8(0);

        if (t === 4) {
          const pongBuf = new ArrayBuffer(1);
          const pongDv = new DataView(pongBuf);
          pongDv.setUint8(0, 5);
          ws.send(pongBuf);
        }
      } catch (e) {
        console.error('❌ Room binary message error', e);
      }
    });

    ws.on('close', () => {
      const pid = room.wsToPlayerId.get(ws);
      if (pid) {
        room.playersData.delete(pid);
        room.wsToPlayerId.delete(ws);
      }
      room.players.delete(ws);
      console.log(`🔌 Player ${pid} left room ${room.id}. Remaining: ${room.players.size}`);

      if (room.players.size === 0) {
        console.log(`🏁 Room ${room.name} is empty, scheduling cleanup`);
        setTimeout(() => {
          if (room.players.size === 0) {
            cleanupRoom(room.id, roomsArray);
            broadcastLobbyRooms();
          }
        }, 5000);
      } else {
        if (pid === room.hostId) {
          room.hostId = room.playersData.keys().next().value;
          console.log(`👑 New host is: ${room.playersData.get(room.hostId)?.name} (id: ${room.hostId})`);
        }
        broadcastLobbyUpdate();
        broadcastLobbyRooms();
      }
    });
  });

  console.log(`🔨 P2P Room server created: ${room.name} (${room.id})`);
}

function cleanupRoom(roomId, roomsArray = []) {
  const idx = roomsArray.findIndex(r => r.id === roomId);
  if (idx === -1) return;
  const room = roomsArray[idx];
  
  if (room.players && room.players.size > 0) return;

  console.log('🧹 Cleaning up room:', roomId);
  try {
    if (room.countdownTimer) clearInterval(room.countdownTimer);
    if (room.wss) {
      room.players.forEach(ws => {
        try { ws.close(); } catch (e) {}
      });
      room.wss.close();
    }
  } catch (e) { console.error('cleanup error', e); }
  
  roomsArray.splice(idx, 1);
}

function snapshotRoomsForClients(roomsArray) {
  return roomsArray.map(r => ({
    id: r.id,
    name: r.name,
    hasPass: !!r.pass,
    count: r.players ? r.players.size : 0,
    createdAt: r.createdAt,
    state: r.state
  }));
}

module.exports = {
  createRoomServer,
  cleanupRoom,
  snapshotRoomsForClients
};
