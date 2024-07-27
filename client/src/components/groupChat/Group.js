
import React, { useContext, useEffect, useState } from 'react';
import './Group.css'; // Import CSS file for styling
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
import { useNavigate } from 'react-router-dom';

const Group = ({setloadAll,setSingleChat,setAddingGroup}) => {
  let navigate=useNavigate()
  let {AllChats,User,setChats}=useContext(AppContext)
    const [groupName, setGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [created,setCreated]=useState(false)
    const [localUsers,setLocalUsers]=useState([])
    const [errorMsg,setErrorMsg]=useState('')

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
      let data=response.status
      console.log(response)
      console.log(data)
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
        console.log(data.Groupchat)
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
          {localUsers.map(user => (
            <div
              key={user._id}
              className={`member-item ${selectedMembers.includes(user._id) ? 'selected' : ''}`}
              onClick={() => handleMemberSelect(user._id)}
            >
                
              {user.name}:⠀
              {user.contactNumber}
              {selectedMembers.includes(user._id) && <button className='deselect-member-group'>✕</button>}
            </div>
          ))}
        </div>
        <button onClick={CreateGroup} className="create-group-button">
          Create Group
        </button>
      </div>
    </div>
    </>
  );
};

export default Group;
