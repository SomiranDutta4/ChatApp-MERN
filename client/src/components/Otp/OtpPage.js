import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useContext } from 'react';
import { AppContext } from '../Context/ContextProvider'
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const OtpPage = ({ dataObj, url, method }) => {
  const navigate=useNavigate();
  const { User, setUser } = useContext(AppContext)
  const [otp, setOtp] = useState('');

  const handleSubmit = async () => {
    //401 and 200
    if (otp.length !== 6) {
      return toast.error('Enter a 6-digit OTP');
    }

    try {
      const payload = { ...dataObj, otp };

      const response = await axios({
        method: method.toLowerCase(),
        url: url,
        data: payload,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log(response)
      console.log(response.data);
      if (response.status == 200) {
        toast.success(response.data.message || 'OTP verified successfully');
        const updatedUser = { ...User, ...response.data.user };
        setUser(updatedUser);
        localStorage.setItem('UserData', JSON.stringify(updatedUser));
        navigate('/Chat');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid OTP or request failed');
    }
  };

  return (
    <div className="bg-[#1e1e1e] text-white min-h-screen w-full flex justify-center items-center px-4">
      <div className="bg-[#2a2a2a] w-full max-w-sm rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
        <input
          type="text"
          maxLength="6"
          value={otp}
          onChange={e => setOtp(e.target.value.replace(/\D/, ''))}
          placeholder="Enter 6-digit OTP"
          className="w-full px-4 py-2 rounded bg-[#1e1e1e] border border-gray-600 focus:outline-none mb-4 text-white text-center tracking-widest text-lg"
        />
        <button
          onClick={handleSubmit}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium"
        >
          Verify OTP
        </button>
      </div>
    </div>
  );
};

export default OtpPage;
