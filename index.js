const express = require('express');
const { createServer } = require('node:http');
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env['port'];

/* assets */

app.get('/assets/icon.png', (req, res) => {
  res.sendFile(__dirname + "/assets/icon.png");
});
app.get('/assets/waiting.png', (req, res) => {
  res.sendFile(__dirname + "/assets/waiting.png");
});
app.get('/assets/send.png', (req, res) => {
  res.sendFile(__dirname + "/assets/send.png");
});

/* pages */

app.get('/', (req, res) => {
  if (req.url.startsWith("/?") || req.url.startsWith("?")) {
    res.sendFile(__dirname + "/pages/room.html");
  } else {
    res.sendFile(__dirname + "/pages/index.html");
  }
});
app.get('/pages/style.css', (req, res) => {
  res.sendFile(__dirname + "/pages/style.css");
});
app.get('/pages/room.js', (req, res) => {
  res.sendFile(__dirname + "/pages/room.js");
});
app.get('/privacy', (req, res) => {
  res.sendFile(__dirname + "/pages/privacy.html");
});
app.get('/dc', (req, res) => {
  res.sendFile(__dirname + "/pages/dc.html");
});
app.get('/about', (req, res) => {
  res.sendFile(__dirname + "/pages/about.html");
});
app.get('*', (req, res) => {
  res.sendFile(__dirname + "/pages/404.html");
});

/* socket.io */

io.on('connection', (socket) => {
  socket.on("s", function(data) {
    io.emit("s" + data.r, data);
  });
  socket.on("m", function(data) {
    io.emit("m" + data.r, data);
  });
});

server.listen(port, () => {
  console.log(`Server running at *:${port}/`);
});
