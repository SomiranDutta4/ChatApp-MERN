const mongoose=require('mongoose');
const URI=process.env.MONGO_URI;
console.log(process.env.dbPass)

mongoose.connect(URI).then(result=>{
    console.log('mongoDB set up')
}).catch(err=>{
    console.log('error in DB connection:',err)
})

// const db=mongoose.connection;

// db.on('error',console.error.bind(console,"error setting up database"));
// db.once('open',function(){console.log('successfully connected to database')});