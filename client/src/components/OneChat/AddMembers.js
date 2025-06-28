import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../Context/ContextProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const AddParticipantsPopup = ({ setAdding }) => {
  const [selectedOption, setSelectedOption] = useState('local');
  const [localUsers, setLocalUsers] = useState([])
  const [globalUsers, setGlobalUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isLoading, setLoading] = useState(false)
  const [AuthError, setError] = useState({
    message: '',
    type: ''
  })

  // let setErrorfunc = (message, type) => {
  //   setError({
  //     message: message,
  //     type: type
  //   })
  //   setTimeout(() => {
  //     setError('')
  //   }, 3000);
  // }

  const { setUser, AllChats, User, clickedChat, setClicked, socket, URL } = useContext(AppContext)

  let LoadAll = () => {
    let foundUsers = []
    if (!AllChats) {
      return
    }
    AllChats.forEach(chat => {
      if (chat.users.length != 2 || chat.isGroupChat === true) {
        return
      }
      if (chat.users[1]._id === User._id) {
        if (clickedChat.users.some(obj => obj._id === chat.users[0]._id)) {
          return
        }
        foundUsers.push(chat.users[0])
      } else {
        if (clickedChat.users.some(obj => obj._id === chat.users[1]._id)) {
          return
        }
        foundUsers.push(chat.users[1])
      }
    });
    setLocalUsers(foundUsers)
  }

  async function searchGlobal(value) {
    if (selectedOption === 'local') {
      return
    }
    setLoading(true)
    let url = URL + `/user/search/?user=${value}&token=${User.token}`
    let response = await fetch(url)
    let data = await response.json()
    setLoading(false)
    console.log(response, data)
    if (response.status == 401) {
      setUser('')
      localStorage.removeItem('UserData')
      return
    } else if (response.status == 201) {
      setGlobalUsers(data.users)
    }
  }

  const Cancel = () => {
    setAdding(false)
  }

  const addNewMember = async (user) => {
    //req.body.newMember
    setLoading(true)
    //added by
    //req.body._id
    let AddUrl = URL + `/chat/new/member/?token=${User.token}`
    let response = await fetch(AddUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Specify content type JSON
      },
      body: JSON.stringify({
        _id: clickedChat._id,
        newMember: user._id
      })
    })
    setLoading(false)
    if (response.status === 400) {
      toast.error("User doesn't exist or might already in the group", 'error')
      return
    } else if (response.status === 500) {
      toast.error('Some error occured:500', 'error')
      return
    }

    let newSingle = clickedChat
    newSingle.number.push(user.name)
    newSingle.users.push(user)
    setClicked(newSingle)
    if (selectedOption === 'local') {
      let newUserList = localUsers
      newUserList = newUserList.filter(obj => obj._id !== user._id)
      setLocalUsers(newUserList)
    } else {
      let newUserList = globalUsers
      newUserList = newUserList.filter(obj => obj._id !== user._id)
      setGlobalUsers(newUserList)
    }
    toast.success('Added new Member', 'success')

    let groupDetails = {
      chatId: clickedChat._id,
      user: user
    }
    socket.emit('Add member', groupDetails)
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
      users = globalUsers.filter(user =>
        user._id != User._id
      )
    }

    return (
      <div className="users-list">
        {users.map((user, index) => (
          <div key={index} className="user-item">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <img style={{ height: '30px', borderRadius: '50%' }} src={user.pic}></img>⠀
              <span>{user.name} - {user.contactNumber}</span></div>
            <button onClick={() => addNewMember(user)} className="add-button">+</button>
          </div>
        ))}
      </div>
    );
  };
  useEffect(() => {
    LoadAll()
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      {AuthError.message !== '' && (
        <div className={`mb-4 px-4 py-2 rounded text-sm text-white bg-red-600`}>
          <p>{AuthError.message}</p>
        </div>
      )}

      {isLoading && (
        <>
          <div className="absolute inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center">
            <FontAwesomeIcon icon={faSpinner} className="fa-spin text-white text-3xl" />
          </div>
        </>
      )}

      <div className="relative z-50 w-full max-w-lg bg-[#1e1e1e] text-[#f0f0f0] rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Add Participants</h2>
          <button
            onClick={Cancel}
            className="text-gray-400 hover:text-gray-200 text-sm px-2 py-1 border border-gray-600 rounded"
          >
            ✕ Back
          </button>
        </div>

        <div className="flex space-x-4 text-sm">
          <button
            className={`px-4 py-1 rounded border ${selectedOption === 'local'
              ? 'bg-[#2a2a2a] text-white border-gray-500'
              : 'text-gray-400 border-gray-600 hover:bg-[#2a2a2a]'
              }`}
            onClick={() => handleOptionClick('local')}
          >
            Local
          </button>
          <button
            className={`px-4 py-1 rounded border ${selectedOption === 'global'
              ? 'bg-[#2a2a2a] text-white border-gray-500'
              : 'text-gray-400 border-gray-600 hover:bg-[#2a2a2a]'
              }`}
            onClick={() => handleOptionClick('global')}
          >
            Global
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full bg-[#2a2a2a] text-sm text-white placeholder-gray-400 px-3 py-2 rounded border border-gray-600 focus:outline-none"
          />
          <button className="px-3 py-2 text-sm rounded bg-[#2a2a2a] border border-gray-600 text-gray-300 hover:bg-[#333] transition">
            Search
          </button>
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2">
          {renderUsersList()}
        </div>
      </div>
    </div>
  );

};

export default AddParticipantsPopup;