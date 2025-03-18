const Chat=require('../Models/Chat')
const User=require('../Models/User')
const Message=require('../Models/Message')
const mongoose=require('mongoose')

module.exports.fetchAllChats = async function(req, res) {
    try {
        let chats = await Chat.find({
            $or: [
                { 'users': req.query._id },
                { 'users._id': req.query._id }
            ]
        })
        .populate('groupAdmins','-password')
        .populate('createdBy','-password')
        .populate('users', '-password')   
        .populate({
            path: 'latestMessage',
            populate: {
                path: 'sender',
                select: 'name pic contactNumber'
            },
        });
        if (chats.length === 0) {
            return res.status(200).json({ chats: [], message: 'not chatted yet' });
        }

        return res.status(200).json({ chats: chats, message: 'fetched successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'error in server side' });
    }
};
// module.exports



module.exports.ClickedChat=async function(req,res){
   try {
    let chat=await Chat.findOne({_id:req.query._id})
    .populate('users','-password')
    // .populate('messages.sender','name pic contactNumber')
    // .populate('messages.readBy','-password')
    .populate('createdBy','-password')
    .populate('groupAdmins','-password')

    
    if(!chat){
        return res.status(400).json({message:'send the first message'})
    }
    chat.chatName=req.query.chatName

    try {
        const messages=await Message.find({chat:chat._id})
        .populate('sender','-password')
        // .populate('readBy','-password')
        chat.messages=messages
    } catch (error) {
        chat.messages=[]
        console.log(error)
    }
    return res.status(200).json(chat)

   } catch (error) {
    return res.status(500).json({message:'could not find Chat'})
   }
}

module.exports.createNew=async function(req,res){
    try {
        if(req.body._id==req.user._id){
            let chat=await Chat.findOne({
                users:{
                    $size:1,
                    $elemMatch:{$eq:req.body._id}
                }
            })
            .populate('users','-password')
            .populate({
                path:'latestMessage',
                populate:{
                    path:'sender',
                    select:'name pic contactNumber'
                }
            })
    
            if(chat){
                let messages=await Message.find({chat:chat._id})
    
                return res.status(200).json({
                users:req.body.users,
                messages:messages,
                chatName:req.body.chatName,
                pic:req.body.pic,
                isGroupChat:false,
                contactNumber:req.body.contactNumber,
                _id:chat._id
                })   
            }else{
    
                return res.status(200).json({
                    users:req.body.users,
                    messages:[],
                    chatName:req.body.chatName,
                    isGroupChat:false,
                    contactNumber:req.body.contactNumber,
                    pic:req.body.pic,
                    reqId:req.body._id,
                    _id:new mongoose.Types.ObjectId()
                })
            }
    
    
        }else{
            let chat=await Chat.findOne({'users':{
                $all:[req.body._id,req.user._id]
            }})
    
            if(chat){
                let messages=await Message.find({chat:chat._id})
                return res.status(200).json({
                    users:req.body.users,
                    messages:messages,
                    chatName:req.body.chatName,
                    isGroupChat:false,
                    users:chat.users,
                    contactNumber:req.body.contactNumber,
                    _id:chat._id
                })
            }
    
            return res.status(200).json({
                users:req.body.users,
                messages:[],
                chatName:req.body.chatName,
                isGroupChat:false,
                contactNumber:req.body.contactNumber,
                pic:req.body.pic,
                reqId:req.body._id,
                _id:new mongoose.Types.ObjectId()
            })
    
        }
    } catch (error) {
        return res.status(500).json({message:error.message})
    }

}


module.exports.createGroup=async function(req,res){
    let newChatid=new mongoose.Types.ObjectId()
    let users=[req.user._id]
    for(let i=0;i<req.body.selectedMembers.length;i++){
        users.push(req.body.selectedMembers[i])
    }
    let Admin=[req.user._id]
    try {
        let newId=new mongoose.Types.ObjectId
        await Message.create({
            content:'The group was created',
            _id:newId,
        })

        let newGroup=await Chat.create({
            _id:newChatid,
            chatName:req.body.groupName,
            isGroupChat:true,
            pic:'https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png',
            users:users,
            latestMessage:newId,
            unseenMsg:0,
            createdBy:req.user._id,
            groupAdmins:Admin,
            createdAt:new Date()
        })
    } catch (error) {
        console.log(error)
    }
    try {
        let Groupchat=await Chat.findById(newChatid)
        .populate('users','-password')
        .populate('latestMessage')
        .populate('groupAdmins','-password')
        .populate('createdBy','-password')
        return res.status(201).json({message:'Group was created',Groupchat:Groupchat})
    } catch (error) {
        console.log(error)
        return res.status(500).json({message:'Some Server side error'})
    }
}

module.exports.editGroupName=function(req,res){
    Chat.findOne({_id:req.body._id,groupAdmins:req.user._id}).then(chat=>{
        if(!chat){return res.status(400).json({message:'you"re not group admmin'})}
        chat.chatName=req.body.newName
        chat.save()
        return res.status(200).json({message:'saved successfully'})
    }).catch(err=>{
        return res.status(500).json({message:err})
    })
}

module.exports.addAdmin=async function(req,res){
    //req.body.newAdmin: _id of user
    //req.bdy.chatId
    try {
        let chat=await Chat.findOne({_id:req.body.chatId,users:req.body.Admin,groupAdmins:req.user._id})
        if(chat){
            chat.groupAdmins.push(req.body.Admin) 
            chat.save()
        }
        return res.status(200).json({message:'added new admin'})
    } catch (error) {
        return res.status(500).json({message:'some error occured'})
    }
}
module.exports.removeAdmin=function(req,res){
    //req.Admin
    //req.bdy.chatId
    Chat.updateOne({
        _id:req.body.chatId,
        users:req.body.Admin,
        groupAdmins:req.user._id,
        createdBy:{$ne:req.body.Admin}
        },
        {$pull:{groupAdmins:req.body.Admin}},
        {new:true}
    ).then(chat=>{
        if(!chat){
            return res.status(400).json({message:""})
        }
        return res.status(200).json(chat)
    })
}
module.exports.addMember=function(req,res){
    // let users=[]
    // for(let i=0;i<req.body.mewMembers.length;i++){
    //     users.push()
    // }
    Chat.findOne({
        _id:req.body._id,
        groupAdmins:req.user._id
    })
    .then(chat=>{
        if(chat.users.includes(req.body.newMember) || !chat){
            return res.status(400).json({message:'user is already in the chat or chat does not exist'})
        }
        chat.users.push(req.body.newMember)
        chat.save()
        return res.status(200).json({message:'suuccessfully added new member'})
    }).catch(err=>{
        return res.status(500).json({message:'some error occured'})
    })
}

module.exports.removeMember=function(req,res){
    //req.body.chatId
    //req.body.memberId
    Chat.updateOne({
        _id:req.body.chatId,
        groupAdmins:req.user._id,
        createdBy:{$ne:req.body.memberId}
    },
    {
        $pull:{users:req.body.memberId}
    },
    {new:true}
).then(chat=>{
    if(!chat){return res.status(400).json({message:'no such user found'})}
    return res.status(200).json({message:'removed',chat})
}).catch(err=>{return res.status(500).json({message:'internal error'})})
}

module.exports.bringNew=function(req,res){
    Chat.findById(req.query._id)
    .populate('groupAdmins','-password')
    .populate('createdBy','-password')
    .populate('users', '-password')
    .populate({
        path: 'latestMessage',
        populate: {
            path: 'sender',
            select: 'name pic contactNumber'
        }
    })
    .then(chat=>{
        if(chat){
            return res.status(200).json({chat:chat})
        }return res.status(400).json({message:'Could not find'})
    }).catch(err=>{
        return res.status(500).json({message:err.message})
    })
}

module.exports.getAi=async function(req,res){
    const AiBot=await Chat.findOne({chatName:'4f6e7a6b7e2d8a9c3b4d5e1f6a7c8b9d0e1f2a3b4c5d6e7f8a9c0d1e2f3a4b5c'})
    if(AiBot){
        AiBot.chatName='Ai Bot'
        return res.status(200).json({message:'found the Bot',AiBot:AiBot})
    }
    await Chat.create({
        chatName:'4f6e7a6b7e2d8a9c3b4d5e1f6a7c8b9d0e1f2a3b4c5d6e7f8a9c0d1e2f3a4b5c',
        pic:'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg?size=338&ext=jpg&ga=GA1.1.2008272138.1722297600&semt=ais_hybrid',
        users:[],
    })
    const newAi=await Chat.find({chatName:'4f6e7a6b7e2d8a9c3b4d5e1f6a7c8b9d0e1f2a3b4c5d6e7f8a9c0d1e2f3a4b5c'})
    newAi.chatName='Ai Bot'
    return res.status(200).json({message:'created new one',AiBot:newAi})
}