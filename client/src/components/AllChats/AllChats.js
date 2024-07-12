import React, { useEffect, useState} from 'react'

import SearchPage from './SearchPage'
import FetchedChats from './FetchedChats'
import SearchedUsers from '../SearchPage/SearchedUsers'
// import { useNavigate } from 'react-router-dom'

const AllChats = ({setAddingGroup,loadAll,setloadAll,setSingleChat,isSingleChat}) => {
  // const navigate=useNavigate()
  // const [isLoading,setLoading]=useState(false)
  const [isAdding,setAdd]=useState(false)
  const [isSearch,setsearch]=useState(false)
  const [isSearchingGlobal,setGlobalSearch]=useState(false)
  const [isSearchingLocal,setLocalSearch]=useState('')
  const [foundUser,setFoundUser]=useState({searched:false})
  
  return (
    <div className='MainChatPage-Container'>
      <SearchPage setFoundUser={setFoundUser} foundUser={foundUser} setGlobalSearch={setGlobalSearch} isSearchingGlobal={isSearchingGlobal} isAdding={isAdding} setAdd={setAdd} loadAll={loadAll} isSearch={isSearch} setsearch={setsearch} setloadAll={setloadAll}/>
      {isAdding && <SearchedUsers setAddingGroup={setAddingGroup} setloadAll={setloadAll} setSingleChat={setSingleChat} setFoundUser={setFoundUser} foundUser={foundUser} setsearch={setsearch} setGlobalSearch={setGlobalSearch} isSearchingGlobal={isSearchingGlobal} isAdding={isAdding} isSearch={isSearch} />}
      {/* { !isSearch && <FetchedChats isLoading={isLoading} setLoading={setLoading} isAdding={isAdding} isSearch={isSearch}  setSingleChat={setSingleChat} isSingleChat={isSingleChat} setloadAll={setloadAll}/>} */}
      { !isSearch && <FetchedChats isAdding={isAdding} isSearch={isSearch}  setSingleChat={setSingleChat} isSingleChat={isSingleChat} setloadAll={setloadAll}/>}

    </div>
  )
}

export default AllChats