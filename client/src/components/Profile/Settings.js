import React, { useState, useEffect, useContext } from 'react';
import './SettingStyle.css'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
import { useNavigate } from 'react-router-dom';
const SettingsPage = ({setloadAll,setSingleChat}) => {
    const {User,setUser,setLoadedChats,setChats,setAccountPage}=useContext(AppContext)
    let navigate=useNavigate()

    const [name,setName]=useState({prev:User.name,now:User.name})
    const [Number,setNumber]=useState({prev:User.contactNumber,now:User.contactNumber})
    const [password,setPassword]=useState({prev:'',now:''})
    const [oldPass,setOldPass]=useState({prev:'',now:''})
    const [loaded,setLoaded]=useState(false)
    const [hasEdited,setEdited]=useState(false)
    const [isEditingName,setEditName]=useState(false)
    const [isEditingNumber,setEditNumber]=useState(false)
    const [isEditingPass,setEditPass]=useState(false)
    const [isEditingOldPass,setEditOldPass]=useState(false)
    const [error,setError]=useState('')

    let editSetNewDetails=async()=>{
        setEdited(true)
        // if(name.prev===name.now && Number.prev===Number.now){
        //     setEdited(false)
        //     return
        // }
        if(oldPass.now && !password.now){
            setError('password cannot be empty')
            return;
        }
        if(!oldPass.now && password.now){
            setError('password cannot be empty')
            return
        }
        let url=`http://localhost:2000/user/edit/account/?token=${User.token}`
        try {
            let response=await fetch(url,{
                method:'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                }, 
                body:JSON.stringify({
                    newName:name.now,
                    newNumber:Number.now,
                    oldPassword:oldPass.now,
                    newPass:password.now,
                    newPic:User.pic
                })
            })
            if(response.status===400){
                setError('Could not Update')
                setTimeout(()=>{
                    setError('')
                },2000)
                return
            }else if(response.status===401){
                setUser('')
                setChats([])
                setLoadedChats([])
                localStorage.removeItem('UserDate')
                navigate('/Login')
                return
            }else if(response.status===500){
                setError('Could not Update, we are trying to fix it')
                setTimeout(()=>{
                    setError('')
                },2000)
                return
            }
            
                let data=await response.json()
                let newUser={
                    _id:User._id,
                    token:User.token,
                    name:data.user.name,
                    contactNumber:data.user.contactNumber,
                    pic:data.user.pic,
                    email:data.user.email,
                    isAdmin:data.user.isAdmin
                }
                setUser(newUser)
                localStorage.setItem('UserData',JSON.stringify(newUser))
                setEdited(false);
        } catch (error) {
            setError('Could not Update')
                setTimeout(()=>{
                    setError('')
            },2000)
        }

    }

    const changeName=(event)=>{
        setEdited(true)
        if(isEditingName===true){
            let newName=name
            newName.now=event.target.value
            console.log(name)

            setName({
                prev:name.prev,
                now:event.target.value
            })
            console.log(name)

        }
    }
    const changeNumber=(event)=>{
        setEdited(true)
        if(isEditingNumber===true){
            console.log(Number)
       
            setNumber({
                prev:Number.prev,
                now:event.target.value
            })
            console.log(Number)
        }
    }
    const changePass=(event)=>{
        setEdited(true)
        if(isEditingPass===true){
            setPassword({
                prev:password.prev,
                now:event.target.value
            })
        }
    }
    const changeOldPass=(event)=>{
        setEdited(true)
        if(isEditingOldPass===true){
            setOldPass({
                prev:oldPass.prev,
                now:event.target.value
            })
        }
    }
    const EditName=()=>{
        if(isEditingName===false){
            setEditName(true)
            setEditNumber(false)
            setEditPass(false)
            setEditOldPass(false)
        }else{
            setName({
                prev:name.now,
                now:name.now
            })
            cancelAll()

        }
    }
    const EditNumber=()=>{
        if(isEditingNumber===false){
            setEditName(false)
            setEditNumber(true)
            setEditPass(false)
            setEditOldPass(false)
        }else{
            setNumber({
                prev:Number.now,
                now:Number.now
            })
            cancelAll()
        }
    }
    const EditPass=()=>{
        if(isEditingPass===false){
            setPassword({
                prev:'',
                now:''
            })
            setEditName(false)
            setEditNumber(false)
            setEditPass(true)
            setEditOldPass(false)
        }else{
            setPassword({
                prev:password.now,
                now:password.now
            })
            cancelAll()
        }
    }
 const editOldPassword=()=>{
       if(isEditingOldPass===false){
        setOldPass({
            prev:oldPass.prev,
            now:oldPass.prev
        })
        setEditName(false)
        setEditNumber(false)
      setEditPass(false)
      setEditOldPass(true)
    } else{
        setOldPass({
            prev:oldPass.now,
            now:oldPass.now
        })
        cancelAll()
    }

    }
    let cancelAll=()=>{
        setEditOldPass(false)
        setEditName(false)
        setEditNumber(false)
        setEditPass(false)
    }
    const CancelName=()=>{
        // let cancelnewName=name
        // cancelnewName.now=cancelnewName.prev
        setName({
            prev:name.prev,
            now:name.prev
        })
        cancelAll()
    }
    const CancelNumber=()=>{
        // let cancelnewNumber=Number
        // cancelnewNumber.now=cancelnewNumber.prev
        setNumber({
            prev:Number.prev,
            now:Number.prev
        })
        cancelAll()
    }
    const CancelPass=()=>{
        // let cancelnewNumber=Number
        // cancelnewNumber.now=cancelnewNumber.prev
        setPassword({
            prev:password.prev,
            now:password.prev
        })
        cancelAll()
    }
    const CancelOldPass=()=>{
        // let cancelnewNumber=Number
        // cancelnewNumber.now=cancelnewNumber.prev
        setOldPass({
            prev:oldPass.prev,
            now:oldPass.prev
        })
        cancelAll()
    }
    const goBack=()=>{
        setloadAll(true)
        setSingleChat(false)
        setAccountPage(false)
    }
    const LogOut=()=>{
        localStorage.removeItem('UserData')
        setChats([])
        setUser('')
        navigate('/Login')
        window.location.reload()
    }
    useEffect(()=>{
        if(User && loaded===false){
            console.log('hey')
            setName({prev:User.name,now:User.name})
            setNumber({prev:User.contactNumber,now:User.contactNumber})
            setLoaded(true)
        }
    })

  return (
    <div className='ProfilePage-Container'>

        {error!=='' &&
         <div className='errorDiv-Settings'>
         <span>{error}</span>
     </div>
        }
        <div className='LogOut-Account'>
            <button onClick={LogOut} className='back-btn-Acc'>LogOut</button>
        </div>
        <div className='backDiv-Account'>
            <button onClick={goBack} className='back-btn-Acc'>Back→</button>
        </div>
        <div className='ProfilePage Account'>
            <div className='changeDiv-profilePhoto Account'>
                <div className='ProfilePhotoDiv'>
                    <img className='PfP' src={User.pic}></img>
                    <div style={{height:"100%", display:'flex',alignItems:'flex-end'}}>
                    <label htmlFor="file-input" className="edit-button labelEdit-img">
                        <FontAwesomeIcon icon={faCamera}></FontAwesomeIcon>
                    <input id="file-input" type="file" style={{ display: 'none' }} />
                    </label>
                    </div>
                </div>
                <div className='BasicDetails-Account'>
                <div className='displayDetails-profile'>name: <span className='Details-span' style={{color:'blue'}}>{User.name}</span></div>
                <div className='displayDetails-profile'>number: <span className='Details-span' style={{color:'blue'}}>{User.contactNumber}</span></div>
                <div className='displayDetails-profile'>email: <span className='Details-span' style={{color:'blue'}}>{User.email}</span></div>
                </div>
            </div>
            
            <div className='ChangeDiv-Profile Account'>
            {User.name && 
                <input onChange={changeName} className={`editField-edit name ${isEditingName} `} value={name.now}></input>
            }
                <button onClick={EditName} className='EditBtn-profilePage'>{isEditingName===true?'Save':'Edit'}</button>
                {isEditingName===true &&
                <button onClick={CancelName} className='CancelBtn-profileBtn'>❌</button>}
            </div>

            <div className='ChangeDiv-Profile Account'>
                {User.contactNumber &&
                    <input onChange={changeNumber} className={`editField-edit number ${isEditingNumber} `} value={Number.now}></input>
                }
                <button onClick={EditNumber}  className='EditBtn-profilePage'>{isEditingNumber===true?'Save':'Edit'}</button>
                {isEditingNumber===true &&
                <button onClick={CancelNumber} className='CancelBtn-profileBtn'>❌</button>}
            </div>
           
            <div className='ChangeDiv-Profile Account'>
                <input placeholder='Old Password' onChange={changeOldPass} className={`editField-edit password ${isEditingOldPass} `} value={oldPass.now}></input>
                <button onClick={editOldPassword}  className='EditBtn-profilePage'>{isEditingOldPass===true?'Save':'Edit'}</button>
                {isEditingOldPass===true &&
                <button onClick={CancelOldPass} className='CancelBtn-profileBtn'>❌</button>}
            </div>

            <div className='ChangeDiv-Profile Account'>
                <input placeholder='New Password' onChange={changePass} className={`editField-edit password ${isEditingPass} `} value={password.now}></input>
                <button onClick={EditPass}  className='EditBtn-profilePage'>{isEditingPass===true?'Save':'Edit'}</button>
                {isEditingPass===true &&
                <button onClick={CancelPass} className='CancelBtn-profileBtn'>❌</button>}
            </div>
            
            {hasEdited===true &&
            <div className='ChangeDiv-Profile SaveDiv'>
                <button onClick={editSetNewDetails} className='saveBtn-Acc'>Update Account</button>
            </div>
            }
        </div>
    </div>
  );
;
}

export default SettingsPage;