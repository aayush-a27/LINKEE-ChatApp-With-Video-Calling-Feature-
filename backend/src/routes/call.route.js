import express from 'express';
import callController from '../controllers/call.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Send/Start a call
router.post('/send', protectRoute, (req, res) => {
  callController.sendCall(req, res);
});

// Receive/Accept a call
router.post('/receive', protectRoute, (req, res) => {
  callController.receiveCall(req, res);
});

// Reject a call
router.post('/reject', protectRoute, (req, res) => {
  callController.rejectCall(req, res);
});

// End a call
router.post('/end', protectRoute, (req, res) => {
  callController.endCall(req, res);
});

// Get call status
router.get('/:callId/status', protectRoute, (req, res) => {
  callController.getCallStatus(req, res);
});

// Get active calls (for debugging)
router.get('/active', protectRoute, (req, res) => {
  try {
    const activeCalls = Array.from(callController.activeCalls.entries())
      .map(([callId, call]) => ({
        callId,
        ...call
      }));

    res.json({
      success: true,
      data: {
        count: activeCalls.length,
        calls: activeCalls
      }
    });
  } catch (error) {
    console.error('Get active calls error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get online users (for debugging)
router.get('/users/online', protectRoute, (req, res) => {
  try {
    const onlineUsers = Array.from(callController.userSockets.entries())
      .map(([userId, socketId]) => ({
        userId,
        socketId,
        connected: true
      }));

    res.json({
      success: true,
      data: {
        count: onlineUsers.length,
        users: onlineUsers
      }
    });
  } catch (error) {
    console.error('Get online users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;