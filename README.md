# 💬 ChatNgine — Full-Stack MERN Chat App

A powerful real-time chat application with group messaging, media sharing, video/audio calls, online status, typing indicators, and more — built with the MERN stack.

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen?style=for-the-badge&logo=node.js)
![WebSocket](https://img.shields.io/badge/WebSocket-Socket.IO-black?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)
![WebRTC](https://img.shields.io/badge/WebRTC-RealTime-red?style=for-the-badge&logo=webrtc)

---

## 🚀 Overview

**ChatNgine** is a feature-rich, real-time messaging platform inspired by real-world apps like WhatsApp and Discord. It supports everything from group chats and media sharing to video/audio calls, user moderation, and smart notifications.

Built with the **MERN stack** + **Socket.IO** + **WebRTC**, this project is ideal for developers looking to explore scalable chat architecture and modern frontend/back-end integration.

---

## 📦 Features

- **Authentication** with JWT and Firebase Google Login  
- **One-on-One & Group Chats** with real-time updates  
- **Group Chat Admin Features**: Add/kick member, promote/demote admin  
- **OTP Verification** using **Nodemailer**  
- **Media Sharing** (images/videos)  
- **Voice & Video Calls** via WebRTC  
- **Online/Offline Status** indicators  
- **Typing Indicators**, delivery and seen status  
- **Smart Notifications** for various events  
- **Bookmarks** using Redux + MongoDB  
- **Search Users Globally** using Regex  
- **User Moderation**: Block user, mute user, delete chat, leave group  
- **Responsive Design** for both desktop & mobile  

---

## 🧩 Modules

### 👤 User Module

- Register/login with JWT or Google  
- Store user profile (name, email, avatar)  
- Track online/offline status via Socket.IO  
- OTP-based verification via email  

### 💬 Chat Module

- Real-time messaging using WebSocket  
- Supports personal and group conversations  
- Group admin features: Add/kick/promote/demote users  
- Send text, image, and video messages  
- Read receipts and delivery status  
- Delete individual or group chat  
- Leave group functionality  

### 🔔 Notification Module

- Show typing indicators and message status  
- Use React-Toastify for toast notifications  
- Notifications for various events (calls, group updates, etc.)  

### 📞 Calling Module

- One-on-one **video/voice calling** with WebRTC  
- Call alerts and signaling via Socket.IO  
- Call accept/reject/end flow  

---

## 🔗 API Overview

### RESTful APIs (Express)

| Endpoint         | Method | Description                      |
|------------------|--------|----------------------------------|
| `/api/auth`      | POST   | Register/login user              |
| `/api/users`     | GET    | Fetch user profile(s)            |
| `/api/messages`  | GET    | Get chat history                 |
| `/api/messages`  | POST   | Send new message                 |
| `/api/groups`    | PATCH  | Add/kick/promote/demote members  |
| `/api/otp`       | POST   | Send/verify OTP                  |

### WebSocket Events (Socket.IO)

| Event                      | Description                                |
|----------------------------|--------------------------------------------|
| `connect`                  | Establishes real-time connection           |
| `sendMessage`              | Broadcasts a new message to the chat       |
| `typing`                   | Shows typing indicator in active chat      |
| `userOnline`               | Broadcasts user's online status            |
| `callUser` / `acceptCall` / `endCall` | Handles WebRTC signaling for calls |
| `groupUpdate`              | Emits group member/admin changes           |
| `blockUser`                | Updates block list in real-time            |
| `muteUser`                 | Mutes specific users in group              |

---

## 🧰 Tech Stack

| Layer        | Tech                                           |
|--------------|------------------------------------------------|
| **Frontend** | React, Tailwind CSS, DaisyUI, Zustand          |
| **Backend**  | Node.js, Express.js                            |
| **Database** | MongoDB with Mongoose                          |
| **Auth**     | JWT + Firebase (Google Login) + Nodemailer OTP |
| **Realtime** | Socket.IO + WebRTC                             |

---
