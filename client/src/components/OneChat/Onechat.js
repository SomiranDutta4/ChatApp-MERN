import React, { useEffect, useState, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import './ChatStyle.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import OneMessage from './OneMessage'
import { AppContext } from '../Context/ContextProvider'
import ChatDetails from './ChatDetails'
import axios from 'axios'

const Onechat = ({ setSingleChat, setloadAll,windowWidth }) => {
    const [showChatDetails, setSHowChat] = useState(false)
    const [lastMessageSeen, setLastMessageSeen] = useState(false);
    const {
        clickedChat, setClicked, User, setUser, setLoading, socket, NewMEssageHandler, messages
        , AllChats, setChats, setSending, SeeMessage, showingBot, messageEnd, URL
    } = useContext(AppContext)
    const navigate = useNavigate()

    const [message, setMessage] = useState('')

    const changeMessage = (event) => {
        setMessage(event.target.value)
        // setTyping(true)
    }
    const inputMessage = useRef(null)
    // const messageEnd=useRef(null)

    const sendMessage = async () => {
        setLastMessageSeen(false);
        let newMsgessage = message
        // let isLocal=false

        let newMsg = {
            _id: 'random123XYZ',
            chat: clickedChat._id,
            content: newMsgessage,
            createdAt: new Date(),
            sender: User,
            isDeleted: false,
            readBy: [User],
            status: "sending"
        }

        NewMEssageHandler(newMsg,true)
        setSending(true)
        if (messageEnd.current) {
            messageEnd.current.scrollIntoView()
        }

        if (!User || !User.token) {
            setUser('')
            setClicked('')
            setSingleChat(false)
            localStorage.removeItem('UserData')
            navigate('/Login')
            setLoading(false)
            return
        }
        setMessage('')
        const messageUrl = URL + `/message/send/?token=${User.token}`
        let response = await axios.patch(messageUrl, {
            content: newMsgessage,
            sender: User.name,
            _id: User._id,
            chatId: clickedChat._id,
            reqId: clickedChat.reqId ? clickedChat.reqId : null
        })

        let newMessage = await response.data.chat
        newMessage.latestMessage = response.data.newMsg
        // console.log(response.data, response.status, response)
        try {
            await socket.emit("new message", newMessage)
        } catch (error) {
            console.log(error)
        }

        if (response.status == 300) {
            let newChat = {
                pic: clickedChat.pic,
                _id: clickedChat._id,
                chatName: clickedChat.chatName,
                isGroupChat: clickedChat.isGroupChat,
                users: clickedChat.users,
                latestMessage: response.data.chat.latestMessage
            }
            let AllChatsFetched = AllChats
            AllChatsFetched.push(newChat)
            setChats(AllChatsFetched)
        } else if (response.status === 401) {
            localStorage.removeItem('UserData')
            navigate('/Login')
        }
        NewMEssageHandler(newMessage.latestMessage,true)
        setSending(false)
        if (messageEnd.current) {
            messageEnd.current.scrollIntoView()
        }
    }

    const clickedBack = () => {
        setClicked('')
        setloadAll(true)
        setSingleChat(false)
    }

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && message.trim() != '') {
            sendMessage()
        }
    };
    const ShowChat = () => {
        setSHowChat(true)
    }

    useEffect(() => {
        if (clickedChat) {
            if (inputMessage.current) {
                inputMessage.current.focus()
            }
            if (messageEnd.current) {
                messageEnd.current.scrollIntoView()
            }
            try {
                socket.emit('join chat', clickedChat._id)
            } catch (error) { console.log(error) }
        }
    }, [clickedChat])

    useEffect(() => {
        if (inputMessage.current) {
            inputMessage.current.focus()
        }
    }, [messages])

    useEffect(() => {
        if (!socket) {
            return
        }
        socket.on('seen messages', (details) => {
            if (clickedChat._id === details.chatId && !clickedChat.isGroupChat) {
                setLastMessageSeen(true);
                if (messageEnd.current) {
                    messageEnd.current.scrollIntoView()
                }
            }
        })
        socket.on("message recieved", () => {
            if (messageEnd.current) {
                messageEnd.current.scrollIntoView()
            }
        })
    })


    useEffect(() => {
        if (messages.length > 0 && clickedChat) {
            if (messages[messages.length - 1].readBy.length == clickedChat.users.length) {
                setLastMessageSeen(true);
            } else if (clickedChat.lastMessageSeen) {
                setLastMessageSeen(true);
            }
            SeeMessage()
        }
    }, [messages])


    if (showChatDetails === false && showingBot === false) {
        return (
            <div className='chatDisplay'>
                {!clickedChat &&
                    <div className='spinnerDiv-group'><FontAwesomeIcon style={{ color: 'white' }} className="spinner-Group fa-spin-pulse" icon={faSpinner}></FontAwesomeIcon></div>
                }
                {clickedChat &&
                    <>
                        <div className='chatdetailsContainer'>
                            {windowWidth <= 850 &&
                                <div className='backBtnDiv'><button onClick={clickedBack} className='backbtn'>&#8592;</button></div>
                            }
                            <div className='chatDetails'>
                                <div className='chatDpDiv'>
                                    <div onClick={ShowChat} className='chatDp'>
                                        <img src={clickedChat.pic} />
                                    </div>
                                </div>
                                <div className='chatNameDiv'>
                                    <div className='chatName'>
                                        <span className='MainChat-chatName'>{clickedChat.chatName}</span>
                                        {clickedChat.isGroupChat === false && <div className='contact-div-onechat'>{clickedChat.number ? clickedChat.number : clickedChat.contactNumber}</div>}
                                        {clickedChat.isGroupChat === true && <div className='contact-div-onechat'>{
                                            clickedChat.number.map((member, index) => {
                                                return <span key={index}>{member}{index === clickedChat.number.length - 1 ? ' ' : ', '}</span>
                                            })
                                        }</div>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='chatDisplayContainer'>
                            {messages && messages.length > 0 &&
                                messages.map((element) => {
                                    return <OneMessage ShMessage={element} isDeleted={element?.isDeleted} key={element._id} message={element.content} messageId={element._id} chatId={clickedChat._id}
                                        userToken={User.token} status={element.status ? element.status : 'sent'} sentBy={clickedChat.isGroupChat === true ? element.sender.name : null}
                                        sender={User._id === element.sender._id ? 'byMe' : User._id === element.sender ? 'byMe' : 'byThem'} senderId={element.sender._id}
                                    />
                                })
                            }
                            {lastMessageSeen && messages[messages.length - 1].sender._id === User._id &&
                                <div style={{ textAlign: 'end', margin: '0 10px 0 0', fontSize: '85%' }}>seen</div>
                            }
                            <div ref={messageEnd}></div>

                        </div>

                        <div className='chatInputContainerDiv'>
                            <div className='chatInputDiv'>
                                <div>
                                    <span>More</span>
                                </div>
                                <div className='inputMessageDiv'>
                                    <input className='inputDisplay' id={message != '' ? 'isTyping' : 'notTyping'} onChange={changeMessage} ref={inputMessage} value={message} onKeyDown={handleKeyPress} placeholder='Enter Message' />
                                    {message != '' && <button onClick={sendMessage} className='sendBtn'>Send</button>}

                                </div>
                            </div>
                        </div>
                    </>}
            </div>
        )
    } else {
        return (
            <ChatDetails setSHowChat={setSHowChat} showChatDetails={showChatDetails}></ChatDetails>
        )
    }
}

export default Onechat