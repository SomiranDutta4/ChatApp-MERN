import React, { createContext, useEffect, useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'
const ENDPOINT = 'http://localhost:2000'
var socket;
const AppContext = createContext()


const ContextProvider = ({ children }) => {
  // const navigate=useNavigate()
  let UserData = localStorage.getItem('UserData')
  let UserD
  try {
    UserD = JSON.parse(UserData)
  } catch (error) {
    UserD = ''
  }

  const [AllChats, setChats] = useState([])
  const [LoadedChats, setLoadedChats] = useState([])
  const [clickedChat, setClicked] = useState('')
  const [User, setUser] = useState(UserD)
  const [isLoading, setLoading] = useState(false)
  const [isSending, setSending] = useState(false)
  const [AccountPage, setAccountPage] = useState(false)
  const [LocalFound, setLocalFound] = useState([])
  const [socketConnected, setSocketConnected] = useState(false);
  const [showingBot, setShowingBot] = useState(false)
  const [messageLoading, setMsgLoadig] = useState(false)
  const [messages, setMessages] = useState([]);
  const [Alert, setAlert] = useState(null);
  const messageEnd=useRef(null);

  const NewMEssageHandler = (Message, fromMe) => {
    if (clickedChat && messages.length > 0 && messages[messages.length - 1]._id === Message._id) {
      return
    }
    if (clickedChat&& Message.chat === clickedChat._id) {
      let newMessages = messages
      if (clickedChat && messages.length > 0 && messages[messages.length - 1].status && messages[messages.length - 1].status === "sending") {
        newMessages[newMessages.length - 1] = Message
        setMessages([newMessages]);
      } else {
        //   newClicked.messages.push(Message)
        setMessages([...messages, Message]);
      }
    }
    if(messageEnd.current){
      messageEnd.current.scrollIntoView()
  }
    //   setClicked(newClicked);

    //   let allLoaded=LoadedChats
    // let index = -1
    let arrangedChats = AllChats
    //   let unseenCount=0
    for (let i = 0; i < AllChats.length; i++) {
      if (AllChats[i]._id === Message.chat) {
        if(!fromMe){
          arrangedChats[i].latestMessage=Message;
          arrangedChats[i].unseenMsg=true;
        }
        arrangedChats[i].latestMessage = Message
        let firstChat = arrangedChats.splice(i, 1)[0]
        arrangedChats.unshift(firstChat)
      }
    }
    setChats(arrangedChats)
  }
  let SeeMessage = async () => {
    let arrangedChats=AllChats;
    for (let i = 0; i < AllChats.length; i++) {
      if (AllChats[i]._id === clickedChat._id) {
        arrangedChats[i].unseenMsg=false;  
        setChats(arrangedChats);      
      }
    }
    setSending(true)
    let seenUrl = `http://localhost:2000/message/see/?token=${User.token}`
    try {
      let result = await fetch(seenUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json', // Specify content type JSON
        },
        body: JSON.stringify({
          chatId: clickedChat._id
        })
      })
      let data = await result.json()
      setSending(false)
      const to = messages[messages.length - 1].sender
      let details = {
        to: to,
        UserId: User._id,
        userPic: User.pic,
        userName: User.name,
        chatId: clickedChat._id,
        number: data.number
      }
      socket.emit('see Message', details)
      return data.number
    } catch (error) {
      console.log(error)
      return 0
    }
  }

  useEffect(() => {
    if (!socket && User) {
      socket = io(ENDPOINT)
      socket.emit('setup', User)
      socket.on('connected', () => setSocketConnected(true))
    }
  })


  return (
    <AppContext.Provider value={{
      AllChats, setChats, isLoading, setLoading, LocalFound, setLocalFound, NewMEssageHandler, messageLoading, setMsgLoadig,
      LoadedChats, setLoadedChats, User, setUser, isSending, setSending, SeeMessage, showingBot, setShowingBot,messageEnd,Alert,setAlert,
      clickedChat, setClicked, AccountPage, setAccountPage, socket, socketConnected, setSocketConnected, messages, setMessages
    }}>
      {children}
    </AppContext.Provider>
  )
}


export { ContextProvider, AppContext }