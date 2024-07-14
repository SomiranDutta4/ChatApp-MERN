import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera,faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
const ChatDetails = ({setSHowChat}) => {
    const {User,clickedChat,setClicked,LoadedChats,setLoadedChats,setChats}=useContext(AppContext)

    const [ChatName,setChatName]=useState(clickedChat.chatName)
    const [ChatUsers,setChatUsers]=useState(clickedChat.users)
    const [loaded,setLoaded]=useState(false)
    const [isAdmin,setAdmin]=useState(false)
    const [targetedUser,setTargetedUser]=useState({})
   
    const goBack=()=>{
        setSHowChat(false)
    }

    const makeAdmin=async()=>{

    if(isAdmin===false){return}
    let AdminUrl=`http://localhost:2000/chat/add/admin/?token=${User.token}`
    try {
        let response=await fetch(AdminUrl,{
            method:'PATCH',
            headers: {
                'Content-Type': 'application/json', // Specify content type JSON
              },
            body:JSON.stringify({
                newAdmin:targetedUser._id,
                chatId:clickedChat._id
            })
        })
        if(response.status===200){
            let newClickedChat=clickedChat
            newClickedChat.GroupAdmins.push(targetedUser)
            setClicked(newClickedChat)

            let newLoadedChats=LoadedChats
            for(let i=0;i<newLoadedChats.length;i++){
                if(newLoadedChats[i]._id===clickedChat._id){
                    newLoadedChats[i]._id=clickedChat
                    setLoadedChats(newLoadedChats)
                    break
                }
            }

            
        }else if(response.status===401){
            localStorage.removeItem('UserData')
            setLoadedChats([])
            setChats([])
        }else{
            console.log('there was an error')
        }
    } catch (error) {
        console.log(error)
    }
    setTargetedUser({})
    }

    const removeAdmin=async()=>{

        if(!targetedUser || targetedUser=={} || !targetUser._id){
            return
        }
        let removerUrl=`http://localhost:2000/chat/remove/admin/${User.token}`
        try {
            let response=await fetch(removerUrl,{
                method:'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                  },
                body:JSON.stringify({
                    Admin:targetedUser._id,
                    chatId:clickedChat._id
                })
            })
            if(response.status==200){
                let newClickedChat=clickedChat
                let newAdminArray=newClickedChat.GroupAdmins.filter(obj=>obj._id!==targetedUser._id)
                newClickedChat.GroupAdmins=newAdminArray
                setClicked(newClickedChat)

                let newLoadedChats=LoadedChats
            for(let i=0;i<newLoadedChats.length;i++){
                if(newLoadedChats[i]._id===clickedChat._id){
                    newLoadedChats[i]._id=clickedChat
                    setLoadedChats(newLoadedChats)
                    break
                }
            }

            }else if(response.status===401){
                localStorage.removeItem('UserData')
            setLoadedChats([])
            setChats([])
            }else{
                console.log('errror')
            }
        } catch (error) {
            console.log(error)
        }
        setTargetedUser({})
    }


    const removeMember=async()=>{

           //req.body.chatId
    //req.body.memberId
        if(!targetedUser || targetedUser=={} || !targetUser._id){
            return
        }
        let removerUrl=`http://localhost:2000/chat/remove/member/${User.token}`
        try {
            let response=await fetch(removerUrl,{
                method:'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                  },
                body:JSON.stringify({
                    memberId:targetedUser._id,
                    chatId:clickedChat._id,
                    lastMessage:clickedChat.messages[clickedChat.messages.lengh-1]._id
                })
            })
            if(response.status==200){
                let newClickedChat=clickedChat
                let newAdminArray=newClickedChat.GroupAdmins.filter(obj=>obj._id!==targetedUser._id)
                let newUserArray=newClickedChat.users.filter(obj=>obj._id!==targetedUser._id)
                newClickedChat.GroupAdmins=newAdminArray
                newClickedChat.users=newUserArray

                setClicked(newClickedChat)

                let newLoadedChats=LoadedChats
                for(let i=0;i<newLoadedChats.length;i++){
                    if(newLoadedChats[i]._id===clickedChat._id){
                        newLoadedChats[i]._id=clickedChat
                        setLoadedChats(newLoadedChats)
                        break
                    }
                }
            }else if(response.status===401){
                localStorage.removeItem('UserData')
            setLoadedChats([])
            setChats([])
            }else{
                console.log('errror')
            }
        } catch (error) {
            console.log(error)
        }
        //req.Admin
    //req.bdy.chatId
    }

    const targetUser=(event)=>{
        let UserId=event.target.id
        let foundObject = setChatUsers.find(obj => obj._id === UserId);
        setTargetedUser(foundObject)
    }
    const removeTargeted=()=>{
        setTargetedUser({})
    }




    useEffect(()=>{
        if(clickedChat.chatName && clickedChat.users && loaded===false){
            let AdminResult=clickedChat.GroupAdmins.some(admin=>admin._id ===User._id) 
            if(AdminResult){
                setAdmin(true)
            }  
            setChatName(clickedChat.chatName)
            setChatUsers(clickedChat.users)
            setLoaded(true)
        }
        console.log(clickedChat)
    })

  return (
    <div className='ProfilePage-Container'>

        {targetedUser && targetedUser!={} && isAdmin===true &&
        <div className='AdminsEditor'>
            <p onClick={makeAdmin} className='AdminsOptions'>Make Admin</p>
            <p onClick={removeMember} className='AdminsOptions'>kick from this Group</p>
            <p onClick={removeAdmin} className='AdminsOptions'>Remove Admin</p>
        </div>
    
        }

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
                        <FontAwesomeIcon onClick={targetUser} icon={faCamera}></FontAwesomeIcon>
                    <input id="file-input" type="file" style={{ display: 'none' }} />
                    </label>
                    </div>
                    }
                </div>
                <div className='BasicDetails-ChatPage'>
                <div className='displayDetails-ChatPage'>name:<span className='Details-span-ChatDetails' >{ChatName}</span></div>
                {clickedChat.isGroupChat===true &&
                    <div className='displayDetails-profile'>Users: 
                       {clickedChat.isGroupChat===true && 
                    <button className='AddMember-ChatGrp'>+ Add members</button>
                    }
                    {ChatUsers.map((element)=>{
                        return <div className='Chat-User'>
                            <div className='Details-span-DP groupmembers'>
                                <img>{element.pic}</img>
                            </div>
                            <div className='Details-span-ChatDetails GroupChat'>
                            <span className='element-name'>{element.name}</span>
                            <p className='element-contact'>{element.contactNumber}</p>
                            </div>
                            {clickedChat.GroupAdmins.some(admin=>admin._id ===element._id) &&
                            <span className='isAdmin-Chat'>Admin</span>
                            }
                            {isAdmin===true && element._id!==User._id && <FontAwesomeIcon id={element._id} style={{cursor:'pointer',fontSize:'150%'}} icon={faEllipsisVertical} className='MemberEditBtn-chat'></FontAwesomeIcon>}
                        </div>
                    })}
                    </div>
                }
                {clickedChat.isGroupChat===false && ChatUsers.length===2 &&
                    <div className='displayDetails-profile'>contact:
                    <span className='Details-span-ChatDetails SingleChat'>{ChatUsers[1]._id===User._id?ChatUsers[0].contactNumber:ChatUsers[1].contactNumber}</span>
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