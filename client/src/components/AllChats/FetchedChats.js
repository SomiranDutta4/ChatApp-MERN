import React,{useEffect,useState,useContext} from 'react'
import IndChat from './indChats/IndChat'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import {AppContext} from '../Context/ContextProvider'

const FetchedChats = ({isAdding,isSearch,setClicked,setloadAll,isSingleChat,setSingleChat}) => {
 
  const {LoadedChats,User,setUser,AllChats,setChats,setLoading,isLoading,setLoadedChats,}=useContext(AppContext)
  const navigate=useNavigate()

  let getChats=async()=>{
    console.log(AllChats)


    let AuthUrl=`http://localhost:2000/user/auth/?token=${User.token}`
    let url=`http://localhost:2000/chat/get/all/?_id=${User._id}&token=${User.token}`

    
    let isFoundLocal=false
    // let UserData=localStorage.getItem('UserData')

    if(AllChats && AllChats!=''){
      isFoundLocal=true
    }
    if(!User || !User.token || !User._id || User===''){
      setUser('')
      setLoadedChats([])
      setChats([])
      localStorage.removeItem('UserData')
      navigate('/Login')
      setLoading(false)
      return
    }

    if(isFoundLocal==true){
      let response=await fetch(AuthUrl)
      if(response.status==200){
        console.log(response)
        
      }else if(response.status(401)){
        localStorage.removeItem('UserData')
        setUser('')
        setLoadedChats([])
        setChats([])
        navigate('/Login')
        
      }else{
        setLoading(true)
      }
      return 
      }else{
        setLoading(true) 
      }

       
      try {
        let response=await fetch(url,{
          method:'GET'
        })
        console.log(response)
        if(response.status===401 ){
          localStorage.removeItem('UserData')
          setUser('')
          setChats('')
          navigate('/Login')
          return
        }else if(response.status===200){
          let newchats=await response.json()
          let chatsToSave=newchats.chats
          chatsToSave.forEach(chat => {
            console.log(chat)
            if(chat.chatName==='randomXYZchatApp.123456789@#$%^&*()_+'){
              if(chat.users[0]._id!=User._id){
                chat.chatName=chat.users[0].name
              }else{
                chat.chatName=chat.users[0].name
              }
            }
          });

          console.log(chatsToSave)
          setChats(chatsToSave)
          console.log(AllChats)
          // localStorage.setItem('fetchedChats',JSON.stringify(chatsToSave))
        }else{
          // setLoading(false)
          return
        }
        setLoading(false)
      } catch (error) {
        console.log(error)
      }

}


  useEffect(()=>{
    console.log(AllChats,LoadedChats)
    getChats()

  },[])
  
  return (
   //fetched chats:
    <div className={`AllChatsContainerDiv isAdding-${isAdding} isSearch-${isSearch}`}>
      <div className='chatContainerOuter'>
      {isLoading && <LoadingScreen/>}
      {/* {!isLoading && <LoadingScreen/> } */}
      {AllChats==[] &&
      <div className="no-chats-container">
      <h3>No chats yet</h3>
      <p>Start messaging people to begin conversations!</p>
    </div>
       }
      {!isLoading && AllChats.length>0 &&
      AllChats.map((element)=>{
        return <IndChat isGroupChat={element.isGroupChat} setClicked={setClicked} isSingleChat={isSingleChat} setSingleChat={setSingleChat} setLoading={setLoading} _id={element._id} pic={element.pic} setloadAll={setloadAll} key={element._id} chatName={element.chatName} lmContent={element.latestMessage?.content} lmSender={element.latestMessage.sender?.name} lmSentAt={element.latestMessage.createdAt} />
      })}
      </div>
    </div>
  )
}

export default FetchedChats
