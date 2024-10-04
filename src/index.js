const express = require('express');
const path = require('path');
const http = require('http'); // Fix here
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app); // Fix here
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.json());

// Serving static files
app.use(express.static(path.join(__dirname, './public')));

io.on('connection', () => {
    console.log("New WebSocket Connection");
});

server.listen(port, () => {
    console.log("Server is listening on port: " + port);
});
