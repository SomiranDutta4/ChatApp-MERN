import './App.css'
import { 
  Route,
  Routes } from 'react-router-dom';
import Homepage from "./components/Homepage";
import Chatpage from "./components/Chatpage";
import Auth from './components/auth/Auth'
import { ContextProvider,AppContext } from './components/Context/ContextProvider';


function App() {

 
  // try {
    // localStorage.getItem('web-token:chat')
  // } catch (error) {
  
  // }
  return (
    
    <div className="App">
      <ContextProvider>
      <Routes>
      <Route exact path="/Login" element={
        <Auth />
      } ></Route>
      </Routes>
      <Routes>
      <Route exact path="/" element={
        <Homepage></Homepage>
      } ></Route>
      </Routes>
      <Routes>
      <Route exact path="/Chat" element={
        <Chatpage/>
      }></Route>
      </Routes>
      </ContextProvider>
    </div>
  );
}

export default App;
