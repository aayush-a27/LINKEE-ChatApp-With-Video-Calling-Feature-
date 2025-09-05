import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../lib/api';
import Layout from '../component/Layout';
import toast from 'react-hot-toast';
import { Bell, Phone, Users, Check, Trash2, CheckCheck } from 'lucide-react';

const NotificationPage = () => {
  const [filter, setFilter] = useState('all'); // all, unread
  const queryClient = useQueryClient();

  const { data: notificationData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', filter],
    queryFn: () => getNotifications(1, 50, filter === 'unread'),
  });

  const markAsReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification marked as read');
    },
    onError: () => {
      toast.error('Failed to mark as read');
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    },
    onError: () => {
      toast.error('Failed to mark all as read');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('Notification deleted');
    },
    onError: () => {
      toast.error('Failed to delete notification');
    }
  });

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'call':
        return <Phone className="w-5 h-5 text-green-500" />;
      case 'friend_request':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const notifications = notificationData?.data?.notifications || [];
  const unreadCount = notificationData?.data?.unreadCount || 0;

  if (isLoading) {
    return (
      <Layout showSidebar={true} showNavbar={true}>
        <div className="flex items-center justify-center h-full">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSidebar={true} showNavbar={true}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <Bell className="w-6 h-6 sm:w-10 sm:h-10 text-primary" />
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-xs sm:text-sm text-gray-500">{unreadCount} unread notifications</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="btn btn-outline btn-xs sm:btn-md"
              >
                <CheckCheck className="w-3 h-3 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Mark All Read</span>
                <span className="sm:hidden">Read All</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="tabs tabs-boxed mb-4 sm:mb-6">
          <button
            className={`tab tab-sm sm:tab-lg ${filter === 'all' ? 'tab-active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({notifications.length})
          </button>
          <button
            className={`tab tab-sm sm:tab-lg ${filter === 'unread' ? 'tab-active' : ''}`}
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div className="space-y-2 sm:space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Bell className="w-12 h-12 sm:w-20 sm:h-20 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-2xl font-semibold text-gray-600 mb-2">
                {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">
                {filter === 'unread' 
                  ? 'All caught up! Check back later for new notifications.'
                  : 'When you receive calls or friend requests, they\'ll appear here.'
                }
              </p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`card bg-base-100 shadow-sm border-l-4 ${
                  notification.read 
                    ? 'border-l-gray-300 opacity-75' 
                    : 'border-l-primary'
                }`}
              >
                <div className="card-body p-3 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2 sm:gap-3 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-0.5 sm:mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 sm:gap-2 mb-1">
                          <h3 className="font-semibold text-xs sm:text-base">
                            {notification.title}
                          </h3>
                          {!notification.read && (
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-primary rounded-full"></div>
                          )}
                        </div>
                        <p className="text-xs sm:text-base text-gray-600 mb-1 sm:mb-3">
                          {notification.message}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-0.5 sm:gap-1 ml-1 sm:ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => markAsReadMutation.mutate(notification._id)}
                          disabled={markAsReadMutation.isPending}
                          className="btn btn-ghost btn-xs"
                          title="Mark as read"
                        >
                          <Check className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteMutation.mutate(notification._id)}
                        disabled={deleteMutation.isPending}
                        className="btn btn-ghost btn-xs text-error hover:bg-error hover:text-white"
                        title="Delete"
                      >
                        <Trash2 className="w-2.5 h-2.5 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More (if needed) */}
        {notifications.length > 0 && notifications.length % 20 === 0 && (
          <div className="text-center mt-6">
            <button 
              onClick={() => refetch()}
              className="btn btn-outline"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationPage;