const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

let rooms = {}; // { roomId: { players: {}, mode: string, createdBy: string } }

io.on('connection', (socket) => {
  console.log('Nuevo jugador conectado:', socket.id);

  // Handle createRoom
  socket.on('createRoom', (data) => {
    const { roomId, mode, playerId } = data;
    if (!rooms[roomId]) {
      rooms[roomId] = {
        players: {},
        mode: mode,
        createdBy: playerId
      };
      console.log(`Sala creada: ${roomId} por ${playerId}`);
    }
    // Join the room
    socket.join(roomId);
    rooms[roomId].players[socket.id] = {
      id: socket.id,
      x: 0, y: 0.8, z: 0,
      yaw: 0,
      color: Math.random() * 0xffffff
    };
    socket.emit('currentPlayers', rooms[roomId].players);
    socket.to(roomId).emit('newPlayer', rooms[roomId].players[socket.id]);
  });

  // Handle joinRoom
  socket.on('joinRoom', (data) => {
    const { room } = data;
    if (rooms[room]) {
      socket.join(room);
      rooms[room].players[socket.id] = {
        id: socket.id,
        x: 0, y: 0.8, z: 0,
        yaw: 0,
        color: Math.random() * 0xffffff
      };
      socket.emit('currentPlayers', rooms[room].players);
      socket.to(room).emit('newPlayer', rooms[room].players[socket.id]);
      console.log(`Jugador ${socket.id} se unió a la sala ${room}`);
    } else {
      socket.emit('error', 'Sala no encontrada');
    }
  });

  // Handle getRooms
  socket.on('getRooms', () => {
    const roomsList = Object.keys(rooms).map(roomId => ({
      id: roomId,
      mode: rooms[roomId].mode,
      players: Object.keys(rooms[roomId].players).length,
      createdBy: rooms[roomId].createdBy
    }));
    socket.emit('roomsList', roomsList);
  });

  // Handle playerMovement (room-specific)
  socket.on('playerMovement', (movementData) => {
    // Find the room the socket is in
    const roomsKeys = Object.keys(rooms);
    for (const roomId of roomsKeys) {
      if (rooms[roomId].players[socket.id]) {
        rooms[roomId].players[socket.id].x = movementData.x;
        rooms[roomId].players[socket.id].y = movementData.y;
        rooms[roomId].players[socket.id].z = movementData.z;
        rooms[roomId].players[socket.id].yaw = movementData.yaw;
        socket.to(roomId).emit('playerMoved', rooms[roomId].players[socket.id]);
        break;
      }
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Jugador desconectado:', socket.id);
    const roomsKeys = Object.keys(rooms);
    for (const roomId of roomsKeys) {
      if (rooms[roomId].players[socket.id]) {
        delete rooms[roomId].players[socket.id];
        socket.to(roomId).emit('playerDisconnected', socket.id);
        // If no players left, delete room
        if (Object.keys(rooms[roomId].players).length === 0) {
          delete rooms[roomId];
          console.log(`Sala ${roomId} eliminada por falta de jugadores`);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor de Perú Royale corriendo en puerto ${PORT}`);
});