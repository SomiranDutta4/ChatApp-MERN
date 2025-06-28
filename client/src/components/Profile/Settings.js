import React, { useState, useEffect, useContext } from 'react';
import { AppContext } from '../Context/ContextProvider';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import images from '../../assets/imgSrc';

const SettingsPage = ({ setUrl, setDataObj, setMethod }) => {
    const { User, setUser, setLoadedChats, setChats, setAccountPage, URL } = useContext(AppContext);
    const navigate = useNavigate();

    const [name, setName] = useState({ prev: User.name, now: User.name });
    const [number, setNumber] = useState({ prev: User.contactNumber, now: User.contactNumber });
    const [password, setPassword] = useState({ prev: '', now: '' });
    const [oldPass, setOldPass] = useState({ prev: '', now: '' });
    const [hasEdited, setEdited] = useState(false);
    const [isEditing, setIsEditing] = useState({ name: false, number: false, pass: false, oldPass: false });
    const [showPics, setShowingPics] = useState(false);

    useEffect(() => {
        setName({ prev: User.name, now: User.name });
        setNumber({ prev: User.contactNumber, now: User.contactNumber });
    }, [User]);

    const handleChange = (field, value) => {
        setEdited(true);
        if (field === 'name') setName(prev => ({ ...prev, now: value }));
        if (field === 'number') setNumber(prev => ({ ...prev, now: value }));
        if (field === 'pass') setPassword(prev => ({ ...prev, now: value }));
        if (field === 'oldPass') setOldPass(prev => ({ ...prev, now: value }));
    };

    const toggleEdit = field => {
        setIsEditing(prev => ({ name: false, number: false, pass: false, oldPass: false, [field]: !prev[field] }));
    };

    const cancelEdit = field => {
        if (field === 'name') setName(prev => ({ prev: prev.prev, now: prev.prev }));
        if (field === 'number') setNumber(prev => ({ prev: prev.prev, now: prev.prev }));
        if (field === 'pass') setPassword({ prev: '', now: '' });
        if (field === 'oldPass') setOldPass({ prev: '', now: '' });
        toggleEdit(field);
    };

    const updateAccount = async () => {
        if (oldPass.now && !password.now) return toast.error('New password cannot be empty');
        if (!oldPass.now && password.now) return toast.error('Old password required');

        try {
            const response = await axios.patch(`${URL}/user/edit/account/?token=${User.token}`, {
                newName: name.now,
                newNumber: number.now,
                oldPassword: oldPass.now,
                newPass: password.now,
                newPic: User.pic,
            });
            console.log(response.status, response.data)
            if (response.status === 202) {
                console.log('OTP Sent Response:', response.data.message);
                toast.info('OTP sent to your email. Please verify to continue.');
                setUrl(`${URL}/user/edit/account/?token=${User.token}`);
                setDataObj({
                    newName: name.now,
                    newNumber: number.now,
                    oldPassword: oldPass.now,
                    newPass: password.now,
                    newPic: User.pic,
                })
                setMethod('PATCH');
                navigate('/verify');
                return;
            } else if (response.status == 200) {
                const updatedUser = { ...User, ...response.data.user };
                setUser(updatedUser);
                localStorage.setItem('UserData', JSON.stringify(updatedUser));
                setEdited(false);
                toast.success('Account updated');
                setIsEditing({ name: false, number: false, pass: false, oldPass: false });
            } else {
                //error
            }

        } catch (error) {
            console.error('Update Error:', error);
            toast.error(error.response?.data?.message || 'Could not update');
        }
    };

    const changePic = async url => {
        try {
            const response = await axios.post(`${URL}/user/update/pic/?token=${User.token}&url=${url}`);
            if (response.status === 200) {
                const updatedUser = { ...User, pic: url };
                setUser(updatedUser);
                localStorage.setItem('UserData', JSON.stringify(updatedUser));
                toast.success('Profile picture updated');
                setShowingPics(false);
            }
        } catch {
            toast.error('Could not update picture');
        }
    };

    const logOut = () => {
        localStorage.removeItem('UserData');
        setChats([]);
        setUser(null);
        navigate('/Login');
        window.location.reload();
    };

    const goBack = () => {
        navigate('/Chat')
        // setloadAll(true);
        // setSingleChat(false);
        // setAccountPage(false);
    };

    if (showPics) {
        return (
            <div className="p-6 text-white bg-[#1e1e1e] h-screen w-screen">
                <button className="mb-4 text-sm text-gray-400 hover:underline" onClick={() => setShowingPics(false)}>← Back</button>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((img, i) => (
                        <img
                            key={i}
                            src={img}
                            alt="avatar"
                            className="rounded-full w-24 h-24 object-cover cursor-pointer border-2 border-transparent hover:border-blue-500"
                            onClick={() => changePic(img)}
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#1e1e1e] text-white w-screen h-screen flex justify-center items-center px-4 py-10">
            <div className="w-full max-w-lg">
                {/* {error && <div className="bg-red-600 text-sm px-4 py-2 rounded mb-4 text-center">{error}</div>} */}

                <div className="flex justify-between mb-6">
                    <button onClick={goBack} className="text-sm px-4 py-2 border border-gray-600 rounded hover:bg-gray-700">← Back</button>
                    <button onClick={logOut} className="text-sm px-4 py-2 border border-red-600 text-red-400 rounded hover:bg-red-700">Logout</button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <img
                        src={User.pic}
                        alt="profile"
                        className="rounded-full w-28 h-28 object-cover cursor-pointer border border-gray-600"
                        onClick={() => setShowingPics(true)}
                    />
                    <div className="mt-2 text-sm text-gray-400">Click to change profile picture</div>
                </div>

                <div className="space-y-5">
                    {['name', 'number', 'oldPass', 'pass'].map(field => (
                        <div key={field} className="flex items-center gap-3">
                            <input
                                type={field.includes('Pass') ? 'password' : 'text'}
                                placeholder={field === 'oldPass' ? 'Old Password' : field === 'pass' ? 'New Password' : ''}
                                value={field === 'name' ? name.now : field === 'number' ? number.now : field === 'oldPass' ? oldPass.now : password.now}
                                onChange={e => handleChange(field, e.target.value)}
                                className="flex-1 px-3 py-2 bg-[#2a2a2a] text-white rounded border border-gray-600 focus:outline-none disabled:opacity-60"
                                disabled={!isEditing[field]}
                            />
                            <button
                                onClick={() => toggleEdit(field)}
                                className="text-sm px-3 py-1 border border-gray-600 rounded hover:bg-gray-700"
                            >
                                {isEditing[field] ? 'Save' : 'Edit'}
                            </button>
                            {isEditing[field] && (
                                <button
                                    onClick={() => cancelEdit(field)}
                                    className="text-sm px-3 py-1 border border-gray-600 rounded hover:bg-red-700"
                                >
                                    ❌
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {hasEdited && (
                    <div className="mt-6">
                        <button
                            onClick={updateAccount}
                            className="w-full text-sm px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                            Update Account
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsPage;