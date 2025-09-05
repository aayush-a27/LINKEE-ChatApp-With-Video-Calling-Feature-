import { Server } from 'socket.io';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Utility function to sanitize log inputs
const sanitizeForLog = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[\r\n\t]/g, '_').substring(0, 100);
};

const callSchema = new mongoose.Schema({
  callId: { type: String, required: true, unique: true },
  callerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  calleeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callType: { type: String, enum: ['audio', 'video'], default: 'video' },
  status: { type: String, enum: ['ringing', 'active', 'ended', 'rejected'], required: true },
  startTime: { type: Date, required: true },
  acceptedTime: { type: Date },
  endTime: { type: Date },
  duration: { type: Number, default: 0 },
  endedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Call = mongoose.model('Call', callSchema);

class CallController {
  constructor() {
    this.activeCalls = new Map();
    this.userSockets = new Map();
    this.io = null;
  }

  initializeSocket(server) {
    this.io = new Server(server, {
      cors: {
        origin: [
          process.env.FRONTEND_URL,
          process.env.FRONTEND_LOCAL_URL || "http://localhost:5173"
        ].filter(Boolean),
        methods: ["GET", "POST"]
      }
    });

    this.io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join', (userId) => {
        this.userSockets.set(userId, socket.id);
        socket.userId = userId;
        console.log(`User ${sanitizeForLog(userId)} joined with socket ${socket.id}`);
      });

      socket.on('offer', (data) => {
        console.log(`Offer from ${sanitizeForLog(socket.userId)} to ${sanitizeForLog(data.to)}`);
        const targetSocket = this.userSockets.get(data.to);
        console.log(`Target socket for ${data.to}:`, targetSocket);
        if (targetSocket) {
          this.io.to(targetSocket).emit('offer', {
            offer: data.offer,
            from: socket.userId
          });
          console.log(`Offer sent to ${data.to}`);
        } else {
          console.log(`No socket found for user ${data.to}`);
        }
      });

      socket.on('answer', (data) => {
        console.log(`Answer from ${sanitizeForLog(socket.userId)} to ${sanitizeForLog(data.to)}`);
        const targetSocket = this.userSockets.get(data.to);
        console.log(`Target socket for ${data.to}:`, targetSocket);
        if (targetSocket) {
          this.io.to(targetSocket).emit('answer', {
            answer: data.answer,
            from: socket.userId
          });
          console.log(`Answer sent to ${data.to}`);
        } else {
          console.log(`No socket found for user ${data.to}`);
        }
      });

      socket.on('ice-candidate', (data) => {
        console.log(`ICE candidate from ${socket.userId} to ${data.to}`);
        const targetSocket = this.userSockets.get(data.to);
        console.log(`Target socket for ${data.to}:`, targetSocket);
        if (targetSocket) {
          this.io.to(targetSocket).emit('ice-candidate', {
            candidate: data.candidate,
            from: socket.userId
          });
          console.log(`ICE candidate sent to ${data.to}`);
        } else {
          console.log(`No socket found for user ${data.to}`);
        }
      });

      // Explore page events
      socket.on('joinExplore', () => {
        socket.join('explore');
        console.log(`User ${socket.userId} joined explore room`);
      });

      socket.on('leaveExplore', () => {
        socket.leave('explore');
        console.log(`User ${socket.userId} left explore room`);
      });

      socket.on('disconnect', () => {
        if (socket.userId) {
          this.userSockets.delete(socket.userId);
          this.endCallForUser(socket.userId);
        }
        console.log('User disconnected:', socket.id);
      });
    });

    // Make io globally accessible
    global.io = this.io;
    return this.io;
  }

  // Send/Start a call
  async sendCall(req, res) {
    try {
      const { friendId, callType = 'video' } = req.body;
      const callerId = req.user._id.toString();

      if (!friendId) {
        return res.status(400).json({ success: false, message: 'Friend ID is required' });
      }

      const caller = await User.findById(callerId);
      const friend = await User.findById(friendId);

      if (!friend) {
        return res.status(404).json({ success: false, message: 'Friend not found' });
      }

      if (!caller.friends.includes(friendId)) {
        return res.status(403).json({ success: false, message: 'You can only call your friends' });
      }

      const callerSocket = this.userSockets.get(callerId);
      const friendSocket = this.userSockets.get(friendId);

      if (!callerSocket) {
        return res.status(400).json({ success: false, message: 'You are not connected' });
      }

      if (!friendSocket) {
        return res.status(400).json({ success: false, message: 'Friend is not online' });
      }

      const existingCall = Array.from(this.activeCalls.values())
        .find(call => 
          call.callerId === callerId || call.calleeId === callerId || 
          call.callerId === friendId || call.calleeId === friendId
        );

      if (existingCall) {
        return res.status(400).json({ success: false, message: 'User is already in a call' });
      }

      const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const callData = {
        callId,
        callerId,
        calleeId: friendId,
        callType,
        status: 'ringing',
        startTime: new Date()
      };

      this.activeCalls.set(callId, callData);

      const callerInfo = {
        id: callerId,
        fullName: caller.fullName,
        profilePic: caller.profilePic
      };

      this.io.to(friendSocket).emit('incoming-call', {
        callId,
        callerId,
        callType,
        callerInfo
      });

      // Send notification
      if (global.notificationController) {
        global.notificationController.sendCallNotification(callerId, friendId, {
          type: 'incoming',
          callId,
          callerName: caller.fullName,
          callType,
          status: 'ringing'
        });
      }

      this.io.to(callerSocket).emit('call-initiated', {
        callId,
        calleeId: friendId,
        status: 'ringing'
      });

      res.json({
        success: true,
        message: 'Call sent successfully',
        data: { callId, status: 'ringing', friendName: friend.fullName }
      });

    } catch (error) {
      console.error('Send call error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Receive/Accept a call
  async receiveCall(req, res) {
    try {
      const { callId } = req.body;
      const userId = req.user._id.toString();

      if (!callId) {
        return res.status(400).json({ success: false, message: 'Call ID is required' });
      }

      const call = this.activeCalls.get(callId);

      if (!call) {
        return res.status(404).json({ success: false, message: 'Call not found' });
      }

      if (call.calleeId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to accept this call' });
      }

      if (call.status !== 'ringing') {
        return res.status(400).json({ success: false, message: 'Call cannot be accepted' });
      }

      call.status = 'active';
      call.acceptedTime = new Date();

      const callerSocket = this.userSockets.get(call.callerId);
      const calleeSocket = this.userSockets.get(call.calleeId);

      if (callerSocket) {
        this.io.to(callerSocket).emit('call-accepted', {
          callId,
          acceptedBy: userId
        });
        
        // Send notification to caller
        if (global.notificationController) {
          global.notificationController.sendCallNotification(userId, call.callerId, {
            type: 'update',
            callId,
            callerName: 'Friend',
            callType: call.callType,
            status: 'accepted'
          });
        }
      }

      if (calleeSocket) {
        this.io.to(calleeSocket).emit('call-started', {
          callId,
          with: call.callerId
        });
      }

      res.json({
        success: true,
        message: 'Call accepted successfully',
        data: { callId, status: 'active' }
      });

    } catch (error) {
      console.error('Accept call error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Reject a call
  async rejectCall(req, res) {
    try {
      const { callId } = req.body;
      const userId = req.user._id.toString();

      if (!callId) {
        return res.status(400).json({ success: false, message: 'Call ID is required' });
      }

      const call = this.activeCalls.get(callId);

      if (!call) {
        return res.status(404).json({ success: false, message: 'Call not found' });
      }

      if (call.calleeId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to reject this call' });
      }

      if (call.status !== 'ringing') {
        return res.status(400).json({ success: false, message: 'Call cannot be rejected' });
      }

      call.status = 'rejected';
      call.endTime = new Date();
      call.rejectedBy = userId;

      await this.saveCallToDatabase(call);

      const callerSocket = this.userSockets.get(call.callerId);
      if (callerSocket) {
        this.io.to(callerSocket).emit('call-rejected', {
          callId,
          rejectedBy: userId,
          reason: 'user_rejected'
        });
        
        // Send notification to caller
        if (global.notificationController) {
          global.notificationController.sendCallNotification(userId, call.callerId, {
            type: 'update',
            callId,
            callerName: 'Friend',
            callType: call.callType,
            status: 'rejected'
          });
        }
      }

      setTimeout(() => {
        this.activeCalls.delete(callId);
      }, 5000);

      res.json({
        success: true,
        message: 'Call rejected successfully',
        data: { callId, rejectedBy: userId }
      });

    } catch (error) {
      console.error('Reject call error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // End a call
  async endCall(req, res) {
    try {
      const { callId } = req.body;
      const userId = req.user._id.toString();

      if (!callId) {
        return res.status(400).json({ success: false, message: 'Call ID is required' });
      }

      const call = this.activeCalls.get(callId);

      if (!call) {
        return res.status(404).json({ success: false, message: 'Call not found' });
      }

      if (call.callerId !== userId && call.calleeId !== userId) {
        return res.status(403).json({ success: false, message: 'Unauthorized to end this call' });
      }

      call.status = 'ended';
      call.endTime = new Date();
      call.endedBy = userId;

      const duration = call.acceptedTime ? 
        Math.floor((call.endTime - call.acceptedTime) / 1000) : 0;
      call.duration = duration;

      await this.saveCallToDatabase(call);

      const callerSocket = this.userSockets.get(call.callerId);
      const calleeSocket = this.userSockets.get(call.calleeId);

      const endCallData = {
        callId,
        endedBy: userId,
        duration,
        reason: 'user_ended'
      };

      if (callerSocket) {
        this.io.to(callerSocket).emit('call-ended', endCallData);
      }

      if (calleeSocket) {
        this.io.to(calleeSocket).emit('call-ended', endCallData);
      }

      setTimeout(() => {
        this.activeCalls.delete(callId);
      }, 5000);

      res.json({
        success: true,
        message: 'Call ended successfully',
        data: { callId, duration, endedBy: userId }
      });

    } catch (error) {
      console.error('End call error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async saveCallToDatabase(callData) {
    try {
      const call = new Call({
        callId: callData.callId,
        callerId: callData.callerId,
        calleeId: callData.calleeId,
        callType: callData.callType,
        status: callData.status,
        startTime: callData.startTime,
        acceptedTime: callData.acceptedTime,
        endTime: callData.endTime,
        duration: callData.duration || 0,
        endedBy: callData.endedBy,
        rejectedBy: callData.rejectedBy
      });

      await call.save();
      console.log('Call saved to database:', sanitizeForLog(callData.callId));
    } catch (error) {
      console.error('Error saving call to database:', error.message);
      throw error;
    }
  }

  async endCallForUser(userId) {
    const userCall = Array.from(this.activeCalls.values())
      .find(call => 
        (call.callerId === userId || call.calleeId === userId) && 
        call.status !== 'ended'
      );

    if (userCall) {
      userCall.status = 'ended';
      userCall.endTime = new Date();
      userCall.endedBy = userId;

      const duration = userCall.acceptedTime ? 
        Math.floor((userCall.endTime - userCall.acceptedTime) / 1000) : 0;
      userCall.duration = duration;

      await this.saveCallToDatabase(userCall);

      const otherUserId = userCall.callerId === userId ? 
        userCall.calleeId : userCall.callerId;
      
      const otherUserSocket = this.userSockets.get(otherUserId);
      
      if (otherUserSocket) {
        this.io.to(otherUserSocket).emit('call-ended', {
          callId: userCall.callId,
          endedBy: userId,
          duration: duration,
          reason: 'user_disconnected'
        });
      }

      setTimeout(() => {
        this.activeCalls.delete(userCall.callId);
      }, 5000);
    }
  }

  async getCallStatus(req, res) {
    try {
      const { callId } = req.params;
      const call = this.activeCalls.get(callId);

      if (!call) {
        return res.status(404).json({ success: false, message: 'Call not found' });
      }

      res.json({ success: true, data: call });
    } catch (error) {
      console.error('Get call status error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new CallController();