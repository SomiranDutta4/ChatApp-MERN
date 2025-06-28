import React, { useEffect, useContext } from 'react'
import { AppContext } from '../Context/ContextProvider'
import { toast } from 'react-toastify';
import { useRef } from 'react';


const Socket = () => {
  const { User, clickedChat, socket,
    NewMEssageHandler, setClicked, setChats } = useContext(AppContext)
  const notificationSound = useRef(new Audio('/notification.mp3'));

  useEffect(() => {
    if (!socket) return;

    const messageHandler = (newMessage) => {
      NewMEssageHandler(newMessage, false);

      if (!clickedChat || clickedChat._id !== newMessage.chat) {
        try {
          notificationSound.current.play().catch(err => {
            console.warn("Audio play failed:", err);
          });
        } catch (err) {
          console.error("Error playing notification sound:", err);
        }

        toast(`${newMessage.sender.name}: ${newMessage.content}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          theme: "light",
        });
      }
    };

    socket.on("message recieved", messageHandler);
    return () => socket.off("message recieved", messageHandler);
  }, [socket, clickedChat]);


  useEffect(() => {
    if (!socket) return;

    const handleAddedMember = async () => {
      try {
        if (!clickedChat || !clickedChat._id) {
          window.location.reload(); // This will force a full page reload
        } else {
          toast('You were added to a new group, reload to view');
        }
      } catch (error) {
        console.error("Error fetching new chat:", error);
      }
    };

    socket.on('added member', handleAddedMember);

    return () => {
      socket.off('added member', handleAddedMember);
    };
  }, [socket, User.token, setChats]);



  useEffect(() => {
    if (!socket || !clickedChat?._id) return;

    const handleAddedAdmin = (groupDetails) => {
      if (clickedChat._id === groupDetails.chatId) {
        const updatedChat = {
          ...clickedChat,
          groupAdmins: [...clickedChat.groupAdmins, groupDetails.user],
        };
        setClicked(updatedChat);
      }
    };

    const handleRemovedAdmin = (groupDetails) => {
      if (clickedChat._id === groupDetails.chatId) {
        const updatedChat = {
          ...clickedChat,
          groupAdmins: clickedChat.groupAdmins.filter(admin => admin._id !== groupDetails.user._id),
        };
        setClicked(updatedChat);
      }
    };

    socket.on('added admin', handleAddedAdmin);
    socket.on('removed admin', handleRemovedAdmin);

    return () => {
      socket.off('added admin', handleAddedAdmin);
      socket.off('removed admin', handleRemovedAdmin);
    };
  }, [socket, clickedChat]);


  return (
    <div></div>
  )
}

export default Socket
