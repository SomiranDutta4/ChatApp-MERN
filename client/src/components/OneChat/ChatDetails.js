import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
const ChatDetails = ({setSHowChat,showChatDetails}) => {
    const {User,clickedChat}=useContext(AppContext)

    const [ChatName,setChatName]=useState(clickedChat.chatName)
    const [ChatUsers,setChatUsers]=useState(clickedChat.users)
    const [loaded,setLoaded]=useState(false)
   
    const goBack=()=>{
        setSHowChat(false)
    }
    useEffect(()=>{
        if(clickedChat.chatName && clickedChat.users && loaded===false){
            setChatName(clickedChat.chatName)
            setChatUsers(clickedChat.users)
            setLoaded(true)
        }
    })

  return (
    <div className='ProfilePage-Container'>

        <div className='backDiv-Account'>
            <button onClick={goBack} className='back-btn-Acc'>Back→</button>
        </div>
        <div className='ProfilePage'>
            <div className='changeDiv-profilePhoto'>
                <div className='ProfilePhotoDiv'>
                    <img className='PfP' src={clickedChat.pic}></img>
                    {clickedChat.isGroupChat===true &&
                    <div style={{height:"100%", display:'flex',alignItems:'flex-end'}}>
                    <label htmlFor="file-input" className="edit-button labelEdit-img">
                        <FontAwesomeIcon icon={faCamera}></FontAwesomeIcon>
                    <input id="file-input" type="file" style={{ display: 'none' }} />
                    </label>
                    </div>
                    }
                </div>
                <div className='BasicDetails-Account'>
                <div className='displayDetails-profile'>name:<span className='Details-span-ChatDetails' >{ChatName}</span></div>
                {clickedChat.isGroupChat===true &&
                    <div className='displayDetails-profile'>Users: 
                    {ChatUsers.map((element)=>{
                        return <div className='Chat-User'>
                            <p className='Details-span-ChatDetails GroupChat' >{element.name}</p>
                            <p className='Details-span-ChatDetails GroupChat' >{element.contactNumber}</p>
                        </div>
                    })}
                    </div>
                }
                {clickedChat.isGroupChat===false && ChatUsers.length===2 &&
                    <div className='displayDetails-profile'>contact:
                    <span className='Details-span-ChatDetails'>{ChatUsers[1]._id===User._id?ChatUsers[0].contactNumber:ChatUsers[1].contactNumber}</span>
                    </div>
                }
                </div>
            </div>
            
        </div>
    </div>
  );
;
}

export default ChatDetails;