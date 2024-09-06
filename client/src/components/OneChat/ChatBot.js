import React, { useContext, useEffect, useRef, useState } from 'react'
import { AppContext } from '../Context/ContextProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner,faCog } from '@fortawesome/free-solid-svg-icons'
import OneMessage from './OneMessage'
import { useNavigate } from 'react-router-dom'
const ChatBot = ({setloadAll,setSingleChat}) => {
    const navigate=useNavigate()
    const [message,setMessage]=useState('')

    const changeMessage=(event)=>{
        setMessage(event.target.value)
        // setTyping(true)
    }
    const inputMessage=useRef(null)
    const messageEnd=useRef(null)

    const {User,setShowingBot,clickedChat,setClicked,setSending,setUser,setChats,messageLoading,setMsgLoadig}=useContext(AppContext)

    const getTheAi=async()=>{
        const AiUrl=`http://localhost:2000/chat/ai/bot/?token=${User.token}`
        const response=await fetch(AiUrl)
        if(response.status===200){
            const data=await response.json()
            setClicked(data.AiBot)
        }else if(response.status===401){
            localStorage.removeItem('UserData')
            setUser('')
            setChats('')
            navigate('/Login')
        }
    }
    const sendMessage=async()=>{
        if(messageLoading===true){
            return
        }
        setSending(true)
        setMsgLoadig(true)
        let myMesg={
            content:message,
            _id:'asytfuyiuojapsofkiouyy302',
            sender:User,
            readBy:[],
            isDeleted:false,
            createdAt:new Date(),
        }
        let messagesUpdate=clickedChat
        messagesUpdate.messages.push(myMesg)
        setClicked(messagesUpdate)
        setMessage('')
        scrollIt()
        const MessageUrl=`http://localhost:2000/message/ai/bot/?token=${User.token}`
        const response=await fetch(MessageUrl,{
            method:'PATCH',
            headers: {
                'Content-Type': 'application/json', // Specify content type JSON
            },
            body:JSON.stringify({
                content:message
            })
            })
            if(response.status==200){
                const data=await response.json()
                const sender={
                    _id:'avhskjhlaksjf23423twrgsdfvxcik',
                    name:'Ai Bot',
                    contactNumber:'AiBot@chatNinja'
                }
                const newMsg={
                    _id:'random123XYZawhfksjnlkajhkb234',
                    chat:clickedChat._id,
                    content:data.content,
                    createdAt:new Date(),
                    isDeleted:false,
                    sender:sender,
                    readBy:[],
                }
                let messagesUpdate=clickedChat
                messagesUpdate.messages.push(newMsg)
                setClicked(messagesUpdate)
                setMsgLoadig(false);
            }else if(response.status===401){
            localStorage.removeItem('UserData')
            setUser('')
            setChats('')
            navigate('/Login')
            return
            }
        setSending(false)
        scrollIt()
    }
    const handleKeyPress = (event) => {
        if(messageLoading===true){
            return
        }
        if (event.key === 'Enter' && message.trim()!='') {
            sendMessage()
        }
      };
    
    const clickedBack=()=>{
        setClicked('')
        setShowingBot(false)
        setloadAll(true)
        setSingleChat(false)
    }
    const scrollIt=()=>{
        if(messageEnd.current){
            messageEnd.current.scrollIntoView()
        }
    }

    useEffect(()=>{
        console.log(clickedChat)
        if(!clickedChat){
        setSingleChat(false)
        getTheAi()
        scrollIt()}
    },[])

    if(clickedChat){
    return (
        <div className='chatDisplay'>

         <div className='chatdetailsContainer'>
            <div className='backBtnDiv'><button onClick={clickedBack} className='backbtn'>&#8592;</button></div>
            <div className='chatDetails'>
                <div className='chatDpDiv'>
                    <div className='chatDp-Bot'>
                        <img src={clickedChat.pic}/>
                    </div>
                </div>
                <div className='chatNameDiv'>
                    <div className='chatName'>
                        <span className='MainChat-chatName'>{clickedChat.chatName}</span>
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
            {messageLoading===true &&<>
            <div>
                <FontAwesomeIcon style={{color:'grey'}} className="loadingBotMessage fa-fade" icon={faCog}></FontAwesomeIcon></div> 
                <div ref={messageEnd}></div></>
            }
            {messageEnd===false &&
            <div ref={messageEnd}></div>}
          
         </div>
    
         <div className='chatInputContainerDiv'>
            <div className='chatInputDiv'>
                <div>
                    <span></span>
                </div>
                <div className='inputMessageDiv'>
                    <input className='inputDisplay' id={message!=''?'isTyping':'notTyping'} onChange={changeMessage} ref={inputMessage} value={message} onKeyDown={handleKeyPress} placeholder='Enter Message'/>
                    {message!='' && <button onClick={sendMessage} className='sendBtn'>Send</button>}
                </div>
            </div>
         </div>
        </div>
      )}else{
        return(
            <div className='spinnerDiv-group'><FontAwesomeIcon style={{color:'white'}} className="spinner-Group fa-spin-pulse" icon={faSpinner}></FontAwesomeIcon></div>
        )
      }
}

export default ChatBot
