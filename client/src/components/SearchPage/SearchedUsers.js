import React, { useState,useContext } from 'react'
import GlobalUsers from './GlobalUsers'
import LocalUsers from './LocalUsers'

const SearchedUsers = (
  {isAdding,isSearch,setGlobalSearch,
  setSingleChat,setloadAll,setAddingGroup,
  foundUser,isSearchingGlobal,}) => {

  const[foundLocal,setLocal]=useState(true)

  const searchGlobal=()=>{
    if(isSearchingGlobal===false){
      setGlobalSearch(true)
    }else{
      setGlobalSearch(false)
    }
  }
  let addBtnClicked=()=>{
    if(isSearchingGlobal===false){
    setGlobalSearch(true)}else{
    setGlobalSearch(false)
    }
  }
  let clickOn={
    backgroundColor:'#477147'
  }
  let clickOff={
    background:'rgba(0, 0, 0, 0.361)'
  }
  let AddGroup=()=>{
    setAddingGroup(true)
    setloadAll(false)
    setSingleChat(false)
  }
  
  return (
      <div className={`search-page add-${isAdding} search-${isSearch}`}>
        <div className="search-results">
          {
            isAdding &&
            <div className='AddOptionsDiv' >
            <button onClick={AddGroup} className='AddoptionsBtn'>Create Group</button>
            <button style={isSearchingGlobal===true?clickOn:clickOff} onClick={addBtnClicked} className='AddoptionsBtn'>+ Add Contacts</button>
          </div>
          }
          {
            isAdding && isSearch===true &&
            <div className='SearchedUsers-ResultsDiv'>
              <div className='SearchedGlobal-results'>
                <div className='globalSearchBtn-div'>
                <button onClick={searchGlobal} className={`searchGlobal-btn ${isSearchingGlobal} `}>Search {isSearchingGlobal===true?'Local':'Global'}</button>
              </div>

              {isSearchingGlobal===false &&
              <div className='Local-users-all'>
              {!foundLocal?'Could not find locally':
              <LocalUsers setloadAll={setloadAll} setSingleChat={setSingleChat}/>
              }
            </div>
              }
              {isSearchingGlobal===true &&
                <div className='Global-users-all'>
                  <GlobalUsers setloadAll={setloadAll} setSingleChat={setSingleChat} foundUser={foundUser}/>
                </div>
              }
              </div>
        
          </div>
          }
        </div>
      </div>
  )
}

export default SearchedUsers
