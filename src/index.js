const path = require("path");
const http = require("http")
const express = require('express');
const socketio = require('socket.io')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')
// const hbs = require('hbs');

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

// Define paths for Express config
const publicDirectory = path.join(__dirname, '../public');
// const viewDirectory = path.join(__dirname, '../templates/views');
// const partialsDirectory = path.join(__dirname, '../templates/partials')

// Define handlebars engine and views location
// app.set('view engine', 'hbs');
// app.set('views', viewDirectory);
// hbs.registerPartials(partialsDirectory);

// Define static directory to serve
app.use(express.static(publicDirectory));

io.on('connection', (socket) => {
    console.log('New websocket connection!')

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message' , generateMessage(`${user.username}, Welcome to the chat!`, 'Admin'))
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined`, 'Admin'))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage', (msg, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('message', generateMessage(msg, user.username))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage(`${user.username} has left`, 'Admin'))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`, user.username))
        callback()
    })  
})  



server.listen(port, () => {
    console.log("Server is up on port " + port)
});