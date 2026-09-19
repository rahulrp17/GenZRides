import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import {
  Home, Car, Clock, Wallet, Star, Bell, User,
  FileText, LogOut, Menu, ChevronDown, IndianRupee, LayoutPanelLeft, Calendar, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { useSocket } from '../Context/SocketContext';
import { driverAPI } from '../services/endpoints';
import SEO from '../components/SEO';
import PushListener from '../components/PushListener';
import AutoPushSync from '../components/AutoPushSync';
import DriverLocationSharer from '../components/DriverLocationSharer';
import { motion as Motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Home', icon: Home, end: true },
  { path: '/driver', label: 'Dashboard', icon: LayoutPanelLeft, end: true },
  { path: '/driver/bookings', label: 'Bookings', icon: Calendar },
  { path: '/driver/ride', label: 'Current Ride', icon: Car },
  { path: '/driver/history', label: 'Ride History', icon: Clock },
  { path: '/driver/earnings', label: 'Earnings', icon: IndianRupee },
  { path: '/driver/wallet', label: 'Wallet', icon: Wallet },
  { path: '/driver/reviews', label: 'Reviews', icon: Star },
  { path: '/driver/notifications', label: 'Notifications', icon: Bell },
  { path: '/driver/profile', label: 'Profile', icon: User },
  { path: '/driver/documents', label: 'Documents', icon: FileText },
];

const DriverLayout = () => {
  const { user, loading, logout } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside, { passive: true });
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [dropdownOpen]);

  // VERBOSE: Driver auto-online on entering website.
  // When a driver opens the dashboard (any page under /driver), immediately
  // mark them online via REST + socket. Stays online; only goes offline
  // (busy) when CurrentRide exists (on trip). After trip completes, this
  // effect re-runs or completeRide sets available back to true.
  useEffect(() => {
    if (!user || user.role !== 'driver' || loading) return;
    let cancelled = false;
    let lastOnlineAt = 0;
    const goOnline = async () => {
      // Debounce: skip if we already went online in the last 60s
      // (prevents REST storms on flaky socket reconnects).
      const now = Date.now();
      if (now - lastOnlineAt < 60_000) return;
      lastOnlineAt = now;
      try {
        // Best-effort REST path (works even if socket not yet ready)
        await driverAPI.goOnline();
        if (!cancelled && import.meta.env.DEV) console.log('[DriverLayout] auto-online REST ok');
      } catch (e) {
        // Approved check may fail; ignore silently
        if (import.meta.env.DEV) console.log('[DriverLayout] auto-online REST failed', e?.response?.data?.message || e.message);
      }
      // Also emit via socket for instant isOnline without waiting REST round-trip
      try {
        if (socket && socket.connected) {
          socket.emit('driver-online');
          if (import.meta.env.DEV) console.log('[DriverLayout] emitted driver-online');
        }
      } catch { /* ignore */ }
    };
    // Small delay so socket has time to connect after Auth loads
    const t = setTimeout(goOnline, 600);
    // Also re-attempt when socket connects later
    let off;
    if (socket) {
      const onConnect = () => goOnline();
      socket.on('connect', onConnect);
      off = () => socket.off('connect', onConnect);
    }
    return () => {
      cancelled = true;
      clearTimeout(t);
      if (off) off();
    };
  }, [user, loading, socket]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/driver/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'customer') return <Navigate to="/customer" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex">
      <SEO noindex title="Driver Dashboard" />
      <AnimatePresence>
        {sidebarOpen && (
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 shrink-0 border-r border-white/10 bg-[#070c0a]/90 backdrop-blur-xl transition-[width,translate] duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarExpanded ? "" : "lg:w-20"}`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-green-400/50 to-transparent" />
        <div className="flex h-full flex-col">
          <div className={`flex h-16 shrink-0 items-center border-b border-white/5 ${sidebarExpanded ? "gap-2 px-5" : "px-4 lg:justify-center lg:px-2"}`}>
            {sidebarExpanded ? (
              <div className="min-w-0">
                <h1 className="truncate text-lg font-bold text-white">
                  Gen<span className="text-green-400">Z</span>Rides
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Driver</p>
              </div>
            ) : (
              <>
                <div className="min-w-0 lg:hidden">
                  <h1 className="truncate text-lg font-bold text-white">
                    Gen<span className="text-green-400">Z</span>Rides
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Driver</p>
                </div>
                <img src="/logo5.png" alt="GenZRides logo" title="GenZRides" className="hidden h-10 w-10 shrink-0 rounded-xl object-cover ring-1 ring-green-500/40 shadow-[0_0_24px_rgba(34,197,94,0.35)] lg:block" />
              </>
            )}
          </div>

          <nav className={`flex-1 space-y-1 overflow-y-auto ${sidebarExpanded ? "p-3" : "p-3 lg:p-2"}`}>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                title={sidebarExpanded ? undefined : item.label}
                className={({ isActive }) =>
                  `group flex items-center rounded-xl text-sm font-medium transition-all duration-200 ${
                    sidebarExpanded
                      ? "gap-3 px-3.5 py-2.5"
                      : "gap-3 px-3.5 py-2.5 lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
                  } ${
                    isActive
                      ? "border border-green-500/30 bg-green-500/10 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.18)]"
                      : "border border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={20} className="shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span className={`truncate ${sidebarExpanded ? "" : "lg:hidden"}`}>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className={`shrink-0 border-t border-white/5 ${sidebarExpanded ? "p-3" : "p-3 lg:p-2"}`}>
            <button
              onClick={handleLogout}
              title={sidebarExpanded ? undefined : "Sign Out"}
              className={`flex w-full items-center rounded-xl text-sm font-medium text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300 ${
                sidebarExpanded ? "gap-3 px-3.5 py-2.5" : "gap-3 px-3.5 py-2.5 lg:mx-auto lg:h-11 lg:w-11 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
              }`}
            >
              <LogOut size={20} className="shrink-0" />
              <span className={sidebarExpanded ? "" : "lg:hidden"}>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full max-w-full">
        <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 min-w-0">
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              <button
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="lg:hidden p-2 hover:bg-white/10 text-gray-300 rounded-lg"
              >
                <Menu size={22} />
              </button>
              <button
                onClick={() => setSidebarExpanded((v) => !v)}
                title={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                aria-label={sidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                aria-expanded={sidebarExpanded}
                className="hidden lg:inline-flex p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 transition hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-300 hover:shadow-[0_0_18px_rgba(34,197,94,0.25)]"
              >
                {sidebarExpanded ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
              </button>
              <h2 className="ml-1 truncate text-base sm:text-lg font-semibold text-green-400">
                Driver Dashboard
              </h2>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition"
              >
                <div className="w-9 h-9 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <span className="font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 border border-green-700 backdrop-blur-xl  rounded-xl shadow-2xl py-2"
                  >
                    <NavLink
                      to="/driver/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                    >
                      <User size={16} /> Profile
                    </NavLink>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 w-full"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 min-w-0 w-full max-w-full overflow-x-clip p-4 sm:p-6">
          <PushListener />
          <AutoPushSync />
          <DriverLocationSharer />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DriverLayout;
