const jwt=require('jsonwebtoken')


const Messages=[
  {
    sender: "1243278r9udij332890klk-0", // User 1
    content: "Hey, how's it going?",
    chat: "3245vvc34rgg4r4hur89", // Chat 1
    readBy: ["60db4aa47b08360015499b4a", "60db4aa47b08360015499b4b"], // User 1 and User 2
    createdAt: new Date("2024-06-30T09:00:00Z")
  },
  {
    sender: "60db4aa47b08360015499b4b", // User 2
    content: "Not bad, thanks! How about you?",
    chat: "1243278r9udij332890klk-0", // Chat 1
    readBy: ["60db4aa47b08360015499b4a", "60db4aa47b08360015499b4b"], // User 1 and User 2
    createdAt: new Date("2024-06-30T09:05:00Z")
  },
  {
    sender: "60db4aa47b08360015499b4c", // User 3
    content: "Anyone up for coffee?",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c"], // User 3
    createdAt: new Date("2024-06-30T09:10:00Z")
  },
  {
    sender: "1243278r9udij332890klk-0", // User 4
    content: "I'm in!",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d"], // User 3 and User 4
    createdAt: new Date("2024-06-30T09:15:00Z")
  },
  {
    sender: "60db4aa47b08360015499b4e", // User 5
    content: "Sure, let's meet at the usual place.",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d", "60db4aa47b08360015499b4e"], // User 3, User 4, and User 5
    createdAt: new Date("2024-06-30T09:20:00Z")
  },
  {
    sender: "60db4aa47b08360015499b4f", // User 6
    content: "Count me in too!",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d", "60db4aa47b08360015499b4e", "60db4aa47b08360015499b4f"], // User 3, User 4, User 5, and User 6
    createdAt: new Date("2024-06-30T09:25:00Z")
  },
  {
    sender: "1243278r9udij332890klk-0", // User 7
    content: "What time are we meeting?",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d", "60db4aa47b08360015499b4e", "60db4aa47b08360015499b4f", "60db4aa47b08360015499b50"], // User 3, User 4, User 5, User 6, and User 7
    createdAt: new Date("2024-06-30T09:30:00Z")
  },
  {
    sender: "60db4aa47b08360015499b51", // User 8
    content: "I can't make it today, sorry.",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d", "60db4aa47b08360015499b4e", "60db4aa47b08360015499b4f", "60db4aa47b08360015499b50", "60db4aa47b08360015499b51"], // User 3, User 4, User 5, User 6, User 7, and User 8
    createdAt: new Date("2024-06-30T09:35:00Z")
  },
  {
    sender: "60db4aa47b08360015499b52", // User 9
    content: "Maybe next time!",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d", "60db4aa47b08360015499b4e", "60db4aa47b08360015499b4f", "60db4aa47b08360015499b50", "60db4aa47b08360015499b51", "60db4aa47b08360015499b52"], // User 3, User 4, User 5, User 6, User 7, User 8, and User 9
    createdAt: new Date("2024-06-30T09:40:00Z")
  },
  {
    sender: "1243278r9udij332890klk-0", // User 10
    content: "Have fun, guys!",
    chat: "3245vvc34rgg4r4hur89", // Chat 2
    readBy: ["60db4aa47b08360015499b4c", "60db4aa47b08360015499b4d", "60db4aa47b08360015499b4e", "60db4aa47b08360015499b4f", "60db4aa47b08360015499b50", "60db4aa47b08360015499b51", "60db4aa47b08360015499b52", "60db4aa47b08360015499b53"], // User 3, User 4, User 5, User 6, User 7, User 8, User 9, and User 10
    createdAt: new Date("2024-06-30T09:45:00Z")
  }
]

const chats = [
    {
      _id:'3245vvc34rgg4r4hur89',
      chatName: "Family Chat",
      isGroupChat: true,
      users: [
        "user1",
        "user2",
        "me"
      ],
      latestMessage:{ content:"message1",sender:'user1',createdAt:'10:00pm'},
      groupAdmin: "admin1"
    },
    {
      _id:'3245vvc34rggasfaf329',
      chatName: "user",
      isGroupChat: false,
      users: [
        "user4",
        "me"
      ],
      latestMessage:{ content:"message2",sender:'user4',createdAt:'10:00pm'},
    },
    {
      _id:'3245vvc34rgg4asfwr34werfds',
      chatName: "Work Group",
      isGroupChat: true,
      users: [
        "user6",
        "user7",
        "me"
      ],
      latestMessage:{ content:"message3",sender:'me',createdAt:'10:00pm'},
      groupAdmin: "admin3"
    },
    {
      _id:'3245vvc34rgg4r4hur8932rd',
      chatName: "Personal Diary",
      isGroupChat: false,
      users: [
        "me",
      ],
      latestMessage:{ content:"message4",sender:'me',createdAt:'10:00pm'},
    },
    {
      _id:'3245vvc34rgg4r4hsdfwe34',
      chatName: "Study Group",
      isGroupChat: true,
      users: [
        "user10",
        "user11",
        "user12",
        "me"
      ],
      latestMessage:{ content:"message5",sender:'user10',createdAt:'10:00pm'},
      groupAdmin: "admin5"
    },
    {
      _id:'3245vvc34rgg4r4husdf343',
      chatName: "Gaming Buddies",
      isGroupChat: false,
      users: [
        "user14",
        "user15",
      ],
      latestMessage:{ content:"message6",sender:'me',createdAt:'10:00pm'},
    }
  ];
  
  

const express=require('express')
const Router=express.Router()

Router.get('/',(req,res)=>{
    return res.status(200).json({hero})
})

Router.post('/verify',(req,res)=>{
    jwt.verify(req.body.token,'super-secret',function(err,decoded){
        if(err){
            return res.status(400).json({err,message:'please login again'})
        }
        return res.status(200).json({decoded})
    })
})
Router.get('/getChats/',(req,res)=>{
  jwt.verify(req.query.token,'super-secret',function(err,decoded){
    if(err){
      return res.status(400).json({err,message:'please login again'})
    }
      return res.status(200).json({chats})
    
  })
})
let Message={
  messages:Messages,
  id:'3245vvc34rgg4r4hur89',
  chatName:'John Doe'
}
Router.get('/get/Onechat/',(req,res)=>{
  jwt.verify(req.query.token,'super-secret',function(err,decoded){
    if(err){
      return res.status(400).json({err,message:'please login again'})
    }
      return res.status(200).json({Message})
  })
})

let User1={
  _id:'1243278r9udij332890klk-0',
  name: "John Doe",
  email: "johndoe@example.com",
  password: "password123",
  pic: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  isAdmin: false
}
let createToken=()=>{
  const token=jwt.sign({
    'name':'Somiran',
    'pass':'123'
    },'super-secret',{expiresIn:'1h'}
  )
  return token
}


Router.get('/login/',(req,res)=>{
  return res.status(200).json({User:User1,token:createToken()})
})

module.exports=Router