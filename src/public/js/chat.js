const socket = io();

//Take the parameters from index.html
const form = document.getElementById('messageForm');
const input = document.getElementById('messageInput');
const messagesDiv = document.getElementById('messages');

//Log the Welcome message to the client console
socket.on('Message', message,  () =>{
    console.log(message)
})


form.addEventListener('submit',(e) =>{
    e.preventDefault()
    const message = input.value;
    if (message.trim() !== '') {
        socket.emit('sendMessage', message); // Emit the message to the server
        input.value = ''; // Clear the input field after sending
    }
})

socket.on('AllConnectiorMessage', (message) =>{
    console.log(message)
})


document.getElementById('Geolocation').addEventListener('click' ,() =>{
    navigator.geolocation.getCurrentPosition((possition) =>{
        socket.emit('sendLocation',{
            latitude: possition.coords.latitude ,
            longtitude: possition.coords.longitude
        })
    })
})