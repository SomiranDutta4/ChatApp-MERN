import React, { useEffect, useState,useRef,useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChatStyle.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import OneMessage from './OneMessage'
import { AppContext } from '../Context/ContextProvider'
import ChatDetails from './ChatDetails'

const Onechat = ({setSingleChat,setloadAll}) => {
    const [showChatDetails,setSHowChat]=useState(false)
    const {
        clickedChat,setClicked,User,setUser,setLoading,socket,NewMEssageHandler,
        LoadedChats,AllChats,setChats,setSending,SeeMessage,showingBot
    }=useContext(AppContext)
    const navigate=useNavigate()
   
    const [message,setMessage]=useState('')

    const changeMessage=(event)=>{
        setMessage(event.target.value)
        // setTyping(true)
    }
    const inputMessage=useRef(null)
    const messageEnd=useRef(null)

    const sendMessage=async()=>{
        let newMsgessage=message
        // let isLocal=false

        let newMsg={
            _id:'random123XYZ',
            chat:clickedChat._id,
            content:newMsgessage,
            createdAt:new Date(),
            sender:User,
            isDeleted:false,
            readBy:[User],
            status:"sending"
        }

        NewMEssageHandler(newMsg)
        setSending(true)
        if(messageEnd.current){
            messageEnd.current.scrollIntoView()
        }

    if(!User || !User.token){
            setUser('')
            setClicked('')
            setSingleChat(false)
            localStorage.removeItem('UserData')
            navigate('/Login')
            setLoading(false)
            return
    }
    setMessage('')
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
            chatId:clickedChat._id,
            reqId:clickedChat.reqId?clickedChat.reqId:null
        })
    })
    let data=await response.json();

    let newChat={
        pic:clickedChat.pic,
        _id:clickedChat._id,
        chatName:clickedChat.chatName,
        isGroupChat:clickedChat.isGroupChat,
        users:clickedChat.users,
        latestMessage:data.chat.latestMessage
    }
    let newMessage=data.chat
    try {
        socket.emit("new message", data.chat)
        console.log(data.chat);       
    } catch (error) {
        console.log(error)
    }

    if(response.status==300){
        let AllChatsFetched=AllChats
        AllChatsFetched.push(newChat)
        setChats(AllChatsFetched)
    }
    NewMEssageHandler(newMessage.latestMessage)
    setSending(false)
    if(messageEnd.current){
            messageEnd.current.scrollIntoView()
        }
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
    if(clickedChat){
    if(inputMessage.current){
        inputMessage.current.focus()
    }
    if(messageEnd.current){
        messageEnd.current.scrollIntoView()
    }
    SeeMessage()
    try {
        socket.emit('join chat',clickedChat._id)   
    } catch (error) {console.log(error)}}
  },[clickedChat])

useEffect(()=>{
  },[])
useEffect(()=>{
},[clickedChat])

if(showChatDetails===false && showingBot===false){
    return (
        <div className='chatDisplay'>
            {!clickedChat && 
        <div className='spinnerDiv-group'><FontAwesomeIcon style={{color:'white'}} className="spinner-Group fa-spin-pulse" icon={faSpinner}></FontAwesomeIcon></div>
    }
    {clickedChat &&
        <>
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
                        {clickedChat.isGroupChat===false && <div className='contact-div-onechat'>{clickedChat.number?clickedChat.number:clickedChat.contactNumber}</div>}
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
            {clickedChat.messages && clickedChat.messages.length>0 &&
                clickedChat.messages.map((element) => {
                    return <OneMessage ShMessage={element} isDeleted={element?.isDeleted} key={element._id} message={element.content} messageId={element._id} chatId={clickedChat._id} 
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
                    <input className='inputDisplay' id={message!=''?'isTyping':'notTyping'} onChange={changeMessage} ref={inputMessage} value={message} onKeyDown={handleKeyPress} placeholder='Enter Message'/>
                    {message!='' && <button onClick={sendMessage} className='sendBtn'>Send</button>}
    
                </div>
            </div>
         </div>
         </>}
        </div>
      )
  }else{
    return(
        <ChatDetails setSHowChat={setSHowChat} showChatDetails={showChatDetails}></ChatDetails>
    )
  }
}

export default Onechat