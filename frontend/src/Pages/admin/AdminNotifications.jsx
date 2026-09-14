import React, { useState, useEffect } from 'react';
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

const AdminNotifications = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { socket } = useSocket();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminNotifications', page],
    queryFn: async () => {
      const { data } = await notificationAPI.getAll({ page, limit: 20 });
      return data;
    },
    staleTime: 30_000,
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
      toast.success('All marked as read');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark all as read'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to mark as read'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => {
      toast.success('Notification deleted');
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
      queryClient.invalidateQueries({ queryKey: ['unreadCount'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete notification'),
  });

  const notifications = data?.data || [];

  useEffect(() => {
    if (!socket) return;
    const handleIncoming = () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] });
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
    navigate(`/admin/bookings/${bookingId}`);
  };

  if (isError) return <ErrorState message={error?.message || 'Failed to load notifications'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })} />;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Notifications</h1>
        <div className="flex items-center gap-2">
          <PushToggle />
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={() => markAllMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl hover:bg-green-500/20 transition"
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
                className={`bg-white/5 backdrop-blur-lg rounded-[30px] p-4 border transition ${n.isRead ? 'border-white/10' : 'border-green-500/20 bg-green-500/5'} ${hasBooking ? 'cursor-pointer hover:border-green-500/40' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                    <Bell size={16} className="text-green-400" />
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
                          <button onClick={() => markReadMutation.mutate(n._id)} className="p-1 hover:bg-white/5 rounded-xl" title="Mark as read">
                            <CheckCheck size={14} className="text-gray-500 hover:text-white" />
                          </button>
                        )}
                        <button onClick={() => deleteMutation.mutate(n._id)} className="p-1 hover:bg-red-500/10 rounded-xl">
                          <Trash2 size={14} className="text-gray-500 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mt-1">{n.message}</p>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <p className="text-xs text-gray-500">{new Date(n.createdAt).toLocaleString('en-IN')}</p>
                      {hasBooking && (
                        <span className="text-xs font-medium text-green-400">View booking →</span>
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
    </Motion.div>
  );
};

export default AdminNotifications;
