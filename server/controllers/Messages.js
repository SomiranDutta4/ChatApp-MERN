const { default: mongoose } = require('mongoose')
const Chat=require('../Models/Chat')
const User=require('../Models/User')


module.exports.sendMessage=async function(req,res){
    let isCreatedNew=false
    let newMessageId=new mongoose.Types.ObjectId()
    let users=[req.body._id]
    if(req.body.chat.reqId!=req.user._id){
        users.push(req.body.chat.reqId)
    }

    try {
        let chat= await Chat.findOne({_id:req.body.chat._id})
        .populate('users','-password')
        .populate('messages.sender','-password')
        if(chat){
            console.log('2')

            chat.messages.push({
                _id:newMessageId,
                sender:req.body._id,
                content:req.body.content,
                isDeleted:false,
                readBy:[req.user._id]

            })
            chat.latestMessage={
                _id:newMessageId,
                sender:req.body._id,
                content:req.body.content,
                isDeleted:false,
                readBy:[req.user._id]
            }

            await chat.save()
            // return res.status(200).json({message:'sent message',chat})
            }else{
                console.log('1')
            let newChat=await Chat.create({
                _id:req.body.chat._id,
                chatName:'randomXYZchatApp.123456789@#$%^&*()_+',
                isGroupChat:false,
                users:users,
                messages:[{
                    _id:newMessageId,
                    sender:req.body._id,
                    content:req.body.content,
                    isDeleted:false,
                    readBy:[req.user._id]
                }],
                latestMessage:{
                    _id:newMessageId,
                    content:req.body.content,
                    isDeleted:false,
                    sender:req.body._id,
                    readBy:[req.user._id]
                },
                
            })
            isCreatedNew=true
            }
        }catch (error) {

           console.log(err)
           return res.status(500).json({message:err})
        }
        try {
            let chatToReturn=await Chat.findById(req.body.chat._id)
        .populate('latestMessage.sender','-password')
        .populate('messages.sender','-password')
        .populate('users','-password')
        .populate('latestMessage.readBy','-password')
        .populate('groupAdmins','-password')
        .populate('createdBy','-password')

            if(isCreatedNew==false){
                return res.status(200).json({message:'sent message',chat:chatToReturn.latestMessage})
            }else{
                return res.status(300).json({message:'created a new chat and sent message',chat:chatToReturn.latestMessage})
            }
        } catch (error) {
            
        }
    }


module.exports.seeMessage=()=>{
    Chat.findById(req.body.ChatId).then(chat=>{
        if(chat){
            for(let i=chat.messages.length-1;i>=0;i--){
            if((chat.messages[i].readBy).includes(req.user._id)){
                break;
            }else{
                chat.messages[i].readBy.push(req.user._id)
            }
            }
            chat.save()
            return res.status(200).json({message:'read all messages'})
        }else{
            return res.status(400).json({messages:'some error>>'})
        }
    }).catch(err=>{
        return res.status(500).json({message:'Server side error-500'})
    })
}

module.exports.deleteMessage=async function(req,res){
    try {
        const updatedChat=await Chat.findByIdAndUpdate(
            req.body.chatId,
            {$set:{'messages.$[elem].content':'message was deleted','messages.$[elem].isDeleted':true}},
            {new:true,arrayFilters:[{'elem._id':req.body.messageId}]}
        )
        console.log(updatedChat)
        if(!updatedChat){
            return res.status(400).json({ message: 'No message found' });
        }
        if(updatedChat.latestMessage._id==req.body.messageId){
            updatedChat.latestMessage.content='message was deleted'
            updatedChat.latestMessage.isDeleted=true
        }
        updatedChat.save()

        return res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
        return res.status(500).json({ message: 'Error deleting message', error: error.message });
    }
}

module.exports.editMessage=async function(req,res){
    console.log(req.body)

    try {

        const updatedChat=await Chat.findByIdAndUpdate(
            req.body.chatId,
            {$set:{'messages.$[elem].content':req.body.newContent}},
            {new:true,arrayFilters:[{'elem._id':req.body.messageId}]}
        )
        if(!updatedChat){
            return res.status(400).json({ message: 'No message found' });
        }
        return res.status(200).json({ message: 'Message edited' });
    } catch (error) {
        return res.status(500).json({ message: 'Error editing message', error: error.message });
    }
}

