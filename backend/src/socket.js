// socket.js
import { io } from "socket.io-client";

const URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const socket = io(URL, {
  withCredentials: true,
  autoConnect: false, // connect manually after auth
});
