import './App.css'
import {
  Route,
  Routes
} from 'react-router-dom';
import Homepage from "./components/Homepage";
import Chatpage from "./components/Chatpage";
import Auth from './components/auth/Auth'
import SettingsPage from './components/Profile/Settings';
import OtpPage from './components/Otp/OtpPage';
import { AppContext, ContextProvider } from './components/Context/ContextProvider'; // import ContextProvider
import { useState } from 'react';

function App() {
  const [url, setUrl] = useState();
  const [dataObj, setDataObj] = useState({});
  const [method, setMethod] = useState();

  return (
    <div className="App">
      <ContextProvider>
        <Routes>
          <Route path="/Login" element={
            <Auth setUrl={setUrl} setDataObj={setDataObj} setMethod={setMethod} />
          } />
          <Route path="/profile" element={
            <SettingsPage setUrl={setUrl} setDataObj={setDataObj} setMethod={setMethod} />
          } />
          <Route path='/verify' element={<OtpPage url={url} dataObj={dataObj} method={method} />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/Chat" element={<Chatpage />} />
        </Routes>
      </ContextProvider>
    </div>
  );
}

export default App;
