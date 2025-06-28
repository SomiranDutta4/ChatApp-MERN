import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { AppContext } from '../Context/ContextProvider';
import AddMemberPage from './AddMembers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ChatDetails = ({ setSHowChat }) => {
    const { User, socket, clickedChat, setClicked, setloadAll, setSingleChat, setChats, setSending, URL } = useContext(AppContext);

    const [ChatName, setChatName] = useState(clickedChat.chatName);
    const [ChatUsers, setChatUsers] = useState(clickedChat.users);
    const [admins, setAdmins] = useState(clickedChat.groupAdmins || []);
    const [creatorId, setCreatorId] = useState(clickedChat.createdBy?.[0]?._id || '');

    const [isAdmin, setAdmin] = useState(false);
    const [targetedUser, setTargetedUser] = useState(null);
    const [isTargetedAdmin, setTargetedAdmin] = useState(false);
    const [isAdding, setAdding] = useState(false);

    const navigate = useNavigate();

    const goBack = () => setSHowChat(false);

    const AdminHandler = async () => {
        if (!isAdmin || !targetedUser || targetedUser._id === creatorId) return;

        const groupDetails = { chatId: clickedChat._id, user: targetedUser };
        const isNowAdmin = admins.some(admin => admin._id === targetedUser._id);
        const AdminUrl = isNowAdmin
            ? `${URL}/chat/remove/admin/?token=${User.token}`
            : `${URL}/chat/add/admin/?token=${User.token}`;

        try {
            setSending(true);
            const response = await axios.patch(AdminUrl, {
                Admin: targetedUser._id,
                chatId: clickedChat._id
            });

            if (response.status === 200) {
                const updatedAdmins = isNowAdmin
                    ? admins.filter(admin => admin._id !== targetedUser._id)
                    : [...admins, targetedUser];

                setAdmins(updatedAdmins);
                setTargetedAdmin(!isNowAdmin);
                setClicked({ ...clickedChat, groupAdmins: updatedAdmins });
                socket.emit(isNowAdmin ? 'remove admin' : 'add admin', groupDetails);
                toast.success('Admin status updated');
            } else if (response.status === 400) {
                toast.error("You can't demote the group creator");
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error(error);
            toast.error("Server error");
        }

        setSending(false);
        setTargetedUser(null);
    };

    const removeMember = async () => {
        if (!targetedUser || targetedUser._id === creatorId) return;

        try {
            const response = await axios.patch(`${URL}/chat/remove/member/?token=${User.token}`, {
                memberId: targetedUser._id,
                chatId: clickedChat._id
            });

            if (response.status === 200) {
                const updatedUsers = ChatUsers.filter(u => u._id !== targetedUser._id);
                const updatedAdmins = admins.filter(a => a._id !== targetedUser._id);

                setChatUsers(updatedUsers);
                setAdmins(updatedAdmins);
                setClicked({ ...clickedChat, users: updatedUsers, groupAdmins: updatedAdmins });

                toast.success('User removed');

                socket.emit('remove member', {
                    chatId: clickedChat._id,
                    user: targetedUser,
                    name: clickedChat.chatName
                });
            } else if (response.status === 400) {
                toast.error("Cannot remove the group creator");
            } else {
                toast.error("Failed to remove member");
            }
        } catch (error) {
            toast.error("Error removing user");
        }

        setTargetedUser(null);
    };

    const targetUser = (id) => {
        if (targetedUser && targetedUser._id === id) {
            setTargetedUser(null);
            setTargetedAdmin(false);
            return;
        }

        const user = ChatUsers.find(u => u._id === id);
        setTargetedUser(user);
        setTargetedAdmin(admins.some(a => a._id === id));
    };

    const AddMembers = () => setAdding(true);

    const leaveGroup = async () => {
        try {
            const response = await axios.post(`${URL}/chat/leaveChat?token=${User.token}`, {
                userId: User._id,
                chatId: clickedChat._id,
            });

            if (response.status === 200) {
                setChats(prev => prev.filter(chat => chat._id !== clickedChat._id));
                navigate('/Chat');
                setloadAll(true);
                setClicked({});
                setSingleChat(false);
                toast.success('Left the group successfully');
            } else {
                toast.error('Could not leave the group');
            }
        } catch (error) {
            toast.error('Server error');
        }
    };

    useEffect(() => {
        if (clickedChat.isGroupChat) {
            setAdmin(admins.some(admin => admin._id === User._id));
        }
    }, [admins]);

    useEffect(() => {
        if (clickedChat?.groupAdmins) {
            setAdmins(clickedChat.groupAdmins);
            setAdmin(clickedChat.groupAdmins.some(admin => admin._id === User._id));
        }
    }, [clickedChat]);


    return (
        <div className="w-full min-h-[100vh] bg-[#1e1e1e] text-[#f0f0f0] p-4 relative">
            {isAdding && <AddMemberPage setAdding={setAdding} />}

            {targetedUser && isAdmin && (
                <div className="absolute z-10 p-4 w-[80%] max-w-[280px] bg-[#2a2a2a] rounded-xl shadow-xl top-[6vh] left-1/2 transform -translate-x-1/2 md:left-[75%] md:-translate-x-[70%]">
                    <div onClick={() => setTargetedUser(null)} className="text-right cursor-pointer text-gray-400 font-bold mb-2 text-lg">✕</div>
                    <button
                        onClick={AdminHandler}
                        disabled={targetedUser._id === creatorId}
                        className={`w-full text-sm font-medium px-3 py-2 border rounded-md mb-2 transition ${targetedUser._id === creatorId ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#383838]'
                            }`}
                    >
                        {isTargetedAdmin ? 'Remove Admin' : 'Make Admin'}
                    </button>
                    <button
                        onClick={removeMember}
                        disabled={targetedUser._id === creatorId}
                        className={`w-full text-sm font-medium px-3 py-2 border rounded-md transition ${targetedUser._id === creatorId ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#4a1f1f]'
                            }`}
                    >
                        Kick from Group
                    </button>
                </div>
            )}

            <div className="mb-4">
                <button onClick={goBack} className="text-sm text-gray-400 hover:underline">← Back</button>
            </div>

            <div className="bg-[#2a2a2a] shadow-md rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="relative w-[100px] h-[100px] rounded-full overflow-hidden shadow-md">
                    <img src={clickedChat.pic} className="w-full h-full object-cover" />
                    {clickedChat.isGroupChat && (
                        <label htmlFor="file-input" className="absolute bottom-0 right-0 bg-[#3b3b3b] p-1 rounded-full shadow cursor-pointer text-white">
                            <FontAwesomeIcon icon={faCamera} />
                            <input id="file-input" type="file" className="hidden" />
                        </label>
                    )}
                </div>

                <div className="flex flex-col w-full max-w-3xl">
                    <div className="text-xl font-semibold mb-2">Name: <span className="font-normal ml-1">{ChatName}</span></div>

                    {clickedChat.isGroupChat ? (
                        <div className="mt-2">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-base font-medium">Group Members</span>
                                <div>
                                    <button onClick={leaveGroup} className="text-sm mx-1 my-1 px-3 py-1 border border-gray-600 rounded hover:bg-[#3a3a3a]">Leave Group</button>
                                    {isAdmin && (
                                        <button onClick={AddMembers} className="text-sm mx-1 my-1 px-3 py-1 border border-gray-600 rounded hover:bg-[#334d33]">+ Add Members</button>
                                    )}
                                </div>
                            </div>

                            <div className="max-h-[45vh] overflow-y-auto space-y-3 pr-2">
                                {ChatUsers.map((element) => (
                                    <div key={element._id} className="flex items-center justify-between p-3 bg-[#3a3a3a] rounded-md border border-gray-600 hover:bg-[#454545] transition">
                                        <div className="flex items-center space-x-3">
                                            <img src={element.pic} className="w-10 h-10 rounded-full object-cover" />
                                            <div>
                                                <div className="font-semibold">{element.name}</div>
                                                <div className="text-sm text-gray-400">{element.contactNumber}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            {admins.some(admin => admin._id === element._id) && (
                                                <span className="text-xs px-2 py-0.5 bg-gray-600 text-gray-200 rounded">Admin</span>
                                            )}
                                            {isAdmin && element._id !== User._id && (
                                                <FontAwesomeIcon onClick={() => targetUser(element._id)} icon={faEllipsisVertical} className="text-gray-300 cursor-pointer" />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-base">
                            Contact: <span className="ml-2 text-gray-300">{clickedChat.number || clickedChat.contactNumber}</span>
                            {ChatUsers.length === 2 && (
                                <div className="mt-4">
                                    <button
                                        className="text-sm px-3 py-1 border border-red-600 text-red-400 rounded hover:bg-[#4a1f1f] transition"
                                        onClick={() => toast.info('Block User clicked')}
                                    >
                                        Block User
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatDetails;
