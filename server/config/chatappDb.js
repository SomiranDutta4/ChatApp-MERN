const mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/ChatApp');

const db=mongoose.connection;

db.on('error',console.error.bind(console,"error setting up database"));
db.once('open',function(){console.log('successfully connected to database')});