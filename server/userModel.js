const mongoose=require('mongoose')

const messageModel=new mongoose.Schema({
    sentby:{
        type:String
    },
    message:{
        type:String
    },
    time:{
        type:Date
    }
})

const UserModel=new mongoose.Schema({
    userid:{
        type:String
    },
    isOnline:{
        type:Boolean
    },
    messages:[messageModel]
})

const User=mongoose.model("User",UserModel)
module.exports=User