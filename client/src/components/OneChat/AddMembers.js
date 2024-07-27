import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../Context/ContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const AddParticipantsPopup = ({setAdding}) => {
  const [selectedOption, setSelectedOption] = useState('local');
  const [localUsers,setLocalUsers]=useState([])
  const [globalUsers, setGlobalUsers]=useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isLoading,setLoading]=useState(false)
  const [AuthError,setError]=useState({
    message:'',
    type:''
  })

  let setErrorfunc=(message,type)=>{
    setError({
      message:message,
      type:type
    })
    setTimeout(() => {
      setError('')
    },3000);
  }

  const {setUser,AllChats,User,clickedChat,setClicked,socket}=useContext(AppContext)

  let LoadAll=()=>{
    let foundUsers=[]
    if(!AllChats){
      return
    }
        AllChats.forEach(chat => {
          if(chat.users.length!=2 || chat.isGroupChat===true){
            return
          }
            if(chat.users[1]._id===User._id){
              if(clickedChat.users.some(obj=>obj._id===chat.users[0]._id )){
                return
              }
              foundUsers.push(chat.users[0])
            }else{
              if(clickedChat.users.some(obj=>obj._id===chat.users[1]._id )){
                return
              }
              foundUsers.push(chat.users[1])
            }
        });
      setLocalUsers(foundUsers)
    }

    async function searchGlobal(value){
      if(selectedOption==='local'){
        return
      }
      setLoading(true)
      let url=`http://localhost:2000/user/search/?user=${value}&token=${User.token}`
      let response=await fetch(url)
      let data=await response.json()
      setLoading(false)
      console.log(response,data)
      if(response.status==401){
        setUser('')
        localStorage.removeItem('UserData')
        return
      }else if(response.status==201){
        setGlobalUsers(data.users)
      }
    }

  const Cancel=()=>{
    setAdding(false)
  }

const addNewMember=async(user)=>{
//req.body.newMember
setLoading(true)
    //added by
    //req.body._id
    let AddUrl=`http://localhost:2000/chat/new/member/?token=${User.token}`
    let response=await fetch(AddUrl,{
      method:'POST',
      headers: {
        'Content-Type': 'application/json', // Specify content type JSON
      },
      body:JSON.stringify({
        _id:clickedChat._id,
        newMember:user._id
      })
    })
    setLoading(false)
    if(response.status===400){
      setErrorfunc("User doesn't exist or might already in the group",'error')
      return
    }else if(response.status===500){
      setErrorfunc('Some error occured:500','error')
      return
    }

    let newSingle=clickedChat
    newSingle.number.push(user.name)
    newSingle.users.push(user)
    setClicked(newSingle)
    if(selectedOption==='local'){
    let newUserList=localUsers
    newUserList=newUserList.filter(obj=>obj._id!==user._id)
    setLocalUsers(newUserList)}else{
      let newUserList=globalUsers
      newUserList=newUserList.filter(obj=>obj._id!==user._id)
      setGlobalUsers(newUserList)
    }
    setErrorfunc('Added new Member','success')

    let groupDetails={
      chatId:clickedChat._id,
      user:user
    }
    socket.emit('Add member',groupDetails)
  }

  const handleOptionClick = (option) => {
    setSelectedOption(option);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchTimeout(
      setTimeout(() => {
        searchGlobal(e.target.value);
      }, 1000) // Wait for 1000ms (1 second) before executing searchGlobal
    );
  };

  const renderUsersList = () => {
    let users;
    if (selectedOption === 'local') {
      users = localUsers.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      users = globalUsers.filter(user=>
      user._id!=User._id
      )
    }
    console.log(users)

    return (
      <div className="users-list">
        {users.map((user, index) => (
          <div key={index} className="user-item">
            <div style={{display:'flex',alignItems:'center'}}>
            <img style={{height:'30px',borderRadius:'50%'}} src={user.pic}></img>⠀
            <span>{user.name} - {user.contactNumber}</span></div>
            <button onClick={()=>addNewMember(user)} className="add-button">+</button>
          </div>
        ))}
      </div>
    );
  };
  useEffect(()=>{
    LoadAll()
  },[])

  return (
    <div className="add-participants-popup">
{AuthError.message!='' &&
            <div className={`AuthError-Container-new ${AuthError.type}`}>
            <p>{AuthError.message}</p>
          </div>}

      {isLoading===true && 
      <>
      <div className='spinnerDiv-group'><FontAwesomeIcon style={{color:'white'}} className="spinner-Group fa-spin-pulse" icon={faSpinner}></FontAwesomeIcon></div>
      <div className='freezedDisplay'></div>
      </>
}
      <div className='Cancel-Addmember' onClick={Cancel}>Back</div>
      <div className="options">
        <div
          className={`option ${selectedOption === 'local' ? 'active' : ''}`}
          onClick={() => handleOptionClick('local')}
        >
          Local
        </div>
        <div
          className={`option ${selectedOption === 'global' ? 'active' : ''}`}
          onClick={() => handleOptionClick('global')}
        >
          Global
        </div>
      </div>
      <input
        className='inputDisplay-Addmembers-group'
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={handleSearchChange}
      />
      <button className='searchBtn-Add'>Search</button>
      <div className="users-container">
        {renderUsersList()}
      </div>
    </div>
  );
};

export default AddParticipantsPopup;