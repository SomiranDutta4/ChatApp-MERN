import React,{useContext, useEffect} from 'react'
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
  let sendNew=async(user)=>{
    try {
      let result=await fetch(url,{
        method:'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type JSON
        },
        body:JSON.stringify({
          users:user.users,
          chatName:user.name,
          contactNumber:user.contactNumber,
          pic:user.pic,
          _id:user._id
        })
      })
    let data=await result.json()
    setClicked(data)
    setSingleChat(true)
    setloadAll(false)
      console.log('data:',data)
    } catch (error) {
      console.log(error)
    }
    
  }

  if(foundUser.data){
    return (
      <div className="users-div-search">        
          <div className="user-list">
            {foundUser.data.map(user=>{
              return(
                <div onClick={()=>sendNew(user)} className="user-card Global">
                <div className='user-avatar-div'>
                    <img src={user.pic} className="user-avatar" />
                    </div>
                    <div className="user-info">
                    <h3>{user.name}</h3>
                    <p>{user.contactNumber}</p>
                  </div>
                </div>
              )
            })
            }
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
