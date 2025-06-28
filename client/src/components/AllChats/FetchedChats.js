import React, { useEffect, useContext } from 'react'
import IndChat from './indChats/IndChat'
import { useNavigate } from 'react-router-dom'
import LoadingScreen from './LoadingScreen'
import { AppContext } from '../Context/ContextProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRobot } from '@fortawesome/free-solid-svg-icons'

const FetchedChats = ({ isAdding, isSearch, setloadAll, isSingleChat, setSingleChat }) => {

  const { AllChats, isLoading, setShowingBot, showingBot, setClicked, getChats } = useContext(AppContext)

  const loadBotAcc = () => {
    setClicked('')
    setSingleChat(false)
    setShowingBot(true)
    setloadAll(false)
  }

  useEffect(() => {
    getChats()
    setClicked('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={`AllChatsContainerDiv isAdding-${isAdding} isSearch-${isSearch}`}>
      <div className='chatContainerOuter'>
        {isLoading && <LoadingScreen />}
        {/* {!isLoading && <LoadingScreen/> } */}
        {AllChats == [] &&
          <div className="no-chats-container">
            <h3>No chats yet</h3>
            <p>Start messaging people to begin conversations!</p>
          </div>
        }
        {!isLoading && AllChats.length > 0 &&
          AllChats.map((element) => {
            return <IndChat
              unreadMsg={element.unseenMsg ? element.unseenMsg : 0}
              isGroupChat={element.isGroupChat}
              isSingleChat={isSingleChat}
              setSingleChat={setSingleChat}
              _id={element._id}
              pic={element.pic}
              setloadAll={setloadAll}
              key={element._id}
              chatName={element.chatName}
              latestMessage={element.latestMessage}
            />
          })}

        {!isLoading && AllChats.length === 0 &&
          <div style={{ color: 'white', textAlign: 'center', margin: '20px 0 20px 0', fontSize: '120%' }}>No Chats to display</div>
        }
      </div>
      {showingBot === false &&
        <div onClick={loadBotAcc} className='botContainer'>
          <span className='BotText'>Talk with Ai </span>
          <FontAwesomeIcon icon={faRobot}></FontAwesomeIcon>
        </div>}

    </div>
  )
}
export default FetchedChats