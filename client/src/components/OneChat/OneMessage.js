import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faClock } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/ContextProvider';

const OneMessage = ({
  message, sender, userToken, sentBy,
  chatId, messageId, status, isDeleted, ShMessage
}) => {
  const {
    clickedChat, setClicked, AllChats, LoadedChats,
    setChats, setLoadedChats, setSending, User, URL
  } = useContext(AppContext);
  const navigate = useNavigate();
  const [showEdit, setEdit] = useState(false);
  const [editing, setEditingMsg] = useState(false);
  const [successMessage, setMessage] = useState('');
  const [isChangingMsg, setChanging] = useState(false);
  const [changedMsg, setChangedMsg] = useState('');
  const [seen, setSeenBy] = useState([]);
  const [showingSeen, setshowing] = useState(false);
  const [messageStatus, setStatus] = useState(status);

  const show = () => setEdit(true);
  const hide = () => {
    setEdit(false);
    setEditingMsg(false);
  };
  const EditMessage = () => {
    setChanging(true);
    setEditingMsg(false);
  };
  const ChangeEdit = (e) => setChangedMsg(e.target.value);
  const cancelEditingMsg = () => setChanging(false);

  const confirmEdit = async () => {
    if (changedMsg === message || changedMsg.trim() === '') return;
    setSending(true);
    try {
      const response = await fetch(`${URL}/message/edit/?token=${User.token}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newContent: changedMsg, chatId, messageId })
      });
      if (response.status === 401) {
        localStorage.removeItem('UserData');
        setChats([]);
        setLoadedChats([]);
        navigate('/Login');
        return;
      }
      const updatedChat = { ...clickedChat };
      updatedChat.messages = updatedChat.messages.map(msg =>
        msg._id === messageId ? { ...msg, content: changedMsg } : msg
      );
      setClicked(updatedChat);
      setChats(AllChats.map(chat =>
        chat.latestMessage._id === messageId ? { ...chat, latestMessage: { ...chat.latestMessage, content: changedMsg } } : chat
      ));
      setLoadedChats(LoadedChats.map(chat =>
        chat._id === clickedChat._id ? updatedChat : chat
      ));
    } catch { }
    setSending(false);
    setChanging(false);
  };

  const deleteMessage = async () => {
    if (isDeleted) return;
    const updatedChat = { ...clickedChat };
    updatedChat.messages = updatedChat.messages.map(msg =>
      msg._id === messageId ? { ...msg, content: 'message was deleted', isDeleted: true } : msg
    );
    setClicked(updatedChat);
    setChats(AllChats.map(chat =>
      chat.latestMessage._id === messageId ? { ...chat, latestMessage: { ...chat.latestMessage, content: 'message was deleted' } } : chat
    ));
    setLoadedChats(LoadedChats.map(chat =>
      chat._id === clickedChat._id ? updatedChat : chat
    ));
    hide();
    setStatus('sending');
    setSending(true);
    try {
      await fetch(`${URL}/message/delete/?token=${userToken}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, chatId })
      });
    } catch { }
    setSending(false);
    setStatus('sent');
  };

  const checkSeen = () => {
    try {
      const seenArray = ShMessage.readBy.filter(user => user._id !== User._id).map(user => user.name);
      setSeenBy(seenArray);
    } catch { }
  };

  useEffect(() => {
    checkSeen();
  }, []);

  return (
    <div
      className={`flex my-2 ${sender === 'byMe' ? 'justify-end' : 'justify-start'} w-full`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <div className={`mx-2 relative max-w-[65vw] rounded-xl p-3 bg-gray-800 text-white`}>
        {ShMessage.sender._id !== User._id && sentBy &&
          <p className='text-sm text-gray-400 mb-1'>{sentBy}</p>
        }

        {ShMessage.media?.path && (
          <div
            onClick={() => window.open(`${URL}/${ShMessage.media.path.replace(/\\/g, '/')}`, '_blank')}
            className='max-w-xs p-3 bg-gray-700 text-white rounded-md flex items-center gap-2 cursor-pointer mb-2'
          >
            {ShMessage.media.mimetype.startsWith("image/") ? (
              <>
                <span className='text-xl'>🖼️</span>
                <span className='text-sm'>Image file (click to open)</span>
              </>
            ) : (
              <>
                <span className='text-lg'>▶️</span>
                <span className='text-sm'>Video file (click to open)</span>
              </>
            )}
          </div>
        )}



        {!isDeleted && message && (
          <span>{message}</span>
        )}

        {messageStatus === 'sending' && (
          <FontAwesomeIcon icon={faClock} className='ml-2 text-xs text-gray-400' />
        )}

        {editing && !isDeleted && (
          <div className='absolute top-0 right-0 mt-1 mr-2 bg-gray-700 text-sm rounded shadow-lg z-10'>
            <button onClick={() => navigator.clipboard.writeText(message)} className='block px-4 py-1 hover:bg-gray-600'>Copy</button>
            <button onClick={EditMessage} className='block px-4 py-1 hover:bg-gray-600'>Edit</button>
            <button onClick={deleteMessage} className='block px-4 py-1 hover:bg-gray-600'>Delete</button>
          </div>
        )}

        {showingSeen && (
          <div className='absolute bottom-full mb-2 right-0 text-xs bg-gray-900 p-2 rounded-md'>
            {clickedChat.isGroupChat ?
              seen.length ? seen.map(name => <p key={name}>{name}</p>) : <span>Not Seen</span>
              : <span>{seen.length ? 'Seen' : 'Not Seen'}</span>
            }
          </div>
        )}
      </div>

      {isChangingMsg && (
        <div className='fixed bottom-0 left-0 right-0 flex items-center justify-center p-4 bg-gray-900 border-t border-gray-700 z-20'>
          <input
            className='flex-grow max-w-xl px-4 py-2 rounded bg-gray-800 text-white border border-green-500'
            onChange={ChangeEdit}
            value={changedMsg}
            placeholder='Edit message...'
          />
          {changedMsg.trim() && (
            <FontAwesomeIcon
              onClick={confirmEdit}
              icon={faPaperPlane}
              className='ml-4 text-green-400 cursor-pointer'
            />
          )}
          <button onClick={cancelEditingMsg} className='ml-2 text-red-400 text-lg'>✕</button>
        </div>
      )}
    </div>
  );
};

export default OneMessage;