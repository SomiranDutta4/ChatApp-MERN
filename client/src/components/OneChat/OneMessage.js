import React, { useState,useContext, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppContext } from '../Context/ContextProvider';
import { faPaperPlane,faEye,faGear,faClock,faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const OneMessage = ({
  message,sender,userToken,senderId,sentBy,
  chatId,messageId,status,isDeleted,readBy

  }) => {

  const {clickedChat,setClicked,AllChats,LoadedChats,
  setChats,setLoadedChats,setSending,User}=useContext(AppContext)
  const navigate=useNavigate()
  const [showEdit,setEdit]=useState(false)
  const [editing,setEditingMsg]=useState(false)
  const [successMessage,setMessage]=useState('')
  const [isChangingMsg,setChanging]=useState(false)
  const [changedMsg,setChangedMsg]=useState('')
  const [seen,setSeenBy]=useState([])
  const [showingSeen,setshowing]=useState(false)
  const [messageStatus,setStatus]=useState(status)

  let show=()=>{
    setEdit(true)
  }
  let hide=()=>{
    setEdit(false)
    setEditingMsg(false)
  }
  let editShow=()=>{
    setEditingMsg(true)
  }
  let copyMessage=async()=>{
    await navigator.clipboard.writeText(message)
    setEditingMsg(false)
    setMessage('Copied')
    setTimeout(()=>{
      setMessage('')
    },1500)
  }


  let deleteMessage=async()=>{
    if(isDeleted===true){
      return
    }
    let AllLoadedChats=LoadedChats
    console.log(AllChats,clickedChat)

    let AllNewChats=AllChats
    let updatedChat=clickedChat
    for(let message=updatedChat.messages.length-1;message>=0;message--){
      if(updatedChat.messages[message]._id===messageId){
        updatedChat.messages[message].content='message was deleted'
        updatedChat.messages[message].isDeleted=true
        setClicked(updatedChat)
        break
      }
    }
    for(let i=0;i<AllChats.length;i++){
      if(AllChats[i].latestMessage._id===messageId){
        AllNewChats[i].latestMessage.content='message was deleted'
        setChats(AllNewChats)
      }
      if(AllLoadedChats[i] && AllLoadedChats[i]._id===clickedChat._id){
        AllLoadedChats[i]=clickedChat
        setLoadedChats(AllLoadedChats)
      }
    }
    hide()
    setStatus('sending')
    setSending(true)
    let deleteUrl=`http://localhost:2000/message/delete/?token=${userToken}`
    try {
      let response=await fetch(deleteUrl,{
        method:'DELETE',
        headers: {
          'Content-Type': 'application/json', // Specify content type JSON
        },  
        body:JSON.stringify({
          messageId:messageId,
          chatId:chatId
        })
      })
    } catch (error) {
      
    }
    setSending(false)
    setStatus('sent')
    console.log('clicked:',clickedChat)

  }
  let ChangeEdit=(event)=>{
    setChangedMsg(event.target.value)
  }

  let EditMessage=()=>{
    setChangedMsg('')
    setChanging(true)
    setEditingMsg(false)
  }
  let cancelEditingMsg=()=>{
    setChanging(false)
  }



  let confirmEdit=async()=>{
    let newContent=changedMsg
    setChanging(false)
    if(changedMsg===message || changedMsg.trim()===''){
      return
    }else{
      setSending(true)
      let editUrl=`http://localhost:2000/message/edit/?token=${User.token}`
      try {
        let response=await fetch(editUrl,{
          method:'PATCH',
          headers: {
            'Content-Type': 'application/json', // Specify content type JSON
          }, 
          body:JSON.stringify({
            newContent:newContent,
            chatId:chatId,
            messageId:messageId
          })
        })
        if(response.status===401){
          localStorage.removeItem('UserData')
          setChats([])
          setLoadedChats([])
          navigate('/Login')
        }else{
          let AllNewChats=AllChats
          let updatedChat=clickedChat
          let AllLoadedChats=LoadedChats
          for(let message=updatedChat.messages.length-1;message>=0;message--){
            if(updatedChat.messages[message]._id===messageId){
              updatedChat.messages[message].content=newContent
              setClicked(updatedChat)
              break
            }
          }
          for(let i=0;i<AllChats.length;i++){
            if(AllChats[i].latestMessage._id===messageId){
              AllNewChats[i].latestMessage.content=newContent
              setChats(AllNewChats)
            }
            if(AllLoadedChats[i] && AllLoadedChats[i]._id===clickedChat._id){
              AllLoadedChats[i]=clickedChat
              setLoadedChats(AllLoadedChats)
            }
          }
          setSending(false)
        }
      } catch (error) {
        
      }
    }
  }
  const checkSeen=()=>{
    try {
      for(let i=0;i<readBy.length;i++){
        if(readBy[i]._id!==User._id){
          let seenBy=seen
          seenBy.push(
            [i].name)
          setSeenBy(seenBy)
        }
    }
    } catch (error) {}
  }
  const seeReadBy=()=>{
    setshowing(true)
  }
  const hideReadBy=()=>{
    setshowing(false)
  }
  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && message.trim()!=='') {
      confirmEdit()
    }
  };



  useEffect(()=>{
    checkSeen()
  },[])

  return (
    <div className={`chatMessages ${sender}`}>
      
      <div onMouseEnter={show} onMouseLeave={hide} className={`chatMessages-options-Div ${sender}`}>
        {editing===true &&
        <div className='editMsg-container'>
          {isDeleted===false &&
          <>
          <p id='firstOption-msg' onClick={copyMessage} className='edit-Options'>Copy</p>
        <p onClick={EditMessage} className='edit-Options'>Edit Message</p>
        <p onClick={deleteMessage} id='lastOption-msg' className='edit-Options'>Delete Message</p>
          </>
          }
          </div>
        }
        {successMessage!='' &&
        <span className='successMessage'>{successMessage}</span>
        }
      {sender==='byMe' &&showEdit===true && <div className={`optionDiv-particularMsg`}>
      {isDeleted===false && 
      <FontAwesomeIcon onClick={editShow} icon={faGear} />
      }
      </div>}
        <div  className='message messageDiv-Msg'>
          {senderId!==User._id && sentBy &&
            <p className='senderName-group'>{sentBy}</p>
          }
          <span style={{padding:'4px'}} id={messageId}>{message}</span>

          {senderId===User._id && clickedChat.isGroupChat===true && seen.length>0  &&status!=='sending' && isDeleted===false && clickedChat.users.length>1 &&
          <FontAwesomeIcon className='hasBeenSeen' onClick={seeReadBy} icon={faEye} style={{color:'black',fontSize:'70%'}}></FontAwesomeIcon>
          }

          {senderId===User._id && seen.length===0 &&status!=='sending' && isDeleted===false && clickedChat.users.length>1 &&
          <FontAwesomeIcon className='hasBeenSeen'  onClick={seeReadBy} onMouseLeave={hideReadBy} icon={faEyeSlash} style={{color:'black',fontSize:'70%'}}></FontAwesomeIcon>
          }

          {senderId===User._id && clickedChat.isGroupChat===false && seen.length>0 &&status!=='sending' && isDeleted===false && clickedChat.users.length>1 &&
          <FontAwesomeIcon className='hasBeenSeen'  onClick={seeReadBy} onMouseLeave={hideReadBy} icon={faEye} style={{color:'black',fontSize:'70%'}}></FontAwesomeIcon>
          }
            {messageStatus==='sending' && 
              <FontAwesomeIcon icon={faClock} style={{fontSize:'70%', padding:'3px'}}></FontAwesomeIcon>
            }
        </div>
        {showingSeen===true && seen.length>0 && clickedChat.isGroupChat===true &&
          <div className='seenBy-div'>
            <button onClick={hideReadBy} className='closeBtn-seenBy'>+</button>
          readBy:
          {seen.map((element)=>{
            return <p>{element}</p>
          })}
          </div>
          }

          {showingSeen===true && clickedChat.isGroupChat===false && seen.length>0 &&
          <div className='seenBy-div'><span>Seen</span></div>}

          {showingSeen===true && seen.length===0 && isDeleted===false &&
          <div className='seenBy-div'><span>Not Seen</span></div>}
        </div>
        {isChangingMsg===true &&

        
          <div className='NewEdited-msg div'>
            <div><button style={{cursor:'pointer'}} onClick={cancelEditingMsg} className='cancelEdit-btn'>✕</button></div>
          <input className='editInput-msg' onChange={ChangeEdit} placeholder='edit message' value={changedMsg}></input>
          {changedMsg!=='' &&
            <FontAwesomeIcon onClick={confirmEdit} style={{cursor:'pointer',color:'white'}} icon={faPaperPlane} className='setIcon-edited'></FontAwesomeIcon>
          }
          
        </div>
        }

    </div>
  )
}

export default OneMessage
