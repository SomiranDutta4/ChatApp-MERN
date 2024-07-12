import React from 'react';
const ChatSideWindow = () => {
    let style={cursor:'default'}
  return (
    <div style={style} className="chat-side-window">
      <div className="header">
        <h2>Start Messaging People</h2>
      </div>
      <div className="messages">
        <p>Welcome to the Chat App!</p>
        <p>Start your conversations here.</p>
        <p>Your Messages are end-to-end encrypted</p>
      </div>
    </div>
  );
};

export default ChatSideWindow;
