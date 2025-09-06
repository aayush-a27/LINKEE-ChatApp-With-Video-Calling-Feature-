import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import cookieParser from "cookie-parser";

import authRoutes from "../src/routes/auth.route.js";
import userRoutes from "../src/routes/user.route.js";
import chatRoutes from "../src/routes/chat.route.js";
import callRoutes from "../src/routes/call.route.js";
import notificationRoutes from "../src/routes/notification.route.js";
import webhookRoutes from "../src/routes/webhook.route.js";
import exploreRoutes from "../src/routes/explore.route.js";
import groupRoutes from "../src/routes/group.route.js";

import { connectDB } from "./lib/db.js";
import callController from "../src/controllers/call.controller.js";
import notificationController from "../src/controllers/notification.controller.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Create HTTP server for Socket.IO
const server = createServer(app);

app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.FRONTEND_LOCAL_URL || "http://localhost:5173"
        ].filter(Boolean);
        
        // Allow Vercel preview URLs
        if (!origin || allowedOrigins.includes(origin) || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));
app.use(express.json());
app.use(cookieParser());

// Serve static files for uploads
app.use('/uploads', (req, res, next) => {
    console.log('Static file request:', req.path);
    next();
}, express.static('uploads'));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/explore", exploreRoutes);
app.use("/api/groups", groupRoutes);


// Initialize Socket.IO globally for call functionality
const io = callController.initializeSocket(server);

// Initialize notification controller with socket
notificationController.initializeSocket(io, callController.userSockets);

// Make socket globally accessible for all controllers
global.io = io;
global.callController = callController;
global.notificationController = notificationController;

console.log('Socket.IO initialized globally:', !!global.io);

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`WebSocket server initialized and globally accessible`);
    connectDB();
});