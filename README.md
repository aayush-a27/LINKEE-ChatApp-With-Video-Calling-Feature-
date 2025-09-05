# ChatApp - Full Stack Social Chat Application

A modern, real-time chat application with social features built with React, Node.js, and Stream Chat API.

## 🚀 Features

### 💬 **Chat System**
- Real-time messaging with Stream Chat API
- Group chats with admin controls
- Voice and video calling
- File and image sharing

### 👥 **Social Features**
- Friend system with requests
- User profiles and settings
- Social media feed (Explore page)
- Post creation with images
- Like, comment, and share posts

### 🔧 **Group Management**
- Create and manage groups
- Admin privileges (add/remove members)
- Custom group avatars
- Group notifications

### 🔔 **Notifications**
- Real-time notifications
- Friend request alerts
- Group activity updates
- Call notifications

## 🛠️ Tech Stack

### Frontend
- **React** with Vite
- **TailwindCSS** + DaisyUI
- **React Query** for state management
- **Stream Chat React** for messaging
- **Socket.io Client** for real-time features

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **Socket.io** for real-time communication
- **Stream Chat** for messaging infrastructure
- **Multer** for file uploads
- **JWT** for authentication

## 📦 Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- Stream Chat API key

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
# Configure your environment variables
npm run dev
```

## 🌐 Environment Variables

### Backend (.env)
```
PORT=5001
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
STREAM_API_KEY=your_stream_api_key
STREAM_SECRET_KEY=your_stream_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5001
VITE_STREAM_API_KEY=your_stream_api_key
```

## 🚀 Deployment

### Backend (Render)
1. Connect GitHub repository
2. Set environment variables
3. Deploy with Node.js

### Frontend (Vercel)
1. Connect GitHub repository
2. Set build command: `npm run build`
3. Set environment variables
4. Deploy

## 📱 Features Overview

- **Authentication**: Secure login/signup with JWT
- **Real-time Chat**: Powered by Stream Chat API
- **Voice/Video Calls**: WebRTC integration
- **Social Feed**: Twitter-like post system
- **Group Management**: Create and manage chat groups
- **File Uploads**: Images for posts and group avatars
- **Responsive Design**: Mobile-first approach

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request