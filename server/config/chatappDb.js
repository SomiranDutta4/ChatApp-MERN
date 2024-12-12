const mongoose=require('mongoose');
const URI=`mongodb+srv://${process.env.dbUser}:${process.env.dbPass}@chats.buli4.mongodb.net/?retryWrites=true&w=majority&appName=${process.env.dbName}`
mongoose.connect('mongodb://localhost/ChatApp');
// mongoose.connect(URI).then(result=>{
//     console.log('mongoDB set up')
// }).catch(err=>{
//     console.log('error in DB connection:',err)
// })

const db=mongoose.connection;

db.on('error',console.error.bind(console,"error setting up database"));
db.once('open',function(){console.log('successfully connected to database')});