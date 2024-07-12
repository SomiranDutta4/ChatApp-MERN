import React,{createContext,useEffect,useState} from 'react'
import { useNavigate } from 'react-router-dom'

const AppContext=createContext()


const ContextProvider = ({children}) => {
  const navigate=useNavigate()

    const [AllChats,setChats]=useState([])
    //const [isSingleChat,setSingleChat]=useState(false)
    const [LoadedChats,setLoadedChats]=useState([])
    const [clickedChat,setClicked]=useState('')
    // const [loadAll,setloadAll]=useState(true)
    const [User,setUser]=useState('')
    const [isLoading,setLoading]=useState(false)
    const [loadingChat,setLoadingChat]=useState(false)
    const [isSending,setSending]=useState(false)
    const [AccountPage,setAccountPage]=useState(false)

    let setUserData=()=>{
      const UserData=localStorage.getItem('UserData')
      try {
        let GotUser=JSON.parse(UserData)
        setUser(GotUser)
        if(!GotUser){
          navigate('/Login')
        }
      } catch (error) {
        localStorage.removeItem('UserData')
        setUser('')
      }
    }

    useEffect(()=>{
      setUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[])


  return (
    <AppContext.Provider value={{
        AllChats,setChats,isLoading,setLoading,
        LoadedChats,setLoadedChats,User,setUser,isSending,setSending,
        loadingChat,setLoadingChat,clickedChat,setClicked,AccountPage,setAccountPage
    }}>
        {children}
    </AppContext.Provider>
  )
}


export {ContextProvider,AppContext}