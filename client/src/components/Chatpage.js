import React,{useState,useEffect, useContext} from 'react'
import AllChats from './AllChats/AllChats'
import './allChats.css'
import ChatSideWindow from './AllChats/SideWindow'
import { AppContext } from './Context/ContextProvider'
import Group from './groupChat/Group'
import SettingsPage from './Profile/Settings'
import Onechat from './OneChat/Onechat'
import Socket from './Socket/Socket'
import ChatBot from './OneChat/ChatBot'
const Chatpage = () => {
  const {isSending,AccountPage,User,showingBot}=useContext(AppContext)
  const [loadAll,setloadAll]=useState(true)
  const [isSingleChat,setSingleChat]=useState(false)
  const [isAddingGroup,setAddingGroup]=useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
  
    window.addEventListener('resize', handleResize);
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

useEffect(()=>{
  
  },[isSending])


  if(windowWidth<=850){
    return (
      <div className='ChatPage'>
        {/* {isSingleChat===false && <AllChats loadAll={loadAll}  isSingleChat={isSingleChat} setSingleChat={setSingleChat} setloadAll={setloadAll}/>} */}
        {isAddingGroup===false && isSingleChat===false && AccountPage===false&&showingBot===false && <AllChats setAddingGroup={setAddingGroup}setSingleChat={setSingleChat} setloadAll={setloadAll}/>}
        {isAddingGroup===false&& isSingleChat===true && loadAll===false &&AccountPage===false && <Onechat setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {showingBot===true&& isSingleChat===false && loadAll===false &&AccountPage===false &&<ChatBot setSingleChat={setSingleChat} setloadAll={setloadAll}></ChatBot>}
        {/* {isSingleChat===true && isAddingGroup===false &&AccountPage===false && <MainChatPage loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />} */}
        {isAddingGroup===true && <Group setloadAll={setloadAll } setSingleChat={setSingleChat} setAddingGroup={setAddingGroup}></Group>}
        {AccountPage===true && <SettingsPage setloadAll={setloadAll} setSingleChat={setSingleChat}></SettingsPage>}
        {User && <Socket ></Socket>}
        {/* {isSearch && !loadAll && <SearchPage isSearch={isSearch} loadAll={loadAll} setsearch={setsearch} setloadAll={setloadAll}/>} */}
      </div>
    )
  }else{
    return(
      <div className='ChatPage'>
        {isAddingGroup===false && AccountPage===false &&<AllChats setAddingGroup={setAddingGroup} windowWidth={windowWidth} loadAll={loadAll}  isSingleChat={isSingleChat} setSingleChat={setSingleChat} setloadAll={setloadAll}/>}
        {showingBot===true&& isSingleChat===false &&AccountPage===false &&<ChatBot setSingleChat={setSingleChat} setloadAll={setloadAll}></ChatBot>}
        {isSingleChat &&showingBot===false&& isAddingGroup===false && AccountPage===false && <Onechat loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {/* {isSingleChat && isAddingGroup===false && AccountPage===false && <MainChatPage loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />} */}
        {!isSingleChat && isAddingGroup===false && AccountPage===false &&showingBot===false && <ChatSideWindow/>}
        {isAddingGroup===true && <Group setloadAll={setloadAll } setSingleChat={setSingleChat} setAddingGroup={setAddingGroup}></Group>}
        {AccountPage===true && <SettingsPage setloadAll={setloadAll} setSingleChat={setSingleChat}></SettingsPage>}
        {User && <Socket></Socket>}
        {/* {isSearch && !loadAll && <SearchPage isSearch={isSearch} loadAll={loadAll} setsearch={setsearch} setloadAll={setloadAll}/>} */}
      </div>
    )
  }
}

export default Chatpage