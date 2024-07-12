const Message=require('../Models/Message')
const Chat=require('../Models/Chat')
const User=require('../Models/User')
const mongoose=require('mongoose')

module.exports.fetchAllChats=function(req,res){
    Chat.find({$or:[
        {'users':req.query._id},
        {'users._id':req.query._id}
    ]}).select('-messages')
    .populate('users','-password')
    .populate('latestMessage.sender','name pic contactNumber')
    .then(chats=>{
        // chats.save()
        if(chats.length==0){
            return res.status(200).json({"chats":[],message:'not chatted yet'})
        }
        return res.status(200).json({"chats":chats,message:'fetched successfully'})
    })
    .catch(err=>{
        return res.status(500).json({message:'error in server Side'})
    })
}

module.exports.ClickedChat=function(req,res){
    // req.query._id,
    Chat.findOne({_id:req.query._id})
    .populate('users','-password')
    .populate('messages.sender','name pic contactNumber')
    .populate('messages.readBy','-password')
    .populate('createdBy','-password')
    .populate('groupAdmins','-password')
    // .populate('latestMessage.sender','name pic contactNumber')
    .then(chat=>{
        // console.log('chat is here u fucking moron:...',chat)
        if(!chat){
            return res.status(400).json({message:'send the first message'})
        }
        chat.chatName=req.query.chatName
        return res.status(200).json(chat)
    }).catch(err=>{
        return res.status(500).json({message:'could not find Chat'})
    })
}

module.exports.createNew=function(req,res){
    console.log(req.body)
    // console.log()
    if(req.body._id==req.user._id){
        Chat.findOne({
            users:{
                $size:1,
                $elemMatch:{$eq:req.body._id}
            }
        })
        .populate('users','-password')
        .populate('messages.sender','-password')
        .populate('latestMessage.sender','-password')
        .then(chat=>{
            if(chat){
                console.log('1')
                return res.status(200).json({
                messages:chat.messages,
                chatName:req.body.chatName,
                pic:req.body.pic,
                isGroupChat:false,
                number:req.body.number,
                _id:chat._id
                })   
            }else{
                console.log('2')

                return res.status(200).json({
                    messages:[],
                    chatName:req.body.chatName,
                    isGroupChat:false,
                    contactNumber:req.body.number,
                    pic:req.body.pic,
                    reqId:req.body._id,
                    _id:new mongoose.Types.ObjectId()
                })
            }
        })
    }else{
        Chat.findOne({'users':{
            $all:[req.body._id,req.user._id]
        }}).then(chat=>{
            if(chat){
                console.log('3')
                return res.status(200).json({
                    messages:chat.messages,
                    chatName:req.body.chatName,
                    isGroupChat:false,
                    users:chat.users,
                    number:req.body.number,
                    _id:chat._id
                })
            }
            console.log('4')

            return res.status(200).json({
                messages:[],
                chatName:req.body.chatName,
                isGroupChat:false,
                contactNumber:req.body.number,
                pic:req.body.pic,
                reqId:req.body._id,
                _id:new mongoose.Types.ObjectId()
            })
        })
    }
}

module.exports.searchUser=function(req,res){
    User.findOne({contactNumber:req.query.number}).then(user=>{
        if(user){
            return res.status(200).json({
                number:user.contactNumber,
                name:user.name,
            })
        }else{
            return res.status(400).json({message:'nothing found'})
        }
    }).catch(err=>{
        return res.status(500).json({message:'error:500'})   
    })
}

module.exports.createGroup=async function(req,res){
    console.log(req.body)
    let newChatid=new mongoose.Types.ObjectId()
    let users=[req.user._id]
    for(let i=0;i<req.body.selectedMembers.length;i++){
        users.push(req.body.selectedMembers[i])
    }
    let Admin=[req.user._id]
    try {
        let newGroup=await Chat.create({
            _id:newChatid,
            chatName:req.body.groupName,
            isGroupChat:true,
            pic:'https://cdn.pixabay.com/photo/2020/05/29/13/26/icons-5235125_1280.png',
            users:users,
            messages:[],
            latestMessage:{},
            createdBy:req.user._id,
            groupAdmins:Admin
        })
        console.log('group cre:',newGroup)
    } catch (error) {
        console.log(error)
    }
    try {
        let Groupchat=await Chat.findById(newChatid)
        .populate('users','-password')
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

module.exports.addAdmin=function(req,res){
    //req.body.newAdmin: _id of user
    //req.bdy.chatId
    Chat.findOne({_id:req.body._id,users:req.body.newAdmin,groupAdmins:req.user._id}).then(chat=>{
        chat.groupAdmins.push(req.body.newAdmin)
    }).populate('groupAdmins')
    return res.json({message:'added new admin'})
}
module.exports.removeAdmin=function(req,res){
    //req.Admin
    //req.bdy.chatId
    Chat.findoneAndUpdate(
        {_id:req.body._id,users:req.body.Admin,groupAdmins:req.user._id},
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
    //multiple mambers
    //req.body.newMember
    //added by
    //req.body._id
    let users=[]
    for(let i=0;i<req.body.mewMembers.length;i++){
        users.push()
    }
    Chat.findOne({
        _id:req.body._id,
        groupAdmins:req.user._id
    })
    .then(chat=>{
        for(let i=0;i<req.body.mewMembers.length;i++){
            chat.users.push(req.body.newMembers[i])
        }
        // chat.users.push(req.body.newMember)
        chat.save()
    }).populate('users')
}

module.exports.removeMember=function(req,res){
    //req.query._id
    //req.body.adminId
    //req.query.removed Member
    Chat.findoneAndUpdate({
        _id:req.body._id,
        groupAdmins:req.user._id,
        createdBy:{$ne:req.body.member}
    },
    {
        $pull:{users:req.body.member}
    },
    {new:true}
).then(chat=>{
    if(!chat){return res.status(400).json({message:'no such user found'})}
    return res.status(200).json({message:'removed',chat})
}).catch(err=>{return res.status(500).json({message:'internal error'})})
}

// let Message={
//     messages:Messages,
//     id:'3245vvc34rgg4r4hur89',
//     chatName:'John Doe'
//   }
// module.exports.CreateGroupChat=function(req,res){
// }

// messages:[messageSchema],

// const messageSchema = mongoose.Schema(
//     {
//       sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//       content: { type: String, trim: true },
//       readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
//     },
//     { timestamps: true }
//   );
  
// chatName: { type: String, trim: true },
// isGroupChat: { type: Boolean, default: false },
// users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
// latestMessage: {
//   type: mongoose.Schema.Types.ObjectId,
//   ref: "Message",
// },
// groupAdmin: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
// },
// { timestamps: true }
// );