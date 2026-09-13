import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {  Home,  Users,  Car,  Calendar,  Wallet,  Star,  Bell,  LogOut,  Menu,  ChevronDown,  Settings,  LayoutPanelLeft,  User,} from "lucide-react";
import useAuth from "../hooks/useAuth";
import SEO from "../components/SEO";
import PushListener from "../components/PushListener";
import AutoPushSync from "../components/AutoPushSync";
import { motion as Motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Home", icon: Home, end: true },
  { path: "/admin", label: "Dashboard", icon: LayoutPanelLeft, end: true },
  { path: "/admin/customers", label: "Customers", icon: Users },
  { path: "/admin/drivers", label: "Drivers", icon: Car },
  { path: "/admin/vehicles", label: "Vehicles", icon: Settings },
  { path: "/admin/bookings", label: "Bookings", icon: Calendar },
  { path: "/admin/booking-requests", label: "Booking Requests", icon: Bell },
  { path: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { path: "/admin/reviews", label: "Reviews", icon: Star },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/profile", label: "Profile", icon: User },
];

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  useEffect(() => {
    if (!dropdownOpen) return;
    const onOutside = (e) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false); };
    const onEsc = (e) => { if (e.key === 'Escape') setDropdownOpen(false); };
    document.addEventListener('mousedown', onOutside);
    document.addEventListener('touchstart', onOutside, { passive: true });
    document.addEventListener('keydown', onEsc);
    return () => { document.removeEventListener('mousedown', onOutside); document.removeEventListener('touchstart', onOutside); document.removeEventListener('keydown', onEsc); };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-white/10 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "driver") return <Navigate to="/driver" replace />;
  if (user.role === "customer") return <Navigate to="/customer" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900 flex">
      <SEO noindex title="Admin Dashboard" />
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
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-white/5 backdrop-blur-lg border-r border-white/10 z-50 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-white/5">
           <h1 className="text-xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">
              GenZRides
            </h1>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-green-500/10 text-green-400 border border-green-500/20"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 w-full transition"
            >
              <LogOut size={20} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen min-w-0 w-full max-w-full">
        <header className="sticky top-0 z-30 bg-black/50 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/10 text-gray-300 rounded-lg"
            >
              <Menu size={22} />
            </button>

            <div className="flex-1 max-w-md mx-1">
              <h2 className="text-lg font-semibold text-green-400 hidden sm:block">
                Admin Dashboard
              </h2>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition"
              >
                <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center">
                  <span className="font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-white">
                    {user?.name || "Admin"}
                  </p>
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
                    className="absolute right-0 top-full mt-2 w-48 bg-gray-900 backdrop-blur-xl border border-green-700 rounded-xl shadow-2xl py-2"
                  >
                    <NavLink
                      to="/admin/profile"
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
