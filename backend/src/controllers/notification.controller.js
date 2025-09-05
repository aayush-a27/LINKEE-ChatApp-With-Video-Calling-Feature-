import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['call', 'friend_request', 'group_joined', 'group_member_removed', 'group_member_left'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: Object, default: {} },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

class NotificationController {
  constructor() {
    this.io = null;
    this.userSockets = new Map();
  }

  // Initialize with socket.io instance
  initializeSocket(io, userSockets) {
    this.io = io;
    this.userSockets = userSockets;
  }

  // Send real-time notification
  async sendNotification(fromUserId, toUserId, notification) {
    const userId = toUserId;
    try {
      // Save to database
      const newNotification = new Notification({
        userId,
        ...notification
      });
      await newNotification.save();

      // Send real-time notification via socket
      const userSocketId = this.userSockets.get(userId);
      if (userSocketId && this.io) {
        this.io.to(userSocketId).emit('notification', {
          id: newNotification._id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data,
          createdAt: newNotification.createdAt
        });
      }

      return newNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }



  // Send call notification
  async sendCallNotification(callerId, receiverId, callData) {
    // Validate required callData properties
    if (!callData.callerName || !callData.callType || !callData.status) {
      console.error('Missing required callData properties');
      return;
    }
    
    const notification = {
      type: 'call',
      title: callData.type === 'incoming' ? 'Incoming Call' : 'Call Update',
      message: callData.type === 'incoming' 
        ? `Incoming ${callData.callType} call from ${callData.callerName}`
        : `Call ${callData.status}`,
      data: {
        callId: callData.callId,
        callerId,
        callerName: callData.callerName,
        callType: callData.callType,
        status: callData.status
      }
    };

    return await this.sendNotification(callerId, receiverId, notification);
  }

  // Send friend request notification
  async sendFriendRequestNotification(senderId, receiverId, requestData) {
    const notification = {
      type: 'friend_request',
      title: 'Friend Request',
      message: `${requestData.senderName} sent you a friend request`,
      data: {
        requestId: requestData.requestId,
        senderId,
        senderName: requestData.senderName,
        senderProfilePic: requestData.senderProfilePic
      }
    };

    return await this.sendNotification(senderId, receiverId, notification);
  }

  // Get user notifications
  async getUserNotifications(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const query = { userId };
      if (unreadOnly === 'true') {
        query.read = false;
      }

      const notifications = await Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const unreadCount = await Notification.countDocuments({ 
        userId, 
        read: false 
      });

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          currentPage: page,
          totalPages: Math.ceil(await Notification.countDocuments(query) / limit)
        }
      });
    } catch (error) {
      console.error('Error getting notifications:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Mark notification as read
  async markAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;

      await Notification.findOneAndUpdate(
        { _id: notificationId, userId },
        { read: true }
      );

      res.json({ success: true, message: 'Notification marked as read' });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Mark all notifications as read
  async markAllAsRead(req, res) {
    try {
      const userId = req.user._id;

      await Notification.updateMany(
        { userId, read: false },
        { read: true }
      );

      res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user._id;

      const result = await Notification.findOneAndDelete({ _id: notificationId, userId });
      
      if (!result) {
        return res.status(404).json({ success: false, message: 'Notification not found' });
      }

      res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }


}

export default new NotificationController();