import express from 'express';
import crypto from 'crypto';

const router = express.Router();

// Stream webhook verification middleware
const verifyStreamWebhook = (req, res, next) => {
  const signature = req.headers['x-signature'];
  const body = JSON.stringify(req.body);
  
  // Create expected signature using Stream secret
  const expectedSignature = crypto
    .createHmac('sha256', process.env.STREAM_SECRET_KEY)
    .update(body)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  next();
};

// Stream chat webhook endpoint
router.post('/stream/chat', verifyStreamWebhook, async (req, res) => {
  try {
    const { type, message, user, channel } = req.body;
    
    // Validate required properties
    if (!user?.id || !channel?.id || !channel?.members) {
      return res.status(400).json({ error: 'Missing required webhook data' });
    }
    
    // Only handle new message events
    if (type === 'message.new') {
      const senderId = user.id;
      const senderName = user.name || 'Unknown User';
      const channelId = channel.id;
      
      // Get channel members to find who to notify
      const members = channel.members || [];
      
      // Notify all members except the sender
      for (const member of members) {
        if (member.user_id !== senderId) {
          // Send notification to this member
          if (global.notificationController) {
            await global.notificationController.sendMessageNotification(
              senderId,
              member.user_id,
              {
                senderName,
                channelId,
                messageText: message.text || 'New message'
              }
            );
          }
        }
      }
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Stream webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;