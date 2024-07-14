import React, { useEffect, useState,useRef,useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChatStyle.css'
import OneMessage from './OneMessage'
import { AppContext } from '../Context/ContextProvider'
import LoadingChatPage from './LoadingChatPage'
import ChatDetails from './ChatDetails'

const Onechat = ({setSingleChat,setloadAll}) => {
    const [showChatDetails,setSHowChat]=useState(false)
    // isSingleChat,setSingleChat
    const {
        clickedChat,setClicked,User,setUser,setLoading,loadingChat,setLoadingChat,
        LoadedChats,setLoadedChats,AllChats,setChats,setSending
    }=useContext(AppContext)

    let length=clickedChat.messages.length
    const navigate=useNavigate()
   
    const [message,setMessage]=useState('')
    // const [isTyping,setTyping]=useState(false)

    const changeMessage=(event)=>{
        setMessage(event.target.value)
        // setTyping(true)
    }
    const messageEnd=useRef(null)
    

    let SeeMessage=()=>{
        let seenUrl=`http://localhost:2000/message/see/?token=${User.token}`
        try {
            fetch(seenUrl,{
                method:'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                  },
                body:JSON.stringify({
                    chatId:clickedChat._id
                })
            })
        } catch (error) {
            console.log(error)
        }
    }



    const sendMessage=async()=>{
        let newMsgessage=message
        setMessage('')
        let isLocal=false

        let newMsg={
            content:newMsgessage,
            createdAt:new Date(),
            sender:User._id,
            readBy:[User],
            status:"sending"
        }
        let thisChat=clickedChat
        let index=clickedChat.messages.length
        thisChat.messages.push(newMsg)
        setClicked(thisChat)
        // let AllLoadedChats=LoadedChats
        setSending(true)

        let chatIndex=-1;
        let partialChats=LoadedChats
        for(let i=0;i<LoadedChats.length;i++){
           if(LoadedChats._id===clickedChat._id){
            chatIndex=i;
            partialChats[i]=clickedChat
            setLoadedChats(partialChats)
            isLocal=true
            break
           }
        }

    if(!User || !User.token || !User._id || User===''){
            setUser('')
            setClicked('')
            setSingleChat(false)
            localStorage.removeItem('UserData')
            navigate('/Login')
            setLoading(false)
            return
    }

    const messageUrl=`http://localhost:2000/message/send/?token=${User.token}`
    let response=await fetch(messageUrl,{
        method:'PATCH',
        headers: {
            'Content-Type': 'application/json', // Specify content type JSON
          },  
        body:JSON.stringify({
            content:newMsgessage,
            sender:User.name,
            _id:User._id,
            chat:clickedChat
        })
    })
    let data=await response.json()
    let newChat={
        pic:clickedChat.pic,
        _id:clickedChat._id,
        chatName:clickedChat.chatName,
        isGroupChat:clickedChat.isGroupChat,
        users:clickedChat.users,
        latestMessage:data.chat
    }
    let newMessage=data.chat
    
    if(response.status==300){
        let AllChatsFetched=AllChats
        AllChatsFetched.push(newChat)
        setChats(AllChatsFetched)
    }
    console.log('2')
    let nowChat=clickedChat
    console.log('??Ohh')
    nowChat.messages[index]=(newMessage)
    setClicked(nowChat)
    
    let AllLoadedChats=LoadedChats
    if(chatIndex!==-1){
        AllLoadedChats[chatIndex]=clickedChat
        setLoadedChats(AllLoadedChats)
    }
   
    console.log('3')


    if(isLocal===false){
        console.log('3')

        AllLoadedChats.push(clickedChat)
        setLoadedChats(AllLoadedChats)
    }

 
    console.log('3')

    setSending(false)

        if(messageEnd.current){
            messageEnd.current.scrollIntoView()
        }
        let fetchedNew=AllChats
       
        for(let chat=0;chat<fetchedNew.length;chat++){
            if(fetchedNew[chat]._id===clickedChat._id){
                fetchedNew[chat].latestMessage=data.chat
                let currentChat=fetchedNew.splice(chat,1)[0]
                fetchedNew.unshift(currentChat)

                setChats(fetchedNew)
                console.log('hey?')
                return
            }
        }

        console.log('3')

        if(response.status!==300){
            fetchedNew.push(newChat)
            setChats(fetchedNew)
        }
        console.log('done again')
    }


    const clickedBack=()=>{
        setClicked('')
        setloadAll(true)
        setSingleChat(false)
    }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && message.trim()!='') {
        sendMessage()
    }
  };
  const ShowChat=()=>{
    setSHowChat(true)
  }

  useEffect(()=>{
    console.log(clickedChat)
    if(clickedChat===''){
        setLoadingChat(true)
    }
    SeeMessage()

  },[])

if(showChatDetails===false){
    return (
        <div className='chatDisplay'>
         <div className='chatdetailsContainer'>
            <div className='backBtnDiv'><button onClick={clickedBack} className='backbtn'>&#8592;</button></div>
            <div className='chatDetails'>
                <div className='chatDpDiv'>
                    <div onClick={ShowChat} className='chatDp'>
                        <img src={clickedChat.pic}/>
                    </div>
                </div>
                <div className='chatNameDiv'>
                    <div className='chatName'>
                        <span className='MainChat-chatName'>{clickedChat.chatName}</span>
                        {clickedChat.isGroupChat===false && <div className='contact-div-onechat'>{clickedChat.number}</div>}
                        {clickedChat.isGroupChat===true && <div className='contact-div-onechat'>{
                            clickedChat.number.map((member,index)=>{
                                return <span key={index}>{member}{index===clickedChat.number.length-1?' ':', '}</span>
                            })
                            }</div>}
                    </div>
                </div>
            </div>
         </div>
    
         <div className='chatDisplayContainer'>
            {clickedChat.messages.length>0 &&
                clickedChat.messages.map((element) => {
                    return <OneMessage isDeleted={element.isDeleted} key={element._id} message={element.content} messageId={element._id} chatId={clickedChat._id} 
                    userToken={User.token} status={element.status?element.status:'sent'} sentBy={clickedChat.isGroupChat===true?element.sender.name:null} readBy={element.readBy}
                    sender={User._id===element.sender._id?'byMe':User._id===element.sender?'byMe':'byThem'} senderId={element.sender._id}
                    />
                })
            }
            <div ref={messageEnd}></div>
          
         </div>
    
         <div className='chatInputContainerDiv'>
            <div className='chatInputDiv'>
                <div>
                    <span>More</span>
                </div>
                <div className='inputMessageDiv'>
                    <input className='inputDisplay' id={message!=''?'isTyping':'notTyping'} onChange={changeMessage} value={message} onKeyDown={handleKeyPress} placeholder='Enter Message'/>
                    {message!='' && <button onClick={sendMessage} className='sendBtn'>Send</button>}
    
                </div>
            </div>
         </div>
        </div>
      )
  }else{
    return(
        <ChatDetails setSHowChat={setSHowChat} showChatDetails={showChatDetails}></ChatDetails>
    )
  }
}

export default Onechat
