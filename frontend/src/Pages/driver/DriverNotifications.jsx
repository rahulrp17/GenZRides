import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../services/endpoints';
import { useSocket } from '../../Context/SocketContext';
import { ListSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import PushToggle from '../../components/PushToggle';

const bookingIdOf = (n) => {
  if (!n?.booking) return null;
  return typeof n.booking === 'object' ? n.booking._id : n.booking;
};

const DriverNotifications = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['driverNotifications', page],
    queryFn: async () => {
      const { data } = await notificationAPI.getAll({ page, limit: 20 });
      return data;
    },
    staleTime: 30_000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['driverNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark all as read'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driverNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark as read'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['driverNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete notification'),
  });

  const notifications = data?.data || [];
  const hasUnread = useMemo(() => notifications.some((n) => !n.isRead), [notifications]);

  // Realtime list + bell badge refresh (read state persists server-side)
  useEffect(() => {
    if (!socket) return;
    const handleIncoming = () => {
      queryClient.invalidateQueries({ queryKey: ['driverNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    };
    socket.on('notification', handleIncoming);
    return () => {
      socket.off('notification', handleIncoming);
    };
  }, [socket, queryClient]);

  const handleOpen = (n) => {
    const bookingId = bookingIdOf(n);
    if (!bookingId) return;
    if (!n.isRead) markReadMutation.mutate(n._id);
    navigate(`/driver/bookings/${bookingId}`);
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {isError ? (
        <ErrorState message={error?.message || 'Failed to load notifications'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['driverNotifications'] })} />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h1 className="font-display text-2xl font-bold text-white tracking-tight">Notifications</h1>
            <div className="flex items-center gap-2">
              <PushToggle />
              {hasUnread && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition"
                >
                  <CheckCheck size={16} /> Mark all read
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <ListSkeleton count={5} />
          ) : notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up!" />
          ) : (
            <>
              <div className="space-y-2">
                {notifications.map((n) => {
                  const hasBooking = !!bookingIdOf(n);
                  return (
                  <div
                    key={n._id}
                    onClick={() => handleOpen(n)}
                    className={`bg-white/5 rounded-xl p-4 shadow-sm border transition ${n.isRead ? 'border-white/10' : 'border-indigo-500/30 bg-indigo-500/5'} ${hasBooking ? 'cursor-pointer hover:border-indigo-500/50' : ''}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center shrink-0">
                        <Bell size={16} className="text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                          <div className="flex gap-1 shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                            {n.isRead ? (
                              <span className="p-1" title="Seen">
                                <CheckCheck size={14} className="text-emerald-400" />
                              </span>
                            ) : (
                              <button onClick={() => markReadMutation.mutate(n._id)} className="p-1 hover:bg-white/10 rounded" title="Mark as read">
                                <CheckCheck size={14} className="text-gray-500" />
                              </button>
                            )}
                            <button onClick={() => deleteMutation.mutate(n._id)} className="p-1 hover:bg-red-500/10 rounded">
                              <Trash2 size={14} className="text-gray-500" />
                            </button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                        <div className="flex items-center justify-between gap-2 mt-2">
                          <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                          {hasBooking && (
                            <span className="text-xs font-medium text-indigo-400">View booking →</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
              <Pagination page={data?.page || 1} totalPages={data?.totalPages || 1} onPageChange={setPage} />
            </>
          )}
        </>
      )}
    </Motion.div>
  );
};

export default DriverNotifications;
