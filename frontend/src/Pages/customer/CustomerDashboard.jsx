import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Car, Clock, CreditCard, Bell, Star, MapPin, ArrowRight } from 'lucide-react';
import { bookingAPI, notificationAPI } from '../../services/endpoints';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import StatsCard from '../../components/shared/StatsCard';
import useAuth from '../../hooks/useAuth';
import { motion as Motion } from 'framer-motion';

const CustomerDashboard = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading: loadingBookings, isError: bookingsError, error: bookingsErr } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const { data } = await bookingAPI.getMyBookings({ page: 1, limit: 5 });
      return data;
    },
  });

  const { data: notifications, isError: notifError, error: notifErr } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const { data } = await notificationAPI.getUnreadCount();
      return data;
    },
  });

  const recentBookings = bookings?.bookings || [];
  const unreadCount = notifications?.unread || 0;

  if (bookingsError) return <ErrorState message={bookingsErr?.message || 'Failed to load bookings'} />;
  if (notifError) return <ErrorState message={notifErr?.message || 'Failed to load notifications'} />;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Welcome */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">
          Welcome back, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-sm text-slate-200/80 mt-1">Here's what's happening with your rides.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Car} label="Total Rides" value={bookings?.total || 0} color="indigo" />
        <StatsCard icon={Clock} label="Pending" value={recentBookings.filter(b => b.bookingStatus === 'Pending').length} color="amber" />
        <StatsCard icon={CreditCard} label="Completed" value={recentBookings.filter(b => b.bookingStatus === 'Completed').length} color="emerald" />
        <StatsCard icon={Bell} label="Notifications" value={unreadCount} color="blue" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/customer/book"
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            <Car size={24} />
            <div>
              <p className="font-semibold">Book a Ride</p>
              <p className="text-sm opacity-80">Schedule your next trip</p>
            </div>
            <ArrowRight size={18} className="ml-auto" />
          </Link>
          <Link
            to="/customer/history"
            className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <Clock size={24} className="text-green-400" />
            <div>
              <p className="font-semibold">Ride History</p>
              <p className="text-sm text-gray-400">View past rides</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-gray-400" />
          </Link>
          <Link
            to="/customer/favorites"
            className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 text-white hover:bg-white/10 transition-all"
          >
            <MapPin size={24} className="text-green-400" />
            <div>
              <p className="font-semibold">Favorite Places</p>
              <p className="text-sm text-gray-400">Save frequent locations</p>
            </div>
            <ArrowRight size={18} className="ml-auto text-gray-400" />
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Rides</h2>
          <Link to="/customer/history" className="text-sm text-green-400 hover:text-green-300 font-medium">
            View All
          </Link>
        </div>
        {loadingBookings ? (
          <div className="p-6"><CardSkeleton /></div>
        ) : recentBookings.length === 0 ? (
          <div className="p-6 text-center py-12">
            <Car className="mx-auto mb-3 text-gray-500/50" size={40} />
            <p className="text-gray-400">No rides yet. Book your first ride!</p>
            <Link
              to="/customer/book"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
            >
              <Car size={16} /> Book Now
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {recentBookings.map((booking) => (
              <div key={booking._id} className="p-4 hover:bg-white/5 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      booking.bookingStatus === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      booking.bookingStatus === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      <Car size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-none">
                        {booking.pickup?.address} → {booking.drop?.address}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {new Date(booking.pickupDateTime).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      booking.bookingStatus === 'Completed' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                      booking.bookingStatus === 'Cancelled' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      booking.bookingStatus === 'Accepted' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {booking.bookingStatus}
                    </span>
                    {booking.finalFare > 0 && (
                      <p className="text-sm font-semibold text-white mt-1">₹{booking.finalFare}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Motion.div>
  );
};

export default CustomerDashboard;
