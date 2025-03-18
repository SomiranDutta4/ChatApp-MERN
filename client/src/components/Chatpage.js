import React, { useState, useEffect, useContext, } from 'react'
import AllChats from './AllChats/AllChats'
import './allChats.css'
import ChatSideWindow from './AllChats/SideWindow'
import { AppContext } from './Context/ContextProvider'
import Group from './groupChat/Group'
import SettingsPage from './Profile/Settings'
import Onechat from './OneChat/Onechat'
import ChatBot from './OneChat/ChatBot'
import Socket from './Socket/Socket'
import { Flip, ToastContainer, toast } from 'react-toastify';


const Chatpage = () => {
  const { isSending, AccountPage, User, showingBot, socket, setClicked, clickedChat, setChats, getChats } = useContext(AppContext)
  const [loadAll, setloadAll] = useState(true)
  const [isSingleChat, setSingleChat] = useState(false)
  const [isAddingGroup, setAddingGroup] = useState(false)
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


  useEffect(() => {
  }, [isSending])

  useEffect(() => {
    if (!socket) return;

    const handleGroupAdded = (user) => {
      if (user === User._id) {
        getChats()
        toast("You've been added to a new group");
      }
    };

    socket.on("group added", handleGroupAdded);

    return () => {
      socket.off("group added", handleGroupAdded); // Cleanup previous listeners
    };
  }, [socket, User._id]); // Ensure useEffect runs only when socket or User._id changes

  useEffect(() => {
    if (!socket) return;

    const handleMemberRemoval = (groupDetails) => {

      setChats((prevChats) => prevChats.filter(chat => chat._id !== groupDetails.chatId));

      if (clickedChat?._id === groupDetails.chatId) {
        setClicked(null);
        setSingleChat(false);
        setloadAll(true);
      }
      toast.info(`you were removed from the group:  ${groupDetails.name}`)
    };

    socket.on('removed member', handleMemberRemoval);
    return () => {
      socket.off('removed member', handleMemberRemoval);
    };
  }, [socket, clickedChat, setChats, setClicked, setSingleChat, setloadAll]);


  if (windowWidth <= 850) {
    return (
      <div className='ChatPage'>
        {/* {isSingleChat===false && <AllChats loadAll={loadAll}  isSingleChat={isSingleChat} setSingleChat={setSingleChat} setloadAll={setloadAll}/>} */}
        {isAddingGroup === false && isSingleChat === false && AccountPage === false && showingBot === false && <AllChats setAddingGroup={setAddingGroup} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {isAddingGroup === false && isSingleChat === true && loadAll === false && AccountPage === false && <Onechat windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {showingBot === true && isSingleChat === false && loadAll === false && AccountPage === false && <ChatBot setSingleChat={setSingleChat} setloadAll={setloadAll}></ChatBot>}
        {/* {isSingleChat===true && isAddingGroup===false &&AccountPage===false && <MainChatPage loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />} */}
        {isAddingGroup === true && <Group setloadAll={setloadAll} setSingleChat={setSingleChat} setAddingGroup={setAddingGroup}></Group>}
        {AccountPage === true && <SettingsPage setloadAll={setloadAll} setSingleChat={setSingleChat}></SettingsPage>}
        {User && <Socket ></Socket>}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          limit={3}
          hideProgressBar
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="light"
          transition={Flip}
        />
        {/* {isSearch && !loadAll && <SearchPage isSearch={isSearch} loadAll={loadAll} setsearch={setsearch} setloadAll={setloadAll}/>} */}

      </div>
    )
  } else {
    return (
      <div className='ChatPage'>
        {isAddingGroup === false && AccountPage === false && <AllChats setAddingGroup={setAddingGroup} windowWidth={windowWidth} loadAll={loadAll} isSingleChat={isSingleChat} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {showingBot === true && isSingleChat === false && AccountPage === false && <ChatBot setSingleChat={setSingleChat} setloadAll={setloadAll}></ChatBot>}
        {isSingleChat && showingBot === false && isAddingGroup === false && AccountPage === false && <Onechat loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {/* {isSingleChat && isAddingGroup===false && AccountPage===false && <MainChatPage loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />} */}
        {!isSingleChat && isAddingGroup === false && AccountPage === false && showingBot === false && <ChatSideWindow />}
        {isAddingGroup === true && <Group setloadAll={setloadAll} setSingleChat={setSingleChat} setAddingGroup={setAddingGroup}></Group>}
        {AccountPage === true && <SettingsPage setloadAll={setloadAll} setSingleChat={setSingleChat}></SettingsPage>}
        {User && <Socket></Socket>}
        <ToastContainer
          position="top-center"
          autoClose={3000}
          limit={3}
          hideProgressBar
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable={false}
          pauseOnHover
          theme="light"
        // transition={Zoom}
        />
        {/* {isSearch && !loadAll && <SearchPage isSearch={isSearch} loadAll={loadAll} setsearch={setsearch} setloadAll={setloadAll}/>} */}
      </div>
    )
  }
}

export default Chatpage