const express=require('express')
const PORT=2000;
const mongodb=require('./config/chatappDb')
const app=express()

app.use(express.urlencoded())
app.use(express.json())
const cookieparser=require('cookie-parser')
app.use(cookieparser())

const cors=require('cors')
app.use(cors())


app.use('/user',require('./Routers/User'))
app.use('/chat',require('./Routers/Chat'))
app.use('/message',require('./Routers/messages'))


const server=app.listen(PORT,function(err){
    if(err){
        console.log('Error is setting up Server')
        return
    }
    console.log('set up chatServer on PORT:',PORT)
})
const io=require('socket.io')(server,{
    pingTimeout: 60000,
    cors: {
      origin: "http://localhost:3000",
      // credentials: true,
    },
})

io.on('connection',(socket)=>{

    socket.on('setup',(User)=>{
        socket.join(User._id)
        socket.emit('connected')
        console.log('User joined:',User._id)
    })
    socket.on('join chat',(room)=>{
        socket.join(room)
        console.log('user joined with room:',room)
    })
    socket.on("new message", (newMessage) => {
        var users = newMessage.users;
    
        if (users.length<=1) return console.log("no other user to send");
    
        users.forEach((user) => {
          if (user !== newMessage.latestMessage.sender._id){
            socket.in(user).emit("message recieved", newMessage)
          }
        });
      });

      socket.on('see Message',(details)=>{
      socket.in(details.UserId).emit('seen message',details)
      })

      socket.on('Add member',(groupDetails)=>{
        socket.in(groupDetails.user._id).emit('added member',groupDetails)
      })

      socket.on('add admin',(groupDetails)=>{
        socket.in(groupDetails.user._id).emit('added admin',groupDetails)
      })

      socket.on('remove admin',(groupDetails)=>{
        socket.in(groupDetails.user._id).emit('removed admin',groupDetails)
      })

      socket.on('remove member',(groupDetails)=>{
        socket.in(groupDetails.user._id).emit('removed member',groupDetails)
      })

      socket.off('setup',()=>{
        console.log('user disconnected')
        socket.leave(User._id)
      })
})