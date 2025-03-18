import './auth.css'
import React, { useState, useEffect, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../Context/ContextProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { Flip, toast, ToastContainer } from 'react-toastify';
import image from '../../assets/images/defIcon.jpg';

const Login = ({ }) => {

  const { setUser,URL } = useContext(AppContext)
  let navigate = useNavigate()

  const [pass, setPass] = useState('hide')
  const [pass2, setPass2] = useState('hide')
  const [Password, setPassWord] = useState('')
  const [confirmPassword, setconfirmPassWord] = useState('')
  const [number, setNumber] = useState('')
  const [doing, setDoing] = useState('login')
  const [name, setName] = useState('')

  let signupBtnClicked = () => {
    setPassWord('')
    setNumber('')
    setconfirmPassWord('')
    setPass('hide')
    setDoing('signup')
  };
  let loginBtnClicked = () => {
    setconfirmPassWord('')
    setPassWord('')
    setNumber('')
    setPass('hide')
    setDoing('login')
  };
  let signupLinkClicked = () => {
    setPass('hide')
    setDoing('signup')
  };
  let togglePass = () => {
    pass === 'show' ? setPass('hide') : setPass('show')
  }
  let togglePass2 = () => {
    pass2 === 'show' ? setPass2('hide') : setPass2('show')
  }
  const typeNumber = (event) => {
    setNumber(event.target.value.trim())
  }

  const typePassword = (event) => {
    setPassWord(event.target.value)
    if (doing == 'login') {
      setconfirmPassWord(event.target.value)
    }
  }
  const typeconfirmPassword = (event) => {
    setconfirmPassWord(event.target.value)
  }
  const typeName = (event) => {
    setName(event.target.value)
  }


  async function login() {
    if (!Password.trim()) {
      toast.error('password cannot be empty');
      // setErrorfunc('password cannot be empty', 'error')
      return
    }
    //200,401,500,400-no user
    let Loginurl = URL+`/user/Login/?email=${number}&password=${Password}`
    try {
      let response = await fetch(Loginurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Specify content type JSON
        },
        body: JSON.stringify({
          password: Password
        })
      })
      if (response.status === 200) {
        let data = await response.json()
        const Userdata = {
          token: data.token,
          _id: data._id,
          contactNumber: data.user.contactNumber,
          name: data.user.name,
          pic: data.user.pic,
          email: data.user.email
        }
        localStorage.setItem('UserData', JSON.stringify(Userdata))
        setUser(Userdata)
        navigate('/Chat')
      } else if (response.status === 401) {
        toast.error('Entered password was incorrect')
      } else if (response.status === 400) {
        toast.error('No Account exist, Sign up first')
      } else if (response.status === 440) {
        toast.error('The entered email must be valid')
      } else {
        toast.error('There was an error,We are fixing it')
      }

    } catch (error) {
      toast.error('Could not Sign In..., maybe check your internet')
    }
  }


  async function SignUp() {
    //200,401,500
    if (confirmPassword !== Password) {
      toast.error('The passwords did not match');
      return
    } else if (Password.trim().length < 6) {
      toast.error('The password should contain atleast 6 characters')
      return
    }
    let SignUpurl = URL+'/user/Signup'
    try {
      let response = await fetch(SignUpurl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: number,
          password: Password,
          name: name,
          pic:image
        })
      })
      let verifyUrl = URL+`/user/send/mail/?status=${response.status}&email=${number}`
      fetch(verifyUrl, {
        method: 'PATCH',
      })
      if (response.status === 200) {
        toast.success('Successfully signed up')
        setNumber('')
        setPassWord('')
        setDoing('login')
      } else if (response.status === 500) {
        toast.error('Something went wrong, we are trying to fix it')
      } else if (response.status === 440) {
        toast.error('Email must be valid and the password must be atleast 6 characters long')
      } else {
        toast.error('Account already exist with the entered number')
      }
    } catch (error) {
      toast.error('Could not Sign Up..., maybe check your internet');
    }
  }


  useEffect(() => {
    const fetchUserData = async () => {
      let UserData = localStorage.getItem('UserData')
      try {
        UserData = JSON.parse(UserData)
        setUser(UserData)
      } catch (error) {
        UserData = ''
        setUser('')
      }
      if (UserData && UserData != '') {
        navigate('/Chat')
      }
    }
    fetchUserData()

  }, [])

  return (

    <div className="wrapper">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        limit={3}
        hideProgressBar
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover={false}
        theme="light"
        transition={Flip}
      />

      <div className="title-text">
        <div id={doing} className="title login">Login Form</div>
        <div id={doing} className="title signup">Signup Form</div>
      </div>
      <div className="form-container">
        <div className="slide-controls">
          <input type="radio" name="slide" id="login" checked />
          <input type="radio" name="slide" id="signup" />
          <label id={doing} onClick={loginBtnClicked} htmlFor="login" className="slide login specSlideLogin">Login</label>
          <label id={doing} onClick={signupBtnClicked} htmlFor="signup" className="slide signup specSlideSignup">Signup</label>
          <div className="slider-tab"></div>
        </div>
        <div className="form-inner">
          <div id={doing} className="login custom-form">

            <div className="field">
              <input onChange={typeNumber} value={number} className='emailInput' type='email' placeholder="Email" required />
            </div>
            <div className="field flexField">
              <input onChange={typePassword} value={Password} className='passwordInput' type={pass === 'show' ? 'text' : 'password'} placeholder="Password" required />
              <p className='togglePass' onClick={togglePass} >
                {pass === 'show' &&
                  <FontAwesomeIcon icon={faEyeSlash}></FontAwesomeIcon>
                }
                {pass === 'hide' &&
                  <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                }
              </p>
            </div>
            <div className="pass-link"><a href="#">Forgot password?</a></div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input onClick={login} type="submit" value="Login" />
            </div>
            <div className="signup-link">Not a member? <a id='signupLink' onClick={signupLinkClicked}>Signup now</a></div>
          </div>
          <div className="signup custom-form" >
            <div className="field">
              <input onChange={typeNumber} value={number} className='emailInput' type="email" placeholder="Email" required />
            </div>
            <div className="field">
              <input onChange={typeName} value={name} placeholder="Name" className='emailInput' required />
            </div>
            <div className="field flexField">
              <input onChange={typePassword} value={Password} className='passwordInput' type={pass === 'show' ? 'text' : 'password'} placeholder="Password" required />
              <p className='togglePass' onClick={togglePass} >
                {pass === 'show' &&
                  <FontAwesomeIcon icon={faEyeSlash}></FontAwesomeIcon>
                }
                {pass === 'hide' &&
                  <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                }
              </p>
            </div>
            <div className="field flexField">
              <input onChange={typeconfirmPassword} value={confirmPassword} className='passwordInput' type={pass2 === 'show' ? 'text' : 'password'} placeholder="Confirm password" required />
              <p className='togglePass' onClick={togglePass2} >
                {pass2 === 'show' &&
                  <FontAwesomeIcon icon={faEyeSlash}></FontAwesomeIcon>
                }
                {pass2 === 'hide' &&
                  <FontAwesomeIcon icon={faEye}></FontAwesomeIcon>
                }
              </p>
            </div>
            <div className="field btn">
              <div className="btn-layer"></div>
              <input onClick={SignUp} type="submit" value="Signup" />
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}

export default Login
