import { useNavigate } from 'react-router-dom'
import React, { useEffect, useState,useContext } from 'react'
import { AppContext } from '../../Context/ContextProvider'

const IndChat = ({pic,setloadAll,_id,chatName,isGroupChat,lmContent,lmSender,lmSentAt,setSingleChat,isSingleChat}) => {
  const [timePassed,setTime]=useState('')


  let {
    User,setUser,LoadedChats,setLoadedChats,setChats,
    setClicked,setLoadingChat,clickedChat,unreadMsg
  }=useContext(AppContext)
  const navigate=useNavigate()

  async function clickedOne(){
    setLoadingChat(true)
    setSingleChat(true)

    let foundLocal=false

    if(!User || !User.token){
      localStorage.removeItem('UserData')
      setUser('')
      setLoadedChats([])
      navigate('/Login')
      return
    }
    
    if(LoadedChats && LoadedChats.length>0){
      for(let i=0;i<LoadedChats.length;i++){
        if(LoadedChats[i]._id==_id){
          // console.log(LoadedChats[i])
          setloadAll(false)
          // setSingleChat(true)
          setClicked(LoadedChats[i])
          foundLocal=true
        }
      }
    }

    
    if(foundLocal==true){
      let AuthUrl=`http://localhost:2000/user/auth/?token=${User.token}`
      let response=await fetch(AuthUrl)
      if(response.status==200){
        setLoadingChat(false)
        console.log('hey? 3')
      }else if(response.status(401)){
        localStorage.removeItem('UserData')
        setUser('')
        setLoadedChats([])
        setChats([])
    
        navigate('/Login')
        setLoadingChat(false)

      }      console.log(clickedChat)

      return
    }else{
      setClicked('')
      setSingleChat(true)
    }

    let url=`http://localhost:2000/chat/get/one/?_id=${_id}&chatName=${chatName}&token=${User.token}`
    let response=await fetch(url,{
      method:'GET',
    })
    console.log(clickedChat)

    if(response.status==401){
      setLoadingChat(false)
      setUser('')
      setLoadedChats([])
      setChats([])
      navigate('/Login')
    }else if(response.status==500){
      console.log('server issue')
    }else if(response.status==200 && foundLocal===false){
      let data=await response.json()
      var number=User.contactNumber;
      var users=[]
      for(let i=0;i<data.users.length;i++){
        if(isGroupChat===true){
          users.push(data.users[i].name)
        }else if(data.users[i].contactNumber!==User.contactNumber){
          users.push(data.users[i].name)
          number=data.users[i].contactNumber
        }
      }
      if(isGroupChat===true){
        number=users
      }
      console.log(data)

      let newChat={
        'pic':data.pic,
        'number':number,
        'isGroupChat':data.isGroupChat,
        "chatName":data.chatName,
        "_id":data._id,
        "messages":data.messages,
        'users':data.users,
        'GroupAdmins':data.groupAdmins,
        'createdBy':data.createdBy
      }
      let Chats=LoadedChats
      Chats.push(newChat)
      setLoadedChats(Chats)
      setloadAll(false)
      setClicked(newChat)
      setSingleChat(true)
      setLoadingChat(false)
      console.log(clickedChat)

    }
  }

  useEffect(()=>{
    console.log(lmSender,lmContent)

    let createdAt=new Date(lmSentAt)
    createdAt=createdAt.getTime()
    const now=Date.now()
    let difference=now-createdAt
    const minute=Math.floor(difference/(1000*60))
    const hours=Math.floor(difference/(1000*60*60))
    const days=Math.floor(difference/(1000*60*60*24))
    console.log(minute,hours,days)
    if(hours<=1){
      setTime(minute+' minutes ago')
    }else if(hours>1 && hours <24){
      setTime(hours+' hours ago')
    }else{
      setTime(days+' days ago')
    }
    if(timePassed=== '0 minutes ago'){
      setTime('Now')
    }

  },[])
  
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
            {lmSender && lmContent &&
            <>
             <span className='sender LMdetails'>{lmSender}:</span>
             <span className='latestMessage LMdetails'>{lmContent}</span>
             </>
            }{ !lmSender &&!lmContent &&
              <>
              <span className='LMdetails StartMsg'>Start sending Messages</span>
              </>
            }
            </div>
            <div className='chatElelmInd'>
            <span className='sentAt LMdetails'>
              {timePassed}
            </span>
            <div className='unreadMsg-chat'>{unreadMsg}</div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default IndChat
