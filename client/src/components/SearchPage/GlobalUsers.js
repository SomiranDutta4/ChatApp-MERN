import React,{useContext} from 'react'
import './UserSearch.css'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/ContextProvider'

const GlobalUsers = ({foundUser,setSingleChat,setloadAll}) => {
  const {setClicked}=useContext(AppContext)
  let navigate=useNavigate()
  let UserData=localStorage.getItem('UserData')
  try {
    UserData=JSON.parse(UserData)
  } catch (error) {
    localStorage.removeItem('UserData')
    navigate('/Chat')
  }

  let url=`http://localhost:2000/chat/get/new/?token=${UserData.token}`
  let sendNew=async()=>{
    try {
      let result=await fetch(url,{
        method:'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type JSON
        },
        body:JSON.stringify({
          chatName:foundUser.data.name,
          number:foundUser.data.contact,
          pic:foundUser.data.pic,
          _id:foundUser.data._id
        })
      })
      console.log(foundUser)
    let data=await result.json()
    console.log(data)
    console.log(UserData)
    setClicked(data)
    setSingleChat(true)
    setloadAll(false)
      console.log('data:',data)
    } catch (error) {
      console.log(error)
    }
    
  }

  if(foundUser.data && foundUser.data.contact){
    return (
      <div className="users-div-search">        
          <div className="user-list">
            
              <div onClick={sendNew} className="user-card Global">
              <div className='user-avatar-div'>
                  <img src={foundUser.data.pic} className="user-avatar" />
                  </div>
                  <div className="user-info">
                  <h3>{foundUser.data.name}</h3>
                  <p>{foundUser.data.contact}</p>
                </div>
              </div>
          </div>
      </div>
    )
  }else if(foundUser.searched===false){
    return(
      <div>
        Search users to add to your chatList...
      </div>
    )
}else{
    return(
      <div>
        could not find searched user...
      </div>
    )
  }
}

export default GlobalUsers
