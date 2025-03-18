import React, { useEffect, useContext } from 'react'
import { AppContext } from '../Context/ContextProvider'
import { toast } from 'react-toastify';


const Socket = () => {
  const { User, clickedChat, socket, LoadedChats,
    NewMEssageHandler, setLoadedChats, setClicked, setChats } = useContext(AppContext)

  useEffect(() => {
    if (!socket) {
      return
    }
    const messageHandler = (newMessage) => {
      NewMEssageHandler(newMessage, false);

      if (!clickedChat || clickedChat._id !== newMessage.chat) {
        toast(`${newMessage.sender.name}: ${newMessage.content}`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: false,
          progress: undefined,
          theme: "light",
        });
      }
    };
    socket.on("message recieved", messageHandler);
    return () => {
      socket.off("message recieved", messageHandler);
    };
  })


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
    if (!socket) {
      return
    }
    socket.on('added admin', groupDetails => {
      let newLoadedChats = LoadedChats
      newLoadedChats.forEach(chat => {
        if (chat._id === groupDetails.chatId) {
          chat.groupAdmins.push(User)
          if (clickedChat._id === chat._id) {
            setClicked(chat)
          }
        }
      })
      setLoadedChats(newLoadedChats)
    })
  })

  useEffect(() => {
    if (!socket) {
      return
    }
    socket.on('removed admin', groupDetails => {
      let newLoadedChats = LoadedChats
      newLoadedChats.forEach(chat => {
        if (chat._id === groupDetails.chatId) {
          let newAdmins = chat.groupAdmins.filter(user => user._id !== User._id)
          chat.groupAdmins = newAdmins
          if (clickedChat._id === chat._id) {
            setClicked(chat)
          }
        }
      })
      setLoadedChats(newLoadedChats)
    })
  })


  return (
    <div></div>
  )
}

export default Socket
