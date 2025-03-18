import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState, useContext } from 'react'
import { AppContext } from '../../Context/ContextProvider'

const IndChat = ({ pic, setloadAll, _id, chatName, isGroupChat, lmContent, lmSender, lmSentAt, setSingleChat, unreadMsg, senderId }) => {
  const [timePassed, setTime] = useState('')

  let {
    User, setUser, LoadedChats, clickedChat,URL,
    setClicked, setChats, setShowingBot, setMessages
  } = useContext(AppContext)
  const navigate = useNavigate()

  const [latestMsgSender, setSender] = useState(lmSender)
  async function clickedOne() {

    // let foundLocal=false

    if (!User || !User.token) {
      localStorage.removeItem('UserData')
      setUser('')
      // setLoadedChats([])
      navigate('/Login')
      return
    }
    if (clickedChat._id == _id) {
      return;
    }
    setloadAll(false)
    setSingleChat(true)
    setShowingBot(false)

    setClicked('')
    setSingleChat(true)


    let ChatURL = URL+`/chat/get/one/?_id=${_id}&chatName=${chatName}&token=${User.token}`
    let response = await fetch(ChatURL, {
      method: 'GET',
    })

    if (response.status == 401) {
      setUser('')
      setChats([])
      navigate('/Login')
    } else if (response.status == 500) {
      console.log('server issue')
    } else if (response.status == 200) {
      let data = await response.json()
      var number = User.contactNumber;
      var users = []
      for (let i = 0; i < data.users.length; i++) {
        if (isGroupChat === true) {
          users.push(data.users[i].name)
        } else if (data.users[i].contactNumber !== User.contactNumber) {
          users.push(data.users[i].name)
          number = data.users[i].contactNumber
        }
      }
      if (isGroupChat === true) {
        number = users
      }
      let latestMessageSeen = false

      let newChat = {
        'pic': pic,
        'number': number,
        'isGroupChat': data.isGroupChat,
        "chatName": data.chatName,
        "_id": data._id,
        // "messages":data.messages,
        'users': data.users,
        'groupAdmins': data.groupAdmins,
        'createdBy': data.createdBy,
        'latestMessageSeen': latestMessageSeen
      }
      setMessages(data.messages);
      let Chats = LoadedChats
      Chats.push(newChat)
      // setLoadedChats(Chats)
      setloadAll(false)
      setClicked(newChat)
      setSingleChat(true)
      //i think this is redundant
    }
  }

  useEffect(() => {

    let createdAt = new Date(lmSentAt)
    createdAt = createdAt.getTime()
    const now = Date.now()
    let difference = now - createdAt
    const minute = Math.floor(difference / (1000 * 60))
    const hours = Math.floor(difference / (1000 * 60 * 60))
    const days = Math.floor(difference / (1000 * 60 * 60 * 24))
    if (hours <= 1) {
      setTime(minute + ' minutes ago')
    } else if (hours > 1 && hours < 24) {
      setTime(hours + ' hours ago')
    } else {
      setTime(days + ' days ago')
    }
    if (timePassed === '0 minutes ago') {
      setTime('Now')
    }
    if (!lmSentAt) { setTime('') }

  }, [lmSentAt])

  useEffect(() => {
    if (User) {
      if (senderId === User._id) {
        setSender('you')
      }
    }
  }, [])

  return (
    <div onClick={clickedOne} id={_id} className='AllChatsContainer'>
      <div className='pfpDiv'>
        <div className='pfp'>
          <img className='dp' src={pic}></img>
        </div>
      </div>
      <div className='indvidualChats'>
        <div className='chatNameDiv'>
          <p className='chatName'>{chatName}</p>
        </div>
        <div className='latestmsgDiv'>
          <div className='chatElelmInd'>
            {lmSender &&
              <span className='sender LMdetails'>{latestMsgSender}:</span>
            }
            {lmContent &&
              <span className='latestMessage LMdetails'>{lmContent}</span>
            }
            {!lmSender && !lmContent &&
              <>
                <span className='LMdetails StartMsg'>Start sending Messages</span>
              </>
            }
          </div>
          <div className='chatElelmInd'>

            <span className='sentAt LMdetails'>
              {timePassed}
            </span>
            {unreadMsg === true &&
              <div className='unreadMsg-chat'></div>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default IndChat