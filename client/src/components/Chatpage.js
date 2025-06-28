import React, { useState, useEffect, useContext, } from 'react'
import AllChats from './AllChats/AllChats'
import './allChats.css'
import ChatSideWindow from './AllChats/SideWindow'
import { AppContext } from './Context/ContextProvider'
import Group from './groupChat/Group'
// import SettingsPage from './Profile/Settings'
import Onechat from './OneChat/Onechat'
import ChatBot from './OneChat/ChatBot'
import Socket from './Socket/Socket'
import { Flip, ToastContainer, toast } from 'react-toastify';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';


const Chatpage = () => {
  const { isSending, AccountPage, User, showingBot, socket, setClicked, clickedChat, setChats, getChats } = useContext(AppContext)
  const [loadAll, setloadAll] = useState(true)
  const [isSingleChat, setSingleChat] = useState(false)
  const [isAddingGroup, setAddingGroup] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [incomingCall, setIncomingCall] = useState(null); // { from, roomId }

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
    if (!socket || !User) return;

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
  }, [socket, User]); // Ensure useEffect runs only when socket or User._id changes

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

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming-video-call', ({ from, roomId }) => {
      console.log(`Incoming video call from ${from} in room ${roomId}`);
      setIncomingCall({ from, roomId });
    });

    return () => socket.off('incoming-video-call');
  }, [socket]);


  if (windowWidth <= 850) {
    return (
      <div className='ChatPage'>
        {incomingCall && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
            <div className="bg-gray-900 text-white px-6 py-4 rounded-xl shadow-lg flex flex-col items-center">
              <p className="text-lg font-semibold">Incoming Video Call</p>
              <div className="mt-3 flex gap-4">
                <button
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-green-600 hover:bg-green-700 transition"
                  onClick={() => {
                    setIncomingCall(null);
                    window.open(`/video-call/${incomingCall.roomId}`);
                  }}
                  title="Answer Call"
                >
                  <FontAwesomeIcon icon={faPhone} size="lg" />
                </button>
                <button
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-red-600 hover:bg-red-700 transition"
                  onClick={() => {
                    socket.emit('leave-video-room', {
                      roomId: incomingCall.roomId,
                      userId: User._id
                    });
                    setIncomingCall(null);
                  }}
                  title="Decline Call"
                >
                  <FontAwesomeIcon icon={faPhoneSlash} size="lg" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* {isSingleChat===false && <AllChats loadAll={loadAll}  isSingleChat={isSingleChat} setSingleChat={setSingleChat} setloadAll={setloadAll}/>} */}
        {isAddingGroup === false && isSingleChat === false && showingBot === false && <AllChats setAddingGroup={setAddingGroup} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {isAddingGroup === false && isSingleChat === true && loadAll === false && <Onechat windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {showingBot === true && isSingleChat === false && loadAll === false && <ChatBot setSingleChat={setSingleChat} setloadAll={setloadAll}></ChatBot>}
        {/* {isSingleChat===true && isAddingGroup===false &&AccountPage===false && <MainChatPage loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />} */}
        {isAddingGroup === true && <Group setloadAll={setloadAll} setSingleChat={setSingleChat} setAddingGroup={setAddingGroup}></Group>}
        {/* {AccountPage === true && <SettingsPage setloadAll={setloadAll} setSingleChat={setSingleChat}></SettingsPage>} */}
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
        {isAddingGroup === false && <AllChats setAddingGroup={setAddingGroup} windowWidth={windowWidth} loadAll={loadAll} isSingleChat={isSingleChat} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {showingBot === true && isSingleChat === false && <ChatBot setSingleChat={setSingleChat} setloadAll={setloadAll}></ChatBot>}
        {isSingleChat && showingBot === false && isAddingGroup === false && <Onechat loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />}
        {/* {isSingleChat && isAddingGroup===false && AccountPage===false && <MainChatPage loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll} />} */}
        {!isSingleChat && isAddingGroup === false && showingBot === false && <ChatSideWindow />}
        {isAddingGroup === true && <Group setloadAll={setloadAll} setSingleChat={setSingleChat} setAddingGroup={setAddingGroup}></Group>}
        {/* {AccountPage === true && <SettingsPage setloadAll={setloadAll} setSingleChat={setSingleChat}></SettingsPage>} */}
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