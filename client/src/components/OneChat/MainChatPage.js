import React, { useContext } from 'react'
import { AppContext } from '../Context/ContextProvider'
import Onechat from './Onechat'
import LoadingChat from './LoadingChatPage'

const MainChatPage = ({loadAll,windowWidth,setSingleChat,setloadAll}) => {
    const {loadingChat}=useContext(AppContext)

    if(loadingChat===false){
        return(
            <Onechat loadAll={loadAll} windowWidth={windowWidth} setSingleChat={setSingleChat} setloadAll={setloadAll}></Onechat>
        )
    }else{
        <LoadingChat></LoadingChat>
    }

}

export default MainChatPage
