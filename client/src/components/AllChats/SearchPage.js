import React, { useContext, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { AppContext } from '../Context/ContextProvider'
import { useNavigate } from 'react-router-dom'

const SearchPage = (
  { setGlobalSearch, isSearchingGlobal, setloadAll,
    isAdding, setAdd, setsearch,
    setFoundUser, foundUser }) => {
  const navigate = useNavigate();

  const { setAccountPage, AllChats, User, setLocalFound, URL } = useContext(AppContext)
  const [SearchInput, setSearching] = useState('')

  let SearchUsers = () => {
    if (isAdding) {
      setAdd(false)
      setsearch(false)
      setGlobalSearch(false)
    } else {
      setAdd(true)
    }
  }
  const isSearching = (event) => {
    setSearching(event.target.value)
    let val = event.target.value
    if (!val.trim()) {
      setLocalFound(AllChats)
      setsearch(false)
    } else {
      LocalSearch(val)
      setsearch(true)
      setAdd(true)
    }
  }
  const clearInput = () => {
    setFoundUser({ searched: false })
    setGlobalSearch(false)
    setsearch(false)
    setSearching('')
  }
  async function searchGlobal() {
    if (isSearchingGlobal === false) {
      return
    }
    setsearch(true)
    let searchURL = URL + `/user/search/?user=${SearchInput}&token=${User.token}`
    let result = await fetch(searchURL)
    let data = await result.json()
    setFoundUser({ data: data.users, searched: true })
  }


  const LocalSearch = (input) => {
    if (!input.trim()) {
      setLocalFound(AllChats); // Return all chats if input is empty
    } else {
      const filteredChats = AllChats.filter(chat =>
        chat.chatName.toLowerCase().includes(input.toLowerCase())
      );
      setLocalFound(filteredChats);
    }
  };


  const seeAccount = () => {
    navigate('/profile')
    // setloadAll(true)
    // setAccountPage(true)
    // setloadAll(false)
  }
  let pressEnter = (event) => {
    if (event.key === 'Enter' && SearchInput.trim() != '' && isSearchingGlobal == true) {
      searchGlobal()
    }
  }
  return (
    <div className='searchDivContainer'>
      <div className='searchDiv'>
        <div className='AppName'>
          <span className='companyName'>ChatNgine</span>
        </div>
        <div className='addDiv'>
          <button onClick={SearchUsers} className='addBtn'>{isAdding ? '✕' : '+'}</button>
        </div>
        <div className='searchInputDiv'>
          <div className='SearchDiv-SearchBar'>
            <input onChange={isSearching} value={SearchInput} className='searchInput' placeholder='Enter text' type='text' onKeyDown={pressEnter}></input>
            {SearchInput != '' && <button onClick={clearInput} className='Cutbtn-SearchBar'>✕</button>}
          </div>
          <div className='SearchDiv-Searchbar-sec'>
            {isSearchingGlobal === false &&
              <FontAwesomeIcon onClick={seeAccount} style={{ cursor: 'pointer', color: 'white' }} icon={faUser}></FontAwesomeIcon>
            }
            {isSearchingGlobal === true && SearchInput === '' &&
              <FontAwesomeIcon onClick={seeAccount} style={{ cursor: 'pointer', color: 'white' }} icon={faUser} ></FontAwesomeIcon>
            }
            {SearchInput != '' && isSearchingGlobal === true && <button onClick={searchGlobal} className='SearchBtn-SearchBar'>Search</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchPage
