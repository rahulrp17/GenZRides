import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Bell, CheckCheck, Trash2 } from 'lucide-react';
import { notificationAPI } from '../../services/endpoints';
import { useSocket } from '../../Context/SocketContext';
import { ListSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import PushToggle from '../../components/PushToggle';
import { motion as Motion } from 'framer-motion';

const bookingIdOf = (n) => {
  if (!n?.booking) return null;
  return typeof n.booking === 'object' ? n.booking._id : n.booking;
};

const Notifications = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['notifications', page],
    queryFn: async () => {
      const { data } = await notificationAPI.getAll({ page, limit: 20 });
      return data;
    },
    staleTime: 30_000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load notifications'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })} />;

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      toast.success('All notifications marked as read');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark all as read'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark as read'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete notification'),
  });

  const notifications = data?.data || [];
  const pagination = data || {};
  const hasUnread = useMemo(() => notifications.some((n) => !n.isRead), [notifications]);

  // Realtime list + bell badge refresh (read state persists server-side)
  useEffect(() => {
    if (!socket) return;
    const handleIncoming = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
    // /customer/bookings is a list page (no :id route) — pass the id so the
    // list can highlight/scroll to it instead of hitting a dead route.
    navigate('/customer/bookings', { state: { highlightBookingId: bookingId } });
  };

  const typeColors = {
    Booking: 'bg-blue-500/20 text-blue-400',
    Ride: 'bg-emerald-500/20 text-emerald-400',
    Payment: 'bg-amber-500/20 text-amber-400',
    Wallet: 'bg-purple-500/20 text-purple-400',
    Review: 'bg-pink-500/20 text-pink-400',
    Withdrawal: 'bg-indigo-500/20 text-indigo-400',
    Promotion: 'bg-orange-500/20 text-orange-400',
    System: 'bg-white/10 text-gray-400',
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <div className="flex items-center gap-2">
          <PushToggle />
          {hasUnread && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-400 bg-indigo-500/10 rounded-lg hover:bg-indigo-500/20 transition"
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
              <Motion.div
                key={n._id}
                onClick={() => handleOpen(n)}
                className={`bg-white/5 backdrop-blur-lg rounded-xl p-4 shadow-sm border transition ${
                  n.isRead ? 'border-white/10' : 'border-indigo-500/30 bg-indigo-500/10'
                } ${hasBooking ? 'cursor-pointer hover:border-indigo-500/50' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeColors[n.type] || 'bg-white/10'}`}>
                    <Bell size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white">{n.title}</h4>
                      <div className="flex items-center gap-1 shrink-0 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                        {n.isRead ? (
                          <span className="p-1" title="Seen">
                            <CheckCheck size={14} className="text-emerald-400" />
                          </span>
                        ) : (
                          <button
                            onClick={() => markReadMutation.mutate(n._id)}
                            className="p-1 hover:bg-white/10 rounded transition"
                            title="Mark as read"
                          >
                            <CheckCheck size={14} className="text-gray-500" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteMutation.mutate(n._id)}
                          className="p-1 hover:bg-red-500/10 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{n.message}</p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <p className="text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {hasBooking && (
                        <span className="text-xs font-medium text-indigo-400">View booking →</span>
                      )}
                    </div>
                  </div>
                </div>
              </Motion.div>
              );
            })}
          </div>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </Motion.div>
  );
};

export default Notifications;
