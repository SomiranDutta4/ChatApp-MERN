# 💬 ChatNgine — Full-Stack MERN Chat App

A powerful real-time chat application with group messaging, media sharing, video/audio calls, online status, typing indicators, and dark mode support — built with the MERN stack.

![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-brightgreen?style=for-the-badge&logo=node.js)
![WebSocket](https://img.shields.io/badge/WebSocket-Socket.IO-black?style=for-the-badge&logo=socket.io)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green?style=for-the-badge&logo=mongodb)

---

## 🚀 Overview

**ChatNgine** is a feature-rich, real-time messaging platform inspired by real-world apps like WhatsApp and Discord. It supports everything from group chats and media sharing to video/audio calls, online status, and smart notifications.

Built with the **MERN stack** + **Socket.IO** + **WebRTC**, this project is ideal for developers looking to explore scalable chat architecture and modern frontend/back-end integration.

---

## 📦 Features

- **Authentication** with JWT and Firebase Google Login
- **One-on-One & Group Chats** with real-time updates
- **Media Sharing** (images/videos)
- **Voice & Video Calls** via WebRTC
- **Online/Offline Status** indicators
- **Typing Indicators** and delivery/seen status
- **Dark/Light Mode** toggle
- **Notifications** with React-Toastify
- **Smart Bookmarks** using Redux + MongoDB
- **Responsive Design** for both desktop & mobile

---

## 🧩 Modules

### 👤 User Module

- Register/login with JWT or Google
- Store user profile (name, email, avatar)
- Track online/offline status via Socket.IO

### 💬 Chat Module

- Real-time messaging using WebSocket
- Supports personal and group conversations
- Send text, image, and video messages
- Read receipts and delivery status

### 🔔 Notification Module

- Show typing indicators and message status
- Use React-Toastify for alert messages

---

## 🔗 API Overview

### RESTful APIs (Express)

| Endpoint         | Method | Description                      |
|------------------|--------|----------------------------------|
| `/api/auth`      | POST   | Register/login user              |
| `/api/users`     | GET    | Fetch user profile(s)            |
| `/api/messages`  | GET    | Get chat history                 |
| `/api/messages`  | POST   | Send new message                 |

### WebSocket Events (Socket.IO)

| Event          | Description                                |
|----------------|--------------------------------------------|
| `connect`      | Establishes real-time connection           |
| `sendMessage`  | Broadcasts a new message to the chat       |
| `typing`       | Shows typing indicator in active chat      |
| `userOnline`   | Broadcasts user's online status            |
| `callUser` / `acceptCall` / `endCall` | Handles WebRTC signaling for calls |

---

## 🧰 Tech Stack

| Layer        | Tech                                           |
|--------------|------------------------------------------------|
| **Frontend** | React, Tailwind CSS, DaisyUI, Zustand          |
| **Backend**  | Node.js, Express.js                            |
| **Database** | MongoDB with Mongoose                          |
| **Auth**     | JWT + Firebase (Google Login)                  |
| **Realtime** | Socket.IO + WebRTC                             |

---

## ⚙️ Setup & Configuration

### 🔐 Environment Variables

Create a `.env` file in both `server/` and `client/` directories with the following keys:

#### `server/.env`
