const express = require('express');
const filter = require('leo-profanity');
const path = require('path');
const http = require('http'); // Required for creating the HTTP server
const socketio = require('socket.io'); // Required for WebSocket
const { fileURLToPath } = require('url');
const {generatedMessageWithTimestamp, generatedLocationMessageWithTimestamp} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express();
const server = http.createServer(app); // Create the HTTP server
const io = socketio(server); // Attach socket.io to the HTTP server

const port = process.env.PORT || 3000;

app.use(express.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, './public')));


// Serve the 'connection' event from server side to client side
io.on('connection', (socket) => {
    console.log("New WebSocket Connection");

    socket.on('join', ({ username, room }, callback) => {
        const {error, user} = addUser({id:socket.id,username,room})

        if(error){
            return callback(error)
        }
        // Join the specified room
        socket.join(user.room);

        // Emit a welcome message to the new client
        socket.emit('Message', generatedMessageWithTimestamp('Admin','Welcome!'));

        // Broadcast to others in the room that a new user has joined
        socket.broadcast.to(user.room).emit(
            'Message',
            generatedMessageWithTimestamp(`${user.username} has joined the chat`)
        );


        io.to(user.room).emit('roomData', {
            room : user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    });


    // Listen for messages from clients
    socket.on("sendMessage", (message, callback) => {
        //console.log("The message from the client is: ", message);
        
        // Check for profanity in the message

        const user = getUser(socket.id)

        if (filter.check(message)) {
            return callback('Profanity is not allowed');
        }

        // Emit the message to all connected clients
        io.to(user.room).emit('Message', generatedMessageWithTimestamp(user.username,message)); // Use 'Message' for consistency
        callback(); // Acknowledge the event
    });

    // Handle location sharing
    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)

        const url = `https://google.com/maps?q=${location.latitude},${location.longitude}`;
        io.to(user.room).emit('locationmessage', generatedLocationMessageWithTimestamp(user.username,url));
        callback('Location is shared');
    });


    // Handle disconnection of users
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('Message',generatedMessageWithTimestamp('Admin',`${user.username} is disconnected`));
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }



    });
});

// Start the server
server.listen(port, () => {
    console.log("Server is listening on port: " + port);
});


