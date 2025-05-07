const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // ← Socket.IO import

const app = express();
const server = http.createServer(app);
const io = new Server(server); // ← Create Socket.IO server

const PORT = 3000;
app.use(express.static('public'));
app.use(express.json());

let connectedClients = new Map();

io.on('connection', (socket) => {
  const id = socket.id;
  console.log(`Quest connected: ${id}`);
  connectedClients.set(id, socket);

  socket.on('disconnect', () => {
    console.log(`Quest disconnected: ${id}`);
    connectedClients.delete(id);
  });

  socket.on('pong', (msg) => {
    console.log(`Got pong from ${id}:`, msg);
  });
});

// This now broadcasts to all connected Socket.IO clients
app.post('/send', (req, res) => {
  const payload = req.body;
  console.log(`Received payload:`, payload);

  io.emit('kitchen_data', payload); // ← Send event to all clients
  res.send({ status: 'sent' });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
