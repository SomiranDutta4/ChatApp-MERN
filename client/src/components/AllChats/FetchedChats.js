import React,{useEffect,useContext} from 'react'
import IndChat from './indChats/IndChat'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import {AppContext} from '../Context/ContextProvider'

const FetchedChats = ({isAdding,isSearch,setloadAll,isSingleChat,setSingleChat}) => {
 
  const {User,setUser,AllChats,setChats,setLoading,isLoading,setLoadedChats,setLocalFound}=useContext(AppContext)
  const navigate=useNavigate()

  let getChats=async()=>{
    if(!User || !User.token || !User._id){
      setUser('')
      setLoadedChats([])
      setChats([])
      localStorage.removeItem('UserData')
      navigate('/Login')
      setLoading(false)
      return
    }

    let AuthUrl=`http://localhost:2000/user/auth/?token=${User.token}`
    let url=`http://localhost:2000/chat/get/all/?_id=${User._id}&token=${User.token}`

    let isFoundLocal=false

    if(AllChats && AllChats!=''){
      isFoundLocal=true
    }

    if(isFoundLocal==true){
      try {
        let response=await fetch(AuthUrl)
        if(response.status==200){
          
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
      } catch (error) {}
      }else{
        setLoading(true) 
      }
       
      try {
        let response=await fetch(url,{
          method:'GET'
        })
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
            if(chat.chatName==='randomXYZchatApp.123456789@#$%^&*()_+'){
              
              if(chat.users[0]._id==User._id && chat.users.length!=1){
                chat.chatName=chat.users[1].name
              }else{
                chat.chatName=chat.users[0].name
              }
            }
          });

          chatsToSave.sort((a, b) => {
            let dateA = new Date(a.latestMessage.createdAt);
            let dateB = new Date(b.latestMessage.createdAt);
            return dateB - dateA; // Descending order (most recent first)
          });

          setChats(chatsToSave)
          setLocalFound(chatsToSave)
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
    getChats()
    console.log(AllChats)
      // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])

  return (
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
        return <IndChat unreadMsg={element.unseenMsg?element.unseenMsg:0} isGroupChat={element.isGroupChat} isSingleChat={isSingleChat} setSingleChat={setSingleChat} _id={element._id} pic={element.pic} setloadAll={setloadAll} key={element._id} chatName={element.chatName} lmContent={element.latestMessage?.content} senderId={element.latestMessage.sender?._id} lmSender={element.latestMessage.sender?.name} lmSentAt={element.latestMessage?.createdAt} />
      })}

      {!isLoading && AllChats.length===0 &&
       <div style={{color:'white',textAlign:'center',margin:'20px 0 20px 0',fontSize:'120%'}}>No Chats to display</div>
      }
      </div>
    </div>
  )
}
export default FetchedChats