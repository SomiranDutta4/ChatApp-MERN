import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../../Context/ContextProvider';

const IndChat = ({ pic, setloadAll, _id, chatName, isGroupChat, latestMessage, setSingleChat, unreadMsg }) => {
  const [timePassed, setTime] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [latestMsgSender, setSender] = useState('');
  const menuRef = useRef(null);

  const {
    User, setUser, LoadedChats, clickedChat,
    setClicked, setChats, setShowingBot, setMessages, URL
  } = useContext(AppContext);
  const navigate = useNavigate();

  const content = latestMessage?.content;
  const senderId = latestMessage?.sender?._id;
  const senderName = latestMessage?.sender?.name;
  const sentAt = latestMessage?.createdAt;
  const hasMedia = latestMessage?.media?.path;

  const clickedOne = async () => {
    if (!User || !User.token) {
      localStorage.removeItem('UserData');
      setUser('');
      navigate('/Login');
      return;
    }

    if (clickedChat._id === _id) return;

    setloadAll(false);
    setSingleChat(true);
    setShowingBot(false);
    setClicked('');
    setSingleChat(true);

    try {
      const ChatURL = `${URL}/chat/get/one/?_id=${_id}&chatName=${chatName}&token=${User.token}`;
      const response = await fetch(ChatURL, { method: 'GET' });

      if (response.status === 401) {
        setUser('');
        setChats([]);
        navigate('/Login');
      } else if (response.status === 500) {
        console.log('server issue');
        navigate('/Chat');
      } else if (response.status === 200) {
        const data = await response.json();
        let number = User.contactNumber;
        let users = [];

        for (let i = 0; i < data.users.length; i++) {
          if (isGroupChat) {
            users.push(data.users[i].name);
          } else if (data.users[i].contactNumber !== User.contactNumber) {
            users.push(data.users[i].name);
            number = data.users[i].contactNumber;
          }
        }

        if (isGroupChat) number = users;

        const newChat = {
          pic,
          number,
          isGroupChat: data.isGroupChat,
          chatName: data.chatName,
          _id: data._id,
          users: data.users,
          groupAdmins: data.groupAdmins,
          createdBy: data.createdBy,
          latestMessageSeen: false
        };

        setMessages(data.messages);
        setloadAll(false);
        setClicked(newChat);
        setSingleChat(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!sentAt) return setTime('');

    const createdAt = new Date(sentAt).getTime();
    const now = Date.now();
    const diff = now - createdAt;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) setTime('Now');
    else if (hours < 1) setTime(`${minutes} minutes ago`);
    else if (hours < 24) setTime(`${hours} hours ago`);
    else setTime(`${days} days ago`);
  }, [sentAt]);

  useEffect(() => {
    if (User && senderId === User._id) {
      setSender('you');
    } else {
      setSender(senderName);
    }
  }, [User, senderId, senderName]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const deleteChat = async (e) => {
    e.stopPropagation();
    setShowMenu(false);

    if (!User?.token) {
      setUser('');
      navigate('/Login');
      return;
    }

    try {
      const response = await axios.delete(`${URL}/chat/delete/?token=${User.token}`, {
        data: { chatId: _id }
      });

      if (response.status === 200) {
        setChats((prev) => prev.filter(chat => chat._id !== _id));
      } else {
        alert('Failed to delete chat');
      }
    } catch (err) {
      console.error('Error deleting chat:', err);
      alert('Could not delete chat');
    }
  };

  return (
    <div
      onClick={clickedOne}
      id={_id}
      className='AllChatsContainer indChatWrapper relative group'
    >
      <div className='pfpDiv'>
        <div className='pfp'>
          <img className='dp' src={pic} alt="chat pfp" />
        </div>
      </div>

      <div className='indvidualChats'>
        <div className='chatNameDiv'>
          <p className='chatName'>{chatName}</p>
        </div>
        <div className='latestmsgDiv'>
          <div className='chatElelmInd'>
            {senderName && (
              <span className='sender LMdetails'>{latestMsgSender}:</span>
            )}
            {content && (
              <span className='latestMessage LMdetails'>{content}</span>
            )}
            {hasMedia && (
              <span className='latestMessage LMdetails text-blue-400 ml-1'>(media)</span>
            )}
            {!content && !hasMedia && (
              <span className='LMdetails StartMsg'>Start sending Messages</span>
            )}
          </div>
          <div className='chatElelmInd'>
            <span className='sentAt LMdetails'>{timePassed}</span>
            {unreadMsg === true && <div className='unreadMsg-chat'></div>}
          </div>
        </div>
      </div>

      <div
        className="absolute top-3 right-3 hidden group-hover:flex z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="text-white text-lg px-2 py-1 rounded-full hover:bg-gray-700 transition"
        >
          ⋮
        </button>

        {showMenu && (
          <div
            ref={menuRef}
            className="absolute top-8 right-0 w-36 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-20"
          >
            <button
              onClick={deleteChat}
              className="w-full text-left px-4 py-2 text-sm text-white hover:bg-red-600 hover:text-white transition"
            >
              Delete Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndChat;
