import { useQuery } from '@tanstack/react-query';
import { getNotifications } from '../lib/api';

export const useNotifications = () => {
  const { data: notificationData, isLoading, refetch } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: () => getNotifications(1, 1, true), // Only get 1 unread notification to get count
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const unreadCount = notificationData?.data?.unreadCount || 0;

  return {
    unreadCount,
    isLoading,
    refetch
  };
};