import React, { useEffect,useContext } from 'react'
import { AppContext } from '../Context/ContextProvider'

const Socket = () => {
    const {User,clickedChat,socket,LoadedChats,AllChats,
        SeeMessage,NewMEssageHandler,setLoadedChats,setClicked,setChats}=useContext(AppContext)
    

    useEffect(()=>{
        if(!socket){
           return 
        }
         socket.on("message recieved",(newMessage)=>{
          const newChat=clickedChat;
            if(clickedChat&& clickedChat.messages[clickedChat.messages.length-1]._id===newMessage.latestMessage._id){
              console.log(clickedChat);
              return
            }else{
              console.log(newChat);
              NewMEssageHandler(newMessage.latestMessage)
            //         if(clickedChat && newMessage._id===clickedChat._id){
            //         let number=SeeMessage()
            //         let details={
            //             UserId:User._id,
            //             userPic:User.pic,
            //             userName:User.name,
            //             chatId:clickedChat._id,
            //             number:number
            //         }
            //         socket.emit('see Message',details)
            //     }
            }
         })
      })
      useEffect(()=>{
        if(!socket){
            return 
        }
        socket.on('seen message',(details)=>{
            console.log('why 3')
            let newLoaded=LoadedChats
            newLoaded.forEach(obj => {
                if(obj._id===clickedChat._id){
                    let length=obj.messages.length
                    for(let i=length-1;i>=length-details.number;i--){
                        obj.messages[i].readBy.push({
                            _id:details.UserId,
                            name:details.userName,
                            pic:details.userPic
                        })
                    }
                }
            });
            setLoadedChats(newLoaded)
    
            if(details.chatId===clickedChat){
                LoadedChats.forEach(obj=>{
                    if(obj._id===clickedChat._id){
                        setClicked(obj)
                    }
                })
            }
        })
    })
    
    useEffect(()=>{
      if(!socket){
        return 
    }
      socket.on('added member',async (groupDetails)=>{
        let newChats=AllChats
        let newChatUrl=`http:localhost:2000/chat/new/fetchNew/?token=${User.token}&_id=${groupDetails.chatId}`
        let response=await fetch(newChatUrl)
        let data=await response.json()
        newChats.unshift(data.chat)
        setChats(newChats)
      })
    })
    useEffect(()=>{
      if(!socket){
        return 
    }
      socket.on('removed member', groupDetails=>{
        let newChats=AllChats
        newChats=newChats.filter(chat=>chat._id!==groupDetails.chatId)
        setChats(newChats)
      })
    })
    
    useEffect(()=>{
      if(!socket){
        return 
    }
      socket.on('added admin', groupDetails=>{
        let newLoadedChats=LoadedChats
        newLoadedChats.forEach(chat=>{
          if(chat._id===groupDetails.chatId){
            chat.groupAdmins.push(User)
            if(clickedChat._id===chat._id){
              setClicked(chat)
            }
          }
        })
        setLoadedChats(newLoadedChats)
      })
    })
    
    useEffect(()=>{
      if(!socket){
        return 
    }
      socket.on('removed admin', groupDetails=>{
        let newLoadedChats=LoadedChats
        newLoadedChats.forEach(chat=>{
          if(chat._id===groupDetails.chatId){
            let newAdmins=chat.groupAdmins.filter(user=>user._id!==User._id)
            chat.groupAdmins=newAdmins
            if(clickedChat._id===chat._id){
              setClicked(chat)
            }
          }
        })
        setLoadedChats(newLoadedChats)
      })
    })
    

  return (
    <div></div>
  )
}

export default Socket
