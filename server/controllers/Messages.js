const { default: mongoose } = require('mongoose')
const Message=require('../Models/Message')
const Chat=require('../Models/Chat')
const User=require('../Models/User')


module.exports.sendMessage=async function(req,res){
    let isCreatedNew=false
    let newMessageId=new mongoose.Types.ObjectId()
    let users=[req.body._id]
    if(req.body.reqId!=req.user._id){
        users.push(req.body.reqId)
    }

    try {
        let chat= await Chat.findOne({_id:req.body.chatId,users:req.user._id})
        .populate('users','-password')
        .populate('messages.sender','-password')
        if(chat){
            chat.latestMessage=newMessageId
            await chat.save()

            await Message.create({
                _id:newMessageId,
                sender:req.body._id,
                content:req.body.content,
                chat:req.body.chatId,
                isDeleted:false,
                readBy:[req.user._id]           
            })

            }else{
            await Chat.create({
                _id:req.body.chatId,
                chatName:'randomXYZchatApp.123456789@#$%^&*()_+',
                isGroupChat:false,
                users:users,
                pastUsers:[],
                messages:[],
                latestMessage:newMessageId
                
            })

            await Message.create({
                _id:newMessageId,
                sender:req.body._id,
                content:req.body.content,
                isDeleted:false,
                chat:req.body.chatId,
                readBy:[req.user._id]         
            })
            
            isCreatedNew=true
            }
        }catch (error) {

           console.log(err)
           return res.status(500).json({message:err})
        }
        try {
            let chatToReturn=await Chat.findById(req.body.chatId)
        .populate('users')
        // .select('latestMessage')
        .populate({
            path:'latestMessage',
            populate:{
                path:'sender',
                select:'-password'
            }
        })
        .populate({
            path:'latestMessage',
            populate:{
                path:'readBy',
                select:'-password'
            }
        })
       
            if(isCreatedNew==false){
                return res.status(200).json({message:'sent message',chat:chatToReturn})
            }else{
                return res.status(300).json({message:'created a new chat and sent message',chat:chatToReturn})
            }
        } catch (error) {
            
        }
    }


module.exports.seeMessage=function(req,res){

    Message.updateMany({
        $and:[
            {chat:req.body.chatId},
            {readBy:{$ne:req.user._id}}
        ]
    },
    {$addToSet:{readBy:req.user._id}}
).then(result=>{
    return res.status(200).json({message:'seen all the messages',number:result.nModified})
}).catch(err=>{
    console.log(err)
    return res.status(500).json({message:'error happened'})
})
}

module.exports.deleteMessage=async function(req,res){
    try {
        const message=await Message.findOne({_id:req.body.messageId,chat:req.body.chatId})
    if(!message){
        return res.status(400).json({message:'something went wrong'})
    }
    message.content='message was deleted'
    message.save()

    const chat= await Chat.findOne({_id:req.body.chatId})
    if(!chat){
        return res.status(400).json({message:'something went wrong'})
    }
    // if(chat.latestMessage==req.body.messageId){
    //     chat.latestMessage.content='message was deleted'
    // }
    chat.save()
    return res.status(200).json({ message: 'Message deleted' });
    
   } catch (error) {
       return res.status(500).json({ message: 'Error deleting message', error: error.message });
   }
    
}

module.exports.editMessage=async function(req,res){

    try {
        const message=await Message.findOne({_id:req.body.messageId,chat:req.body.chatId})
    if(!message){
        return res.status(400).json({message:'something went wrong'})
    }
    message.content=req.body.newContent
    message.save()

    const chat= await Chat.findOne({_id:req.body.chatId})
    if(!chat){
        return res.status(400).json({message:'something went wrong'})
    }
    // if(chat.latestMessage._id==req.body.messageId){
    //     chat.latestMessage.content=req.body.newContent
    // }
    chat.save()
    return res.status(200).json({ message: 'Message edited' });
    
   } catch (error) {
       return res.status(500).json({ message: 'Error deleting message', error: error.message });
   }

}

const { OpenAI } = require("openai");

const openai = new OpenAI({
  apiKey: '4e2fee42f265418faa03520d92379556',
  baseURL: "https://api.aimlapi.com",
});

module.exports.sendAiMessage=async function(req,res){
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            messages: [
              { role: "system", content: "Your name is Bhidu, be playful and helpful"},
              { role: "user", content: req.body.content }
            ],
            temperature: 0.7,
            max_tokens: 128,
          });
        return res.status(200).json({message:'message',content:chatCompletion.choices[0].message.content})
    } catch (error) {
        console.log(error);
        return res.status(200).json({message:'some error',content:"some error occured..."})
    }

};