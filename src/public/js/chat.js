const socket = io();  // Initialize WebSocket connection with the server

// Get HTML elements by their ID for message form, input field, message display area, and geolocation button
const form = document.getElementById('messageForm');              // Form for sending messages
const input = document.getElementById('messageInput');            // Input field where user types the message
const messagesDiv = document.getElementById('messages');          // Div where chat messages will be displayed
const sendLocationButton = document.getElementById('Geolocation'); // Button to share geolocation

// Get the Mustache.js templates for rendering messages and location links
const messageTemplate = document.getElementById('message-template').innerHTML;  // Template for rendering text messages
const locationTemplate = document.getElementById('location-template').innerHTML; // Template for rendering location links
const sidebarTemplate =  document.getElementById('side-bar-template').innerHTML;


//Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true, // to remove the ? from the query string
});

// Listen for location messages from the server and render them as clickable links in the chat
socket.on('locationmessage', (locationmessage) => {
    console.log(locationmessage);  // Log the location message (Google Maps URL)
    
    // Render the location link using Mustache template and insert it into the messages div
    const html = Mustache.render(locationTemplate, { 
        username: locationmessage.username,
        url: locationmessage.text ,
        createdAt: moment(locationmessage.createdAt).format('h:mm a')
    
    });
    messagesDiv.insertAdjacentHTML('beforeend', html);  // Add rendered message to the chat
});

// Listen for general text messages (e.g., welcome messages) and render them in the chat
socket.on('Message', (message) => {
    console.log(message);  // Log the received message
    
    // Render the message using the Mustache template and insert it into the messages div
    const html = Mustache.render(messageTemplate, {
         username: message.username,
         message: message.text,
         createdAt: moment(message.createdAt).format('h:mm a')
        });
    messagesDiv.insertAdjacentHTML('beforeend', html);  // Add rendered message to the chat
});


socket.on('roomData',({room,users}) =>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
}) 



// Handle form submission for sending text messages to the server
form.addEventListener('submit', (e) => {
    e.preventDefault();  // Prevent form from submitting via traditional HTTP request
    
    const message = input.value;  // Get the message typed by the user
    
    // Only send the message if it is not empty or just whitespace
    if (message.trim() !== '') {
        socket.emit('sendMessage', message, (error) => {  // Send the message to the server
            if (error) {
                return console.log(error);  // If there's an error, log it to the console
            }
            console.log('Message delivered');  // Log message delivery confirmation
        });
        input.value = '';  // Clear the input field after the message is sent
    }s
});

// Listen for broadcasted messages from the server when new users connect
socket.on('AllConnectiorMessage', (message) => {
    console.log(message);  // Log the broadcast message
});

// Handle click event on the "Send Geolocation" button to share user's location
sendLocationButton.addEventListener('click', () => {
    sendLocationButton.setAttribute('disabled', 'disabled');  // Disable the button while geolocation is being fetched
    
    // Get user's current geolocation and send it to the server
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {  // Emit the location coordinates to the server
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (message) => {
            sendLocationButton.removeAttribute('disabled');  // Re-enable the button after location is sent
            console.log(message);  // Log location sharing confirmation
        });
    });
});


socket.emit('join', { username, room }, (error) =>{
    if(error){
        alert(error)
        location.href = '/'
    }
});