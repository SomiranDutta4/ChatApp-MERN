import React, { useEffect, useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatStyle.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faPaperPlane, faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import OneMessage from './OneMessage';
import { AppContext } from '../Context/ContextProvider';
import ChatDetails from './ChatDetails';
import axios from 'axios';
import sendIcon from '../../assets/images/send.png';

const Onechat = ({ setSingleChat, setloadAll, windowWidth }) => {
  const [showChatDetails, setShowChat] = useState(false);
  const [lastMessageSeen, setLastMessageSeen] = useState(false);
  const [message, setMessage] = useState('');
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [formData, setFormData] = useState({ file: null });
  const [showCallMenu, setShowCallMenu] = useState(false); // 👈 new state

  const {
    clickedChat, setClicked, User, setUser, setLoading, socket, NewMEssageHandler,
    messages, AllChats, setChats, setSending, SeeMessage, showingBot, messageEnd, URL
  } = useContext(AppContext);

  const navigate = useNavigate();
  const inputMessage = useRef(null);

  const changeMessage = (e) => setMessage(e.target.value);

  const sendMessage = async () => {
    if (!message.trim() && !formData.file) return;
    setLastMessageSeen(false);

    const newMsg = {
      _id: 'random123XYZ',
      chat: clickedChat._id,
      content: message,
      createdAt: new Date(),
      sender: User,
      isDeleted: false,
      readBy: [User],
      status: "sending",
      file: formData.file || null
    };

    NewMEssageHandler(newMsg, true);
    setSending(true);
    setMessage('');
    setFormData({ file: null });
    setShowMediaOptions(false)
    messageEnd.current?.scrollIntoView();

    if (!User?.token) {
      setUser('');
      setClicked('');
      setSingleChat(false);
      localStorage.removeItem('UserData');
      navigate('/Login');
      setLoading(false);
      return;
    }

    try {
      let config = {};
      let payload;

      if (formData.file) {
        payload = new FormData();
        payload.append('content', message);
        payload.append('sender', User.name);
        payload.append('_id', User._id);
        payload.append('chatId', clickedChat._id);
        payload.append('reqId', clickedChat.reqId || '');
        payload.append('file', formData.file);

        config.headers = {
          'Content-Type': 'multipart/form-data'
        };
      } else {
        payload = {
          content: message,
          sender: User.name,
          _id: User._id,
          chatId: clickedChat._id,
          reqId: clickedChat.reqId || ''
        };
      }

      const response = await axios.patch(`${URL}/message/send/?token=${User.token}`, payload, config);

      const updatedChat = response.data.chat;
      updatedChat.latestMessage = response.data.newMsg;

      socket.emit("new message", updatedChat);

      if (response.status === 300) {
        const newChat = {
          pic: clickedChat.pic,
          _id: clickedChat._id,
          chatName: clickedChat.chatName,
          isGroupChat: clickedChat.isGroupChat,
          users: clickedChat.users,
          latestMessage: updatedChat.latestMessage
        };
        setChats([...AllChats, newChat]);
      } else if (response.status === 401) {
        localStorage.removeItem('UserData');
        navigate('/Login');
      }

      NewMEssageHandler(updatedChat.latestMessage, true);
    } catch (err) {
      console.error("Send Message Error:", err);
    }
    setSending(false);
    messageEnd.current?.scrollIntoView();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && message.trim()) {
      sendMessage();
    }
  };

  const clickedBack = () => {
    setClicked('');
    setloadAll(true);
    setSingleChat(false);
  };
  const videoCall = () => {

  }
  const voiceCall = () => {

  }

  useEffect(() => {
    if (clickedChat) {
      inputMessage.current?.focus();
      messageEnd.current?.scrollIntoView();
      socket.emit('join chat', clickedChat._id);
    }
  }, [clickedChat]);

  useEffect(() => {
    inputMessage.current?.focus();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleSeen = (details) => {
      if (clickedChat?._id === details.chatId && !clickedChat.isGroupChat) {
        setLastMessageSeen(true);
      }
    };

    socket.on('seen messages', handleSeen);
    return () => socket.off('seen messages', handleSeen);
  }, [socket, clickedChat]);

  useEffect(() => {
    if (messages.length && clickedChat) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.readBy.length === clickedChat.users.length || clickedChat.lastMessageSeen) {
        setLastMessageSeen(true);
      }
      SeeMessage();
    }
  }, [messages]);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFormData({ file });
  };

  useEffect(() => {
    messageEnd.current?.scrollIntoView();
  }, [messages, lastMessageSeen]);

  if (showChatDetails || showingBot) {
    return <ChatDetails setSHowChat={setShowChat} showChatDetails={showChatDetails} />;
  }

  return (
    <div className='chatDisplay'>
      {!clickedChat ? (
        <div className='spinnerDiv-group'>
          <FontAwesomeIcon style={{ color: 'white' }} className="spinner-Group fa-spin-pulse" icon={faSpinner} />
        </div>
      ) : (
        <>
          {/* TOP BAR */}
          <div className='flex justify-between p-2'>
            <div className='flex flex-row align-center'>
              {windowWidth <= 850 && (
                <div className='flex align-center mr-2 ml-1'>
                  <button onClick={clickedBack} className='backbtn'>&#8592;</button>
                </div>
              )}
              <div onClick={() => setShowChat(true)} className='chatDetails cursor-pointer'>
                <div className='chatDpDiv'>
                  <div className='chatDp'>
                    <img src={clickedChat.pic} alt="chat" />
                  </div>
                </div>
                <div className='chatNameDiv'>
                  <div className='chatName'>
                    <span className='MainChat-chatName'>{clickedChat.chatName}</span>
                    <div className='contact-div-onechat'>
                      {clickedChat.isGroupChat
                        ? clickedChat.number.map((member, i) => (
                          <span key={i}>{member}{i !== clickedChat.number.length - 1 ? ', ' : ' '}</span>
                        ))
                        : (clickedChat.number || clickedChat.contactNumber)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-3 px-2 py-1">
              <button
                onClick={videoCall}
                title="Video Call"
                className="p-2 rounded-full hover:text-green-400 transition duration-200"
              >
                <FontAwesomeIcon icon={faVideo} size="lg" />
              </button>
              <button
                onClick={voiceCall}
                title="Voice Call"
                className="p-2 rounded-full hover:text-blue-400 transition duration-200"
              >
                <FontAwesomeIcon icon={faPhone} size="lg" />
              </button>
            </div>

          </div>

          {/* CHAT MESSAGES */}
          <div className='chatDisplayContainer'>
            {messages.map((msg) => (
              <OneMessage
                key={msg._id}
                ShMessage={msg}
                isDeleted={msg.isDeleted}
                message={msg.content}
                messageId={msg._id}
                chatId={clickedChat._id}
                userToken={User.token}
                status={msg.status || 'sent'}
                sentBy={clickedChat.isGroupChat ? msg.sender.name : null}
                sender={User._id === msg.sender._id || User._id === msg.sender ? 'byMe' : 'byThem'}
                senderId={msg.sender._id}
              />
            ))}
            {lastMessageSeen && messages.length > 0 && messages[messages.length - 1]?.sender?._id === User._id && (
              <div style={{ textAlign: 'end', margin: '0 10px', fontSize: '85%' }}>seen</div>
            )}
            <div ref={messageEnd}></div>
          </div>

          {/* INPUT AREA */}
          <div className='chatInputContainerDiv'>
            <div className='chatInputDiv'>
              <button
                onClick={() => {
                  if (showMediaOptions) {
                    setFormData({ file: null });
                  }
                  setShowMediaOptions((prev) => !prev)
                }}
                className="relative text-white text-2xl w-9 h-9 flex items-center justify-center rounded-xl
                bg-[#2a2a2a] hover:bg-[#3a3a3a] transition-colors duration-200 shadow-sm"
              >
                <span className={`absolute transition-all duration-200 ease-in-out transform ${showMediaOptions ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>+</span>
                <span className={`absolute transition-all duration-200 ease-in-out transform ${showMediaOptions ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>✕</span>
              </button>

              <div className='inputMessageDiv'>
                <input
                  className='inputDisplay'
                  id={message ? 'isTyping' : 'notTyping'}
                  onChange={changeMessage}
                  ref={inputMessage}
                  value={message}
                  onKeyDown={handleKeyPress}
                  placeholder='Enter Message'
                />
                {showMediaOptions && (
                  <div className="absolute bottom-14 left-4 bg-gray-800 text-white rounded-lg shadow-lg p-3 z-50 w-60">
                    <div className="mb-2 text-sm">Upload Media</div>
                    <input
                      type="file"
                      accept="image/*,video/*"
                      className="block w-full text-sm text-gray-300 file:mr-4 file:py-1 file:px-2
                    file:rounded-full file:border-0 file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      onChange={handleMediaUpload}
                    />
                  </div>
                )}
                {(message || formData.file) && (
                  <button
                    onClick={sendMessage}
                    className="ml-2 w-9 h-9 flex items-center justify-center rounded-xl
                    bg-[#7e7272] hover:bg-[#3a3a3a] shadow-sm transition-all duration-200"
                  >
                    <img src={sendIcon} alt="Send" className="w-5 h-5 object-contain" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Onechat;
