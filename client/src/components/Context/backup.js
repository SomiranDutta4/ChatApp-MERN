import React,{createContext,useEffect,useState} from 'react'
// import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'
const ENDPOINT='http://localhost:2000'
var socket;
const AppContext=createContext()


const ContextProvider = ({children}) => {
    // const navigate=useNavigate()
    let UserData=localStorage.getItem('UserData')
    let UserD
    try {
        UserD=JSON.parse(UserData)
    } catch (error) {
        UserD=''        
    }

    const [AllChats,setChats]=useState([])
    const [LoadedChats,setLoadedChats]=useState([])
    const [clickedChat,setClicked]=useState('')
    const [User,setUser]=useState(UserD)
    const [isLoading,setLoading]=useState(false)
    const [isSending,setSending]=useState(false)
    const [AccountPage,setAccountPage]=useState(false)
    const [LocalFound,setLocalFound]=useState([])
    const [socketConnected, setSocketConnected] = useState(false);
    const [showingBot,setShowingBot]=useState(false)
    const [messageLoading,setMsgLoadig]=useState(false)
    const [messages,setMessages]=useState([]);

    const NewMEssageHandler=(Message)=>{
      if(clickedChat && messages.length>0 && messages[messages.length-1]._id===Message._id){
          return
      }
      let newClicked=clickedChat

      if(Message.chat===clickedChat._id){   
          if(clickedChat && clickedChat.messages.length>0 && clickedChat.messages[clickedChat.messages.length-1].status && clickedChat.messages[clickedChat.messages.length-1].status==="sending"){
              newClicked.messages[newClicked.messages.length-1]=Message
          }else{
              newClicked.messages.push(Message)
          }
      }
      setClicked(newClicked);

    //   let allLoaded=LoadedChats
      let index=-1
      let arrangedChats=AllChats
    //   let unseenCount=0
      for(let i=0;i<AllChats.length;i++){
          if(AllChats[i]._id===Message.chat){
              index=i
          }

        //   if(LoadedChats[i] && LoadedChats[i]._id===Message.chat){

        //       if(LoadedChats[i].messages[LoadedChats[i].messages.length-1].status && LoadedChats[i].messages[LoadedChats[i].messages.length-1].status==='sending'){
        //       // allLoaded[i]=clickedChat
        //       allLoaded[i].messages[allLoaded[i].messages.length-1]=Message
        //      }else if(LoadedChats[i].messages[LoadedChats[i].messages.length-1]._id!==Message._id){
        //           allLoaded[i].messages.push(Message)
        //       }
        //   }
      }
      if(index>=0){
        // unseenCount=AllChats[index].unseenMsg
    //   if(Message.sender._id!==User._id && Message.chat!==clickedChat._id){
        //   arrangedChats[index].unseenMsg=unseenCount+1
    //   }
      arrangedChats[index].latestMessage=Message
      if(index!==-1 && index!==0){
          let firstChat=arrangedChats.splice(index,1)[0]
          arrangedChats.unshift(firstChat)
      }}
      setChats(arrangedChats)
    //   setClicked(newClicked)
    //   setLoadedChats(allLoaded)
  }
  let SeeMessage=async()=>{
    setSending(true)
    let seenUrl=`http://localhost:2000/message/see/?token=${User.token}`
    try {
        let result=await fetch(seenUrl,{
            method:'PATCH',
            headers: {
                'Content-Type': 'application/json', // Specify content type JSON
              },
            body:JSON.stringify({
                chatId:clickedChat._id
            })
        })
        let data=await result.json()
        setSending(false)
        const to=clickedChat.messages[clickedChat.messages.length-1].sender
        let details={
            to:to,
            UserId:User._id,
            userPic:User.pic,
            userName:User.name,
            chatId:clickedChat._id,
            number:data.number
        }
        socket.emit('see Message',details)
        return data.number
    } catch (error) {
        console.log(error)
        return 0
    }
}

  useEffect(()=>{
    if(!socket && User){
    socket=io(ENDPOINT)
    socket.emit('setup',User)
    socket.on('connected',()=>setSocketConnected(true))
   }
  })


  return (
    <AppContext.Provider value={{
        AllChats,setChats,isLoading,setLoading,LocalFound,setLocalFound,NewMEssageHandler,messageLoading,setMsgLoadig,
        LoadedChats,setLoadedChats,User,setUser,isSending,setSending,SeeMessage,showingBot,setShowingBot,
        clickedChat,setClicked,AccountPage,setAccountPage,socket,socketConnected,setSocketConnected,messages,setMessages
    }}>
        {children}
    </AppContext.Provider>
  )
}


export {ContextProvider,AppContext}