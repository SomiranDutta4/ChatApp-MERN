const express=require('express')
const PORT=2000;
const mongodb=require('./config/chatappDb')
// const http=require('http')
// const { Server } = require("socket.io");
const app=express()
app.use(express.urlencoded())
app.use(express.json())
const cookieparser=require('cookie-parser')
app.use(cookieparser())
// const chatServer=http.createServer(app)
// const io=new Server(chatServer)


const cors=require('cors')
app.use(cors())
// const corsOptions = {
//     origin: 'http://localhost:3000', // Allow requests from this origin
//     methods: ['GET', 'POST'], // Allow only GET and POST requests
//     allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
//   };
  
// app.use(cors(corsOptions));
  
// const UserRoute=require('./Routers/User')
// const ChatRoute=require('./Routers/Chat')
// const MessageRoute=require('./Routers/messages')

app.use('/user',require('./Routers/User'))
app.use('/chat',require('./Routers/Chat'))
app.use('/message',require('./Routers/messages'))

// io.on('connection',(socket)=>{
//    socket.on("user-message",(message,room)=>{
//     if(room!=''){
//         socket.to(room).emit('recieve-message',message)
//     }else{
//         socket.broadcast.emit('recieve-message',message)
//     }
//     // socket.broadcast.emit('recieve-message',message)
//    })
//    socket.on('join-room',(room,cb)=>{
//     socket.join(room)
//     cb(`joined${room}`)
//     //cb can be used to send sent message
//     //for custom rooms
//    })
// })



app.listen(PORT,function(err){
    if(err){
        console.log('Error is setting up Server')
        return
    }
    console.log('set up chatServer on PORT:',PORT)
})