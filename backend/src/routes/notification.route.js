import express from 'express';
import notificationController from '../controllers/notification.controller.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

// Get user notifications
router.get('/', protectRoute, notificationController.getUserNotifications);

// Mark notification as read
router.patch('/:notificationId/read', protectRoute, notificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', protectRoute, notificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', protectRoute, notificationController.deleteNotification);

export default router;