import React, { useContext } from 'react';
import { AppContext } from '../Context/ContextProvider';

const LocalUsers = ({setloadAll,setSingleChat}) => {
  const { LocalFound,User,setClicked,LoadedChats,setUser,URL} = useContext(AppContext);


  const ClickedALocal=async(id)=>{
    const newChat=LocalFound.find(chat=>chat._id==id)
    let messages=LoadedChats.filter(obj=>obj._id==id)
    console.log(messages)

    if(!messages || messages.length===0){
      let url=URL+`/chat/get/one/?_id=${id}&chatName=${newChat.chatName}&token=${User.token}`
      let response=await fetch(url)

      if(response.status===401){
        localStorage.removeItem('UserData')
        setUser('')
        return
    }
    let data=await response.json()
    messages=data.messages
  }
  newChat.messages=messages
  var number=User.contactNumber;
  var users=[]
  for(let i=0;i<newChat.users.length;i++){
        if(newChat.isGroupChat===true){
          users.push(newChat.users[i].name)
        }else if(newChat.users[i].contactNumber!==User.contactNumber){
          users.push(newChat.users[i].name)
          number=newChat.users[i].contactNumber
        }
      }
      if(newChat.isGroupChat===true){
        number=users
  }
  newChat.number=number
  console.log(newChat)
  if(newChat){
      setClicked(newChat)
      setSingleChat(true)
      setloadAll(false)
    }
  }

  return (
    <div className='LocalUsers'>
      {LocalFound.map(chat => {
        let contactNumber = '';
        if (chat.users.length === 1) {
          contactNumber = chat.users[0].contactNumber;
        } else if (!chat.isGroupChat && chat.users.length === 2) {
          const otherUser = chat.users.find(user => user._id !== User._id);
          contactNumber = otherUser ? otherUser.contactNumber : '';
        } else {
          contactNumber = chat.users.map(user => user.name).join(', ');
        }

        return (
          <div onClick={()=>ClickedALocal(chat._id)} key={chat._id}>
          <div className="user-card Local">
          <div className='user-avatar-div'>
              <img src={chat.pic} className="user-avatar" />
              </div>
              <div className="user-info">
              <h3>{chat.chatName}</h3>
              <p>{contactNumber}</p>
            </div>
          </div>
          </div>
        );
      })}
      {!LocalFound &&
            <div>
            could not find searched user...
          </div>
      }

    </div>
  );
};

export default LocalUsers;