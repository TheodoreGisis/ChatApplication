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

//Message to serve to the Clients when they are log in to our Chat App
const message = "Welcome to our Chat Application"

//Serve the 'connection' from server side to client side
io.on('connection', (socket) => {

    console.log("New WebSocket Connection");
    //Emit server with client
    socket.emit('Message',message)
    //Listen from client, and display the message to the server side
    //Here we are emit the message to all users exept from one that is connected to the Chat App
    socket.broadcast.emit('Message',"A new User is log in")

    socket.on("sendMessage",(message) =>{
        console.log("The message from the client is: ",message)
        //Serve the message to all the client that are connectin to our server right now
        io.emit('AllConnectiorMessage',message)
    })

    socket.on('sendLocation',(location) =>{
        io.emit('Message', `https${location.latitude},${location.longtitude}`)
    })
    socket.on('disconnect',()=>{
        io.emit('Message','User is left')
    })


});

//Listen to port 3000
server.listen(port, () => {
    console.log("Server is listening on port: " + port);
});
