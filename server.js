const express = require('express');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = 3000;
app.use(express.static('public'));
app.use(express.json());

const clients = new Map(); // Map IPs to sockets

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress.replace(/^.*:/, ''); // strip IPv6 junk
  console.log(`Quest connected from ${ip}`);
  clients.set(ip, ws);

  ws.on('close', () => {
    clients.delete(ip);
    console.log(`Quest at ${ip} disconnected`);
  });

  ws.on('message', (msg) => {
    console.log(`From ${ip}:`, msg.toString());
  });
});

app.post('/send', (req, res) => {
  const { ip, payload } = req.body;
  const ws = clients.get(ip);

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(payload));
    res.send({ status: 'sent' });
  } else {
    res.status(500).send({ error: 'Client not connected' });
  }
});

server.listen(PORT, () => {
  console.log(`Server + WebSocket running on http://localhost:${PORT}`);
});
