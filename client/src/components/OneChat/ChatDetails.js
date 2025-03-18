import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
import AddMemberPage from './AddMembers'
import { toast } from 'react-toastify';

const ChatDetails = ({ setSHowChat }) => {
    const { User, socket, clickedChat, setClicked, LoadedChats, setLoadedChats, setChats, setSending, URL } = useContext(AppContext)

    const [ChatName, setChatName] = useState(clickedChat.chatName)
    const [ChatUsers, setChatUsers] = useState(clickedChat.users)
    const [loaded, setLoaded] = useState(false)
    const [isAdmin, setAdmin] = useState(false)
    const [targetedUser, setTargetedUser] = useState({})
    const [isTargetedAdmin, setTargetedAdmin] = useState(false)
    const [isAdding, setAdding] = useState(false)
    const [AuthError, setError] = useState({
        message: '',
        type: ''
    })

    // let setErrorfunc = (message, type) => {
    //     setError({
    //         message: message,
    //         type: type
    //     })
    //     setTimeout(() => {
    //         setError('')
    //     }, 3000);
    // }

    const goBack = () => {
        setSHowChat(false)
    }

    const AdminHandler = async () => {
        let groupDetails = {
            chatId: clickedChat._id,
            user: targetedUser,
        }
        if (isAdmin === false) { return }
        let AdminUrl
        if (isTargetedAdmin === false) {
            AdminUrl = URL + `/chat/add/admin/?token=${User.token}`
        } else {
            AdminUrl = URL + `/chat/remove/admin/?token=${User.token}`
        }
        try {
            setSending(true)
            let response = await fetch(AdminUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                },
                body: JSON.stringify({
                    Admin: targetedUser._id,
                    chatId: clickedChat._id
                })
            })

            if (response.status === 200) {
                let newClickedChat = clickedChat
                if (isTargetedAdmin === false) {
                    newClickedChat.groupAdmins.push(targetedUser)
                    setTargetedAdmin(true)
                    socket.emit('add admin', groupDetails)
                } else {
                    let newAdminArray = newClickedChat.groupAdmins.filter(obj => obj._id !== targetedUser._id)
                    newClickedChat.groupAdmins = newAdminArray
                    setTargetedAdmin(false)
                    socket.emit('remove admin', groupDetails)
                }
                setClicked(newClickedChat)

                let newLoadedChats = LoadedChats
                for (let i = 0; i < newLoadedChats.length; i++) {
                    if (newLoadedChats[i]._id === clickedChat._id) {
                        newLoadedChats[i] = clickedChat
                        setLoadedChats(newLoadedChats)
                        break
                    }
                }
                toast.success('Successfully Updated', 'success')
            } else if (response.status === 401) {
                localStorage.removeItem('UserData')
                setLoadedChats([])
                setChats([])
            } else if (response.status === 400) {
                toast.error("You can't demote the creator of the group", 'error')
            } else {
                toast.error('Some Error Occured', 'error')
            }
            setSending(false)
        } catch (error) {
            console.log(error)
        }
        setTargetedUser(null)
    }

    const removeMember = async () => {
        if (!targetedUser || !targetedUser._id) {
            return
        }

        let removerUrl = URL + `/chat/remove/member/?token=${User.token}`
        try {
            let response = await fetch(removerUrl, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                },
                body: JSON.stringify({
                    memberId: targetedUser._id,
                    chatId: clickedChat._id,
                })
            })
            if (response.status == 200) {
                let newClickedChat = clickedChat
                let newAdminArray = newClickedChat.groupAdmins.filter(obj => obj._id !== targetedUser._id)
                let newUserArray = newClickedChat.users.filter(obj => obj._id !== targetedUser._id)
                newClickedChat.groupAdmins = newAdminArray
                newClickedChat.users = newUserArray
                if (clickedChat.isGroupChat === true) {
                    for (let i = 0; i < newClickedChat.number.length; i++) {
                        if (newClickedChat.number[i] === targetedUser.name) {
                            let newNumber = newClickedChat.number.splice(i, 1)
                            newClickedChat.number = newNumber
                            break
                        }
                    }
                }
                setClicked(newClickedChat)

                let newLoadedChats = LoadedChats
                for (let i = 0; i < newLoadedChats.length; i++) {
                    if (newLoadedChats[i]._id === clickedChat._id) {
                        newLoadedChats[i] = clickedChat
                        setLoadedChats(newLoadedChats)
                        break
                    }
                }
                setChatUsers(newUserArray)
                toast.success('Removed the User', 'success')
            } else if (response.status === 401) {
                localStorage.removeItem('UserData')
                setLoadedChats([])
                setChats([])
            } else if (response.status === 400) {
                toast.error("The creator of the group can't be removed", 'error')
            } else {
                toast.error('some error occured', 'error')
            }
        } catch (error) {
            toast.error('Could not remove', 'error')
        }
        let groupDetails = {
            chatId: clickedChat._id,
            user: targetedUser,
            name: clickedChat.chatName
        }
        socket.emit('remove member', groupDetails)
        setTargetedUser(null)
    }

    const targetUser = (value) => {
        if (targetedUser) {
            setTargetedUser(null)
            setTargetedAdmin(false)
        }
        let UserId = value
        let foundObject = ChatUsers.find(obj => obj._id === UserId);
        setTargetedUser(foundObject)
        try {
            if (clickedChat.groupAdmins.some(admin => admin._id === value)) {
                setTargetedAdmin(true)
            }
        } catch (error) { }
    }
    const removeTargeted = () => {
        setTargetedUser(null)
        setTargetedAdmin(false)
    }
    const AddMembers = () => {
        setAdding(true)
    }

    useEffect(() => {
        if (clickedChat.chatName && clickedChat.users && loaded === false) {
            if (clickedChat.isGroupChat === true) {
                let AdminResult = clickedChat.groupAdmins.some(admin => admin._id === User._id)
                if (AdminResult) {
                    setAdmin(true)
                }
            }
            setChatName(clickedChat.chatName)
            setChatUsers(clickedChat.users)
            setLoaded(true)
        }
    })
    useEffect(() => {
        setTargetedUser(null)
        setTargetedAdmin(false)
    }, [])

    return (

        <div className='ProfilePage-Container'>
            {AuthError.message != '' &&
                <div className={`AuthError-Container ${AuthError.type}`}>
                    <p>{AuthError.message}</p>
                </div>}
            {isAdding == true &&
                <AddMemberPage setAdding={setAdding}></AddMemberPage>}

            {targetedUser && targetedUser != {} && isAdmin === true &&
                <div className='AdminsEditor'>
                    <div onClick={removeTargeted} style={{ textAlign: 'end', cursor: 'pointer' }}>✕</div>
                    <p onClick={AdminHandler} className='AdminsOptions'>{isTargetedAdmin === true ? 'Remove Admin' : 'Make Admin'}</p>
                    <p onClick={removeMember} className='AdminsOptions'>kick from this Group</p>
                </div>

            }

            <div className='backDiv-Account'>
                <button onClick={goBack} className='back-btn-Acc'>Back→</button>
            </div>
            <div className={`ProfilePage ChatPf isAdding-${isAdding}`}>
                <div className='changeDiv-profilePhoto ChatPf'>
                    <div className={`ProfilePhotoDiv isGroup-${clickedChat.isGroupChat}`}>
                        <img className={`PfP isGroup-${clickedChat.isGroupChat}`} src={clickedChat.pic}></img>
                        {clickedChat.isGroupChat === true &&
                            <div style={{ height: "100%", display: 'flex', alignItems: 'flex-end' }}>
                                <label htmlFor="file-input" className={`edit-button labelEdit-img isGroup-${clickedChat.isGroupChat}`}>
                                    <FontAwesomeIcon icon={faCamera}></FontAwesomeIcon>
                                    <input id="file-input" type="file" style={{ display: 'none' }} />
                                </label>
                            </div>
                        }
                    </div>
                    <div className={`BasicDetails-ChatPage isGroup-${clickedChat.isGroupChat}`}>
                        <div className='displayDetails-ChatPage'>Name:<span className='Details-span-ChatDetails' >{ChatName}</span></div>
                        {clickedChat.isGroupChat === true &&
                            <div className='displayDetails-profile GroupChat'>Users:
                                {clickedChat.isGroupChat === true && isAdmin === true &&
                                    <button onClick={AddMembers} className='AddMember-ChatGrp'>+ Add members</button>
                                }
                                {ChatUsers.map((element) => {
                                    return <div key={element._id} className='Chat-User'>
                                        <div style={{ height: '100%', display: 'flex' }}>
                                            <div className='Details-span-DP groupmembers GroupChat'>
                                                <img className='eachMember-pic' src={`${element.pic}`}></img>
                                            </div>
                                            <div className='Details-span-ChatDetails GroupChat'>
                                                <span className='element-name'>{element.name}</span>
                                                <p className='element-contact'>{element.contactNumber}</p>
                                            </div>
                                        </div>
                                        {clickedChat.groupAdmins.some(admin => admin._id === element._id) &&
                                            <div style={{ display: 'flex' }} className='isAdmin-Chat'>
                                                <div style={{ display: 'flex', alignItems: 'center' }}>Admin</div>
                                            </div>
                                        }
                                        {isAdmin === true && element._id !== User._id &&
                                            <div style={{ padding: '2px', zIndex: '100' }}>
                                                <FontAwesomeIcon onClick={() => targetUser(element._id)} style={{ cursor: 'pointer', fontSize: '150%', color: 'black' }} icon={faEllipsisVertical} className='MemberEditBtn-chat'></FontAwesomeIcon>
                                            </div>}

                                    </div>
                                })}
                            </div>
                        }
                        {clickedChat.isGroupChat === false &&
                            <div className='displayDetails-profile'>Email:
                                {/* <span className='Details-span-ChatDetails SingleChat'>{ChatUsers[1]._id===User._id?ChatUsers[0].contactNumber:ChatUsers[1].contactNumber}</span> */}
                                <span className='Details-span-ChatDetails SingleChat'>{clickedChat.number ? clickedChat.number : clickedChat.contactNumber}</span>
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