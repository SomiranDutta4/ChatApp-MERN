
import React, { useContext, useEffect, useState } from 'react';
import './Group.css'; // Import CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
import { useNavigate } from 'react-router-dom';

const Group = ({setloadAll,setSingleChat,setAddingGroup}) => {
  let navigate=useNavigate()
  let {AllChats,User,setChats,setUser,socket}=useContext(AppContext)
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [created,setCreated]=useState(false)
    const [localUsers,setLocalUsers]=useState([])
    const [global,setGlobalusers]=useState([])
    const [errorMsg,setErrorMsg]=useState('')
    const [searchingGlobal,setSearchingGLobal]=useState(false)
    const [searchInput,setSearchinput]=useState('')
    const [searchTimeout, setSearchTimeout] = useState(null);

    let LoadAll=()=>{
    let foundUsers=[]
      if(AllChats){
        AllChats.forEach(chat => {
          if(chat.users.length===2 && chat.isGroupChat==false){
            if(chat.users[1]._id===User._id){
              foundUsers.push(chat.users[0])
            }else{
              foundUsers.push(chat.users[1])
            }
          }
      
        });
      }
      setLocalUsers(foundUsers)
    }
    let loadParticular=async (value)=>{
      if(searchingGlobal===false){
        return
      }
      let url=`http://localhost:2000/user/search/?user=${value}&token=${User.token}`
      let response=await fetch(url)
      let data=await response.json()
      console.log(response,data)
      if(response.status==401){
        setUser('')
        localStorage.removeItem('UserData')
        return
      }else if(response.status==201){
        setGlobalusers(data.users)
      }
    }

   

  const handleMemberSelect = (userId) => {
    const isSelected = selectedMembers.includes(userId);
    if (isSelected) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
    console.log(selectedMembers)
  }

  const handleGroupNameChange = (event) => {
    
    setGroupName(event.target.value);
  };
  let errorFunc=(msg)=>{
    setErrorMsg(msg)
    setTimeout(()=>{
      setErrorMsg('')
    },2000)
  }
  const CreateGroup=async()=>{
    if(groupName===''){
      errorFunc('GroupName cannot be empty')
      return 
    }
    
    setCreated(true)
    let url=`http://localhost:2000/chat/new/group/?token=${User.token}`
    try {
      let response=await fetch(url,{
        method:'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type JSON
        },  
        body:JSON.stringify({
          groupName:groupName,
          selectedMembers:selectedMembers
        })
      })
      if(response.status===500){
        console.log('why?')
      }
      if(response.status===201){
        let data=await response.json()
        let Chats=AllChats
        Chats.unshift(data.Groupchat)
        setChats(Chats)
        setAddingGroup(false)
        setloadAll(true)
        setSingleChat(false)
        setCreated(false)
        if(socket){
          socket.emit('group created',selectedMembers);
        }
        return
      }else if(response.status===500){
        errorFunc('some Error occured')
        return
      }else{
        setCreated(false)
        localStorage.removeItem('UserData')
        setChats([])
        setLocalUsers('')
        navigate('/Login')
      }
    } catch (error) {
      errorFunc('could not create group')
      setCreated(false)
    }

  }
  const GoBack=()=>{
    setAddingGroup(false)
    setloadAll(true)
    setSingleChat(false)
  }
  const handleSearchChange = (e) => {
    setSearchinput(e.target.value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(
      setTimeout(() => {
        loadParticular(e.target.value);
      }, 1000) // Wait for 1000ms (1 second) before executing searchGlobal
    );
  };
  const toggleSearch=()=>{
    if(searchingGlobal===false){
      setSearchingGLobal(true)
    }else{
      setSearchingGLobal(false)
    }
  }
  useEffect(()=>{
    LoadAll();
  },[])

  return (
    <>
    {errorMsg!=='' &&
        <div className='errorDiv-Group'><span>{errorMsg}</span></div>
    }
    {created===true &&
        <div className='spinnerDiv-group'><FontAwesomeIcon className="spinner-Group fa-spin-pulse" icon={faSpinner}></FontAwesomeIcon></div>
        }

    <div className={`group-creation-container ${created}`}>
        
         <button onClick={GoBack} className="back-button">
          Back
        </button>
        <button onClick={toggleSearch} className={`search-button isSearching-${searchingGlobal}`}>
          {searchingGlobal===true?'select local users':'Find users'}
        </button>
        {searchingGlobal===true &&
        <input value={searchInput} onChange={handleSearchChange} className='searchGlobal-grp' placeholder='Enter name'></input>
        }
      <h2>Create a New Group</h2>
      <div className='group-form'>
        <label htmlFor="group-name">Group Name:</label>
        <input
          type="text"
          id="group-name"
          value={groupName}
          onChange={handleGroupNameChange}
          required
          className="group-name-input"
        />
        <div className="member-selection-container">
          <p>Select Members:</p>
          {searchingGlobal===false &&
          <>{localUsers.map(user => (
            <div
              key={user._id}
              className={`member-item ${selectedMembers.includes(user._id) ? 'selected' : ''}`}
              onClick={() => handleMemberSelect(user._id)}
            >
                
              {user.name}:⠀
              {user.contactNumber}
              {selectedMembers.includes(user._id) && <button className='deselect-member-group'>✕</button>}
            </div>
          ))}</>
          }
          {searchingGlobal===true&&
          <>{global.map(user => (
            <>
            {user._id!==User._id &&
            <div
            key={user._id}
            className={`member-item ${selectedMembers.includes(user._id) ? 'selected' : ''}`}
            onClick={() => handleMemberSelect(user._id)}
          >   
            {user.name}:⠀
            {user.contactNumber}
            {selectedMembers.includes(user._id) && <button className='deselect-member-group'>✕</button>}
          </div>
            }
            </>
          ))}</>
          }
        </div>
        <button onClick={CreateGroup} className="create-group-button">
          Create Group
        </button>
        <div>{selectedMembers.length}‎ 
          members selected
        </div>
      </div>
    </div>
    </>
  );
};

export default Group;
