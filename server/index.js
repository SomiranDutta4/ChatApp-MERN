const express = require('express')
const https = require('https')
const fs = require('fs')
const PORT = process.env.PORT || 2000;
const mongodb = require('./config/chatappDb')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const path = require('path');


const app = express()

app.use(express.urlencoded())
app.use(express.json())
const cookieparser = require('cookie-parser')
app.use(cookieparser())

const accessLogs = fs.createWriteStream(path.join(__dirname, 'access.log'),
  { flags: 'a' }
)

const cors = require('cors');
app.use(cors())
app.use(helmet())
app.use(compression())
app.use(morgan('combined', { stream: accessLogs }))


app.use('/user', require('./Routers/User'))
app.use('/chat', require('./Routers/Chat'))
app.use('/message', require('./Routers/messages'))

// app.get('/',function(req,res){
//   return res.end('Hey!');
// })



const server = app.listen(PORT, function (err) {
  if (err) {
    console.log('Error is setting up Server')
    return
  }
  console.log('set up chatServer on PORT:', PORT)
})
//------------------------production----------------------------------

// if(process.env.NODE_ENV=='production'){
//   console.log('server is up!')
//   app.use(express.static(path.join(__dirname,'../client','build')));

//   app.get('*',(req,res)=>{
//     res.sendFile(path.resolve('../client','build','index.html'));
//   })
//   app.get('/',(req,res)=>{
//     res.send('API is working perfectly')
//   })
// }










//========================production---------------------------------
// const privateKey=fs.readFileSync('server.key');
// const certificate=fs.readFileSync('server.cert');

// const server=https.createServer({key:privateKey,cert:certificate},app)
// .listen(PORT,function(err){
//   if(err){
//       console.log('Error is setting up Server')
//       return
//   }
//   console.log('set up chatServer on PORT:',PORT)
// })

const io = require('socket.io')(server, {
  pingTimeout: 60000,
  cors: {
    origin:'*',
    // origin: "http://localhost:3000",
    // credentials: true,
  }
})

io.on('connection', (socket) => {

  socket.on('setup', (User) => {
    try {
      socket.join(User._id)
      socket.emit('connected')
      console.log('User joined:', User._id)
    } catch (error) {
      
    }
  })
  socket.on('join chat', (room) => {
    socket.join(room)
    console.log('user joined with room:', room)
  })
  socket.on("new message", (newMessage) => {
    try {
      var users = newMessage.users;
  
      if (users.length <= 1) return console.log("no other user to send");
  
      users.forEach((user) => {
        if (user !== newMessage.latestMessage.sender._id) {
          socket.in(user).emit("message recieved", newMessage.latestMessage)
        }
      });
    } catch (error) {
      
    }
  });

  socket.on('see Message', (details) => {
    try {
      if(details.UserId!=details.to){
      socket.in(details.to._id).emit("seen messages", details)}
    } catch (error) {
      
    }
  })

  socket.on('add admin', (groupDetails) => {
    try {
      socket.in(groupDetails.user._id).emit('added admin', groupDetails)
    } catch (error) {}
  })

  socket.on('remove admin', (groupDetails) => {
    try {
      socket.in(groupDetails.user._id).emit('removed admin', groupDetails)
    } catch (error) {}
  })
  socket.on('remove member', (groupDetails) => {
    try {
      socket.in(groupDetails.user._id).emit('removed member', groupDetails)
    } catch (error) {}
  })
  socket.on('Add member', (groupDetails) => {
    try {
      socket.in(groupDetails.user._id).emit('added member');
    } catch (error) {}
  })
  socket.on('group created', (selectedMembers) => {
    try {
      selectedMembers.forEach(user=>{
        socket.in(user).emit('group added',user);
      })  
    } catch (error) {}
  })

  socket.off('setup', () => {
    try {
      console.log('user disconnected')
      socket.leave(User._id)
    } catch (error) {}

  })
})