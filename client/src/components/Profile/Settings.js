import React, { useState, useEffect, useContext } from 'react';
import './SettingStyle.css'
import { AppContext } from '../Context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

import Container from '@mui/material/Container';
import { Box, Button, Grid2 } from '@mui/material';
import images from '../../assets/imgSrc';

const SettingsPage = ({ setloadAll, setSingleChat }) => {
    const { User, setUser, setLoadedChats, setChats, setAccountPage, URL } = useContext(AppContext)
    let navigate = useNavigate()

    const [name, setName] = useState({ prev: User.name, now: User.name })
    const [Number, setNumber] = useState({ prev: User.contactNumber, now: User.contactNumber })
    const [password, setPassword] = useState({ prev: '', now: '' })
    const [oldPass, setOldPass] = useState({ prev: '', now: '' })
    const [loaded, setLoaded] = useState(false)
    const [hasEdited, setEdited] = useState(false)
    const [isEditingName, setEditName] = useState(false)
    const [isEditingNumber, setEditNumber] = useState(false)
    const [isEditingPass, setEditPass] = useState(false)
    const [isEditingOldPass, setEditOldPass] = useState(false)
    const [error, setError] = useState('')
    const [showPics, setShowingPics] = useState(false);

    let editSetNewDetails = async () => {
        setEdited(true)
        if (oldPass.now && !password.now) {
            setError('password cannot be empty')
            return;
        }
        if (!oldPass.now && password.now) {
            setError('password cannot be empty')
            return
        }
        let url = `http://localhost:2000/user/edit/account/?token=${User.token}`
        try {
            let response = await fetch(url, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json', // Specify content type JSON
                },
                body: JSON.stringify({
                    newName: name.now,
                    newNumber: Number.now,
                    oldPassword: oldPass.now,
                    newPass: password.now,
                    newPic: User.pic
                })
            })
            if (response.status === 400) {
                setError('Could not Update')
                setTimeout(() => {
                    setError('')
                }, 2000)
                return
            } else if (response.status === 401) {
                setUser('')
                setChats([])
                setLoadedChats([])
                localStorage.removeItem('UserDate')
                navigate('/Login')
                return
            } else if (response.status === 500) {
                setError('Could not Update, we are trying to fix it')
                setTimeout(() => {
                    setError('')
                }, 2000)
                return
            }

            let data = await response.json()
            let newUser = {
                _id: User._id,
                token: User.token,
                name: data.user.name,
                contactNumber: data.user.contactNumber,
                pic: data.user.pic,
                email: data.user.email,
                isAdmin: data.user.isAdmin
            }
            setUser(newUser)
            localStorage.setItem('UserData', JSON.stringify(newUser))
            setEdited(false);
        } catch (error) {
            setError('Could not Update')
            setTimeout(() => {
                setError('')
            }, 2000)
        }

    }

    const changeName = (event) => {
        setEdited(true)
        if (isEditingName === true) {
            let newName = name
            newName.now = event.target.value
            console.log(name)

            setName({
                prev: name.prev,
                now: event.target.value
            })
            console.log(name)

        }
    }
    const changeNumber = (event) => {
        setEdited(true)
        if (isEditingNumber === true) {
            console.log(Number)

            setNumber({
                prev: Number.prev,
                now: event.target.value
            })
            console.log(Number)
        }
    }
    const changePass = (event) => {
        setEdited(true)
        if (isEditingPass === true) {
            setPassword({
                prev: password.prev,
                now: event.target.value
            })
        }
    }
    const changeOldPass = (event) => {
        setEdited(true)
        if (isEditingOldPass === true) {
            setOldPass({
                prev: oldPass.prev,
                now: event.target.value
            })
        }
    }
    const EditName = () => {
        if (isEditingName === false) {
            setEditName(true)
            setEditNumber(false)
            setEditPass(false)
            setEditOldPass(false)
        } else {
            setName({
                prev: name.now,
                now: name.now
            })
            cancelAll()

        }
    }
    const EditNumber = () => {
        if (isEditingNumber === false) {
            setEditName(false)
            setEditNumber(true)
            setEditPass(false)
            setEditOldPass(false)
        } else {
            setNumber({
                prev: Number.now,
                now: Number.now
            })
            cancelAll()
        }
    }
    const EditPass = () => {
        if (isEditingPass === false) {
            setPassword({
                prev: '',
                now: ''
            })
            setEditName(false)
            setEditNumber(false)
            setEditPass(true)
            setEditOldPass(false)
        } else {
            setPassword({
                prev: password.now,
                now: password.now
            })
            cancelAll()
        }
    }
    const editOldPassword = () => {
        if (isEditingOldPass === false) {
            setOldPass({
                prev: oldPass.prev,
                now: oldPass.prev
            })
            setEditName(false)
            setEditNumber(false)
            setEditPass(false)
            setEditOldPass(true)
        } else {
            setOldPass({
                prev: oldPass.now,
                now: oldPass.now
            })
            cancelAll()
        }

    }
    let cancelAll = () => {
        setEditOldPass(false)
        setEditName(false)
        setEditNumber(false)
        setEditPass(false)
    }
    const CancelName = () => {
        // let cancelnewName=name
        // cancelnewName.now=cancelnewName.prev
        setName({
            prev: name.prev,
            now: name.prev
        })
        cancelAll()
    }
    const CancelNumber = () => {
        // let cancelnewNumber=Number
        // cancelnewNumber.now=cancelnewNumber.prev
        setNumber({
            prev: Number.prev,
            now: Number.prev
        })
        cancelAll()
    }
    const CancelPass = () => {
        // let cancelnewNumber=Number
        // cancelnewNumber.now=cancelnewNumber.prev
        setPassword({
            prev: password.prev,
            now: password.prev
        })
        cancelAll()
    }
    const CancelOldPass = () => {
        // let cancelnewNumber=Number
        // cancelnewNumber.now=cancelnewNumber.prev
        setOldPass({
            prev: oldPass.prev,
            now: oldPass.prev
        })
        cancelAll()
    }
    const goBack = () => {
        setloadAll(true)
        setSingleChat(false)
        setAccountPage(false)
    }
    const LogOut = () => {
        localStorage.removeItem('UserData')
        setChats([])
        setUser('')
        navigate('/Login')
        window.location.reload()
    }
    useEffect(() => {
        if (User && loaded === false) {
            setName({ prev: User.name, now: User.name })
            setNumber({ prev: User.contactNumber, now: User.contactNumber })
            setLoaded(true)
        }
    })

    // const images = [
    //     { img: 'https://img.freepik.com/free-vector/blond-man-blue-eyes_24877-83661.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/gradient-avatar-illustration_23-2150891923.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/blond-man-with-eyeglasses-icon-isolated_24911-100831.jpg?ga=GA1.1.133026118.1735104670&semt=ais_hybrid' },
    //     { img: 'https://img.freepik.com/free-vector/hand-drawn-people-with-dreadlocks-illustration_23-2149752847.jpg?ga=GA1.1.133026118.1735104670&semt=ais_hybrid' },
    //     { img: 'https://img.freepik.com/premium-vector/portrait-handsome-mature-male-teacher_684058-1396.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/premium-vector/cartoon-man-avatar-illustration-dark-green-polo-shirt_932695-5548.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/premium-vector/businessman-worker-occupation-success_18591-5276.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/young-woman-white_25030-39546.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-photo/androgynous-avatar-non-binary-queer-person_23-2151100259.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/hand-drawn-ethnic-beauty-illustration_23-2150216591.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869153.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/purple-man-with-blue-hair_24877-82003.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-psd/3d-illustration-human-avatar-profile_23-2150671122.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/blond-man-smiling_24877-82858.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/premium-vector/pretty-red-haired-caucasian-girl-semi-flat-vector-character-head-positive-long-haired-lady-editable-cartoon-avatar-icon-face-emotion-colorful-spot-illustration-web-graphic-design-animation_151150-16475.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     { img: 'https://img.freepik.com/premium-vector/vector-illustration-winter-boy-concept-hello-winter-avataka-social-networks_469123-519.jpg?ga=GA1.1.133026118.1735104670&semt=ais_authors_boost' },
    //     // {img:''}
    // ]
    const changePic = async (url) => {
        try {
            const response = await axios.post(`${URL}/user/update/pic/?token=${User.token}&url=${url}`);

            if (response.status === 200) {
                const updatedUser = { ...User, pic: url };
                setUser(updatedUser);
                localStorage.setItem('UserData', JSON.stringify(updatedUser));
                setShowingPics(false);
                toast.success("Profile picture updated successfully!");
            } else {
                toast.error("Failed to update profile picture.");
            }
        } catch (error) {
            toast.error("An error occurred while updating the picture.");
        }
    };


    if (showPics) {
        return (
            <Container>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <Button onClick={() => { setShowingPics(false) }} sx={{ color: 'white' }}>Back</Button>
                </Box>
                {/* <Box> */}
                <Grid2 container spacing={2}>
                    {images.map((item) => (
                        <Grid2 size={{ xs: 6, sm: 4, md: 3 }} key={item}>
                            <img onClick={() => { changePic(item) }} className='picsSelect' style={{ borderRadius: '50%' }}
                                srcSet={`${item}`}
                                src={`${item}`}
                                // alt={item.title}
                                loading="lazy"
                            />
                        </Grid2>
                    ))}
                </Grid2>
                {/* </Box> */}
            </Container>
        )
    } else {
        return (
            <div className='ProfilePage-Container'>

                {error !== '' &&
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
                            <img onClick={() => { setShowingPics(true) }} className='PfP' src={User.pic}></img>
                        </div>
                        <div className='BasicDetails-Account'>
                            <div className='displayDetails-profile'>name: <span className='Details-span' style={{ color: 'blue' }}>{User.name}</span></div>
                            <div className='displayDetails-profile'>number: <span className='Details-span' style={{ color: 'blue' }}>{User.contactNumber}</span></div>
                            <div className='displayDetails-profile'>email: <span className='Details-span' style={{ color: 'blue' }}>{User.email}</span></div>
                        </div>
                    </div>

                    <div className='ChangeDiv-Profile Account'>
                        {User.name &&
                            <input onChange={changeName} className={`editField-edit name ${isEditingName} `} value={name.now}></input>
                        }
                        <button onClick={EditName} className='EditBtn-profilePage'>{isEditingName === true ? 'Save' : 'Edit'}</button>
                        {isEditingName === true &&
                            <button onClick={CancelName} className='CancelBtn-profileBtn'>❌</button>}
                    </div>

                    <div className='ChangeDiv-Profile Account'>
                        {User.contactNumber &&
                            <input onChange={changeNumber} className={`editField-edit number ${isEditingNumber} `} value={Number.now}></input>
                        }
                        <button onClick={EditNumber} className='EditBtn-profilePage'>{isEditingNumber === true ? 'Save' : 'Edit'}</button>
                        {isEditingNumber === true &&
                            <button onClick={CancelNumber} className='CancelBtn-profileBtn'>❌</button>}
                    </div>

                    <div className='ChangeDiv-Profile Account'>
                        <input placeholder='Old Password' onChange={changeOldPass} className={`editField-edit password ${isEditingOldPass} `} value={oldPass.now}></input>
                        <button onClick={editOldPassword} className='EditBtn-profilePage'>{isEditingOldPass === true ? 'Save' : 'Edit'}</button>
                        {isEditingOldPass === true &&
                            <button onClick={CancelOldPass} className='CancelBtn-profileBtn'>❌</button>}
                    </div>

                    <div className='ChangeDiv-Profile Account'>
                        <input placeholder='New Password' onChange={changePass} className={`editField-edit password ${isEditingPass} `} value={password.now}></input>
                        <button onClick={EditPass} className='EditBtn-profilePage'>{isEditingPass === true ? 'Save' : 'Edit'}</button>
                        {isEditingPass === true &&
                            <button onClick={CancelPass} className='CancelBtn-profileBtn'>❌</button>}
                    </div>

                    {hasEdited === true &&
                        <div className='ChangeDiv-Profile SaveDiv'>
                            <button onClick={editSetNewDetails} className='saveBtn-Acc'>Update Account</button>
                        </div>
                    }
                </div>
            </div>
        );
    }

    ;
}

export default SettingsPage;