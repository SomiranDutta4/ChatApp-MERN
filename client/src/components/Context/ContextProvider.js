import React, { createContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'
// const ENDPOINT = 'http://localhost:2000'
const ENDPOINT='https://chatapp-mern-cq2n.onrender.com'
var socket;
const AppContext = createContext()


const ContextProvider = ({ children }) => {
    const navigate = useNavigate()
  // const navigate=useNavigate()
  let UserData = localStorage.getItem('UserData')
  let UserD
  try {
    UserD = JSON.parse(UserData)
  } catch (error) {
    UserD = ''
  }

  const URL = ENDPOINT;
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
  const messageEnd = useRef(null);

  const NewMEssageHandler = (Message, fromMe) => {
    if (clickedChat && messages.length > 0 && messages[messages.length - 1]._id === Message._id) {
      return;
    }

    // Update Messages
    if (clickedChat && Message.chat === clickedChat._id) {
      setMessages((prevMessages) => {
        let newMessages = [...prevMessages];

        if (newMessages.length > 0 && newMessages[newMessages.length - 1]?.status === "sending") {
          newMessages[newMessages.length - 1] = Message;
        } else {
          newMessages.push(Message);
        }

        return newMessages;
      });
    }

    // Update Chats
    setChats((prevChats) => {
      let arrangedChats = [...prevChats];

      for (let i = 0; i < arrangedChats.length; i++) {
        if (arrangedChats[i]._id === Message.chat) {
          let updatedChat = { ...arrangedChats[i], latestMessage: Message };

          if (!fromMe) {
            updatedChat.unseenMsg = true; // Ensure unseen message flag updates correctly
          }

          arrangedChats.splice(i, 1);
          arrangedChats.unshift(updatedChat);
          break; // Exit loop after updating the relevant chat
        }
      }

      return arrangedChats; // Ensure new reference for state update
    });
  };

  let SeeMessage = async () => {
    let arrangedChats = AllChats;
    for (let i = 0; i < AllChats.length; i++) {
      if (AllChats[i]._id === clickedChat._id) {
        arrangedChats[i].unseenMsg = false;
        setChats(arrangedChats);
        break;
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
      return 0;
    }
  }

  useEffect(() => {
    if (!socket && User) {
      socket = io(ENDPOINT)
      socket.emit('setup', User)
      socket.on('connected', () => setSocketConnected(true))
    }
  })
  let getChats = async () => {
    if (!User || !User.token || !User._id) {
      setUser('')
      setChats([])
      localStorage.removeItem('UserData')
      navigate('/Login')
      setLoading(false)
      return
    }

    let AuthUrl = URL + `/user/auth/?token=${User.token}`;
    let url = URL + `/chat/get/all/?_id=${User._id}&token=${User.token}`;

    let isFoundLocal = false

    if (AllChats && AllChats != '') {
      isFoundLocal = true
    }

    if (isFoundLocal == true) {
      try {
        let response = await fetch(AuthUrl)
        if (response.status == 200) {

        } else if (response.status == 401) {
          localStorage.removeItem('UserData')
          setUser('')
          setChats([])
          navigate('/Login')
        } else {
          setLoading(true)
        }
        return
      } catch (error) {
      }
    } else {
      setLoading(true)
    }

    try {
      let response = await fetch(url, {
        method: 'GET'
      })
      if (response.status === 401) {
        localStorage.removeItem('UserData')
        setUser('')
        setChats('')
        navigate('/Login')
        return
      } else if (response.status === 200) {
        let newchats = await response.json()
        newchats = newchats.chats
        newchats.forEach(chat => {
          if (chat.chatName === 'randomXYZchatApp.123456789@#$%^&*()_+') {
            if (chat.users[0]._id == User._id && chat.users.length != 1) {
              chat.pic = chat.users[1].pic
              chat.chatName = chat.users[1].name
            } else {
              chat.pic = chat.users[0].pic
              chat.chatName = chat.users[0].name
            }
          }
          if (chat.latestMessage.readBy && !chat.latestMessage.readBy.includes(User._id)) {
            chat.unseenMsg = true;
          }
        });

        newchats.sort((a, b) => {
          let dateA = new Date(a.latestMessage.createdAt);
          let dateB = new Date(b.latestMessage.createdAt);
          return dateB - dateA;
        });
        setChats(newchats)
        setLocalFound(newchats)
      } else {
        return
      }
      setLoading(false)
    } catch (error) {
      localStorage.removeItem('UserData')
      setUser('')
      navigate('/Login')
    }
  }


  return (
    <AppContext.Provider value={{
      AllChats, setChats, isLoading, setLoading, LocalFound, setLocalFound, NewMEssageHandler, messageLoading, setMsgLoadig, URL,
      LoadedChats, setLoadedChats, User, setUser, isSending, setSending, SeeMessage, showingBot, setShowingBot, messageEnd,
      clickedChat, setClicked, AccountPage, setAccountPage, socket, socketConnected, setSocketConnected, messages, setMessages,getChats
    }}>
      {children}
    </AppContext.Provider>
  )
}


export { ContextProvider, AppContext }