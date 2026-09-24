import React, { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import {  Home,  Users,  Car,  Calendar,  Wallet,  Star,  Bell,  LogOut,  Menu,  ChevronDown,  Settings,  LayoutPanelLeft,  User,  PanelLeftClose,  PanelLeftOpen,} from "lucide-react";
import useAuth from "../hooks/useAuth";
import SEO from "../components/SEO";
import PushListener from "../components/PushListener";
import AutoPushSync from "../components/AutoPushSync";
import SidebarNav from "../components/shared/SidebarNav";
import { useAdminCounts, useIncompleteVisitorCount } from "../Pages/admin/bookingUtils";
import { motion as Motion } from "framer-motion";

const navItems = [
  { path: "/", label: "Home", icon: Home, end: true },
  { path: "/admin", label: "Dashboard", icon: LayoutPanelLeft, end: true },
  {
    label: "Bookings",
    icon: Calendar,
    children: [
      { path: "/admin/bookings", label: "Customer Bookings" },
      { path: "/admin/booking-requests", label: "Customer Requests", countKey: "pendingCustomerRequests" },
      { path: "/admin/instant-bookings", label: "Instant Customer" },
      { path: "/admin/instant-bookings/requests", label: "Instant Requests", countKey: "pendingInstantRequests" },
    ],
  },
  { path: "/admin/visitors", label: "Visitors", icon: Users, countKey: "incompleteVisitors" },
  { path: "/admin/customers", label: "Customers", icon: Users },
  { path: "/admin/drivers", label: "Drivers", icon: Car },
  { path: "/admin/vehicles", label: "Vehicles", icon: Settings },
  { path: "/admin/withdrawals", label: "Withdrawals", icon: Wallet },
  { path: "/admin/reviews", label: "Reviews", icon: Star },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
  { path: "/admin/profile", label: "Profile", icon: User },
];

const AdminLayout = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // Live badge counts (real backend data, socket-invalidated).
  const { data: queueCounts } = useAdminCounts();
  const { data: incompleteVisitors } = useIncompleteVisitorCount();
  const badgeCounts = {
    ...(queueCounts || {}),
    incompleteVisitors: incompleteVisitors || 0,
  };
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
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-60 shrink-0 border-r border-white/10 bg-[#070c0a]/90 backdrop-blur-xl transition-[width,translate] duration-300 ease-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${sidebarExpanded ? "" : "lg:w-16"}`}
      >
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-green-400/50 to-transparent" />
        <div className="flex h-full flex-col">
          <div className={`flex h-14 shrink-0 items-center border-b border-white/5 ${sidebarExpanded ? "gap-2 px-4" : "px-3 lg:justify-center lg:px-2"}`}>
            {sidebarExpanded ? (
              <div className="min-w-0">
                <h1 className="truncate text-base font-bold text-white">
                  Gen<span className="text-green-400">Z</span>Rides
                </h1>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Admin</p>
              </div>
            ) : (
              <>
                <div className="min-w-0 lg:hidden">
                  <h1 className="truncate text-base font-bold text-white">
                    Gen<span className="text-green-400">Z</span>Rides
                  </h1>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-gray-500">Admin</p>
                </div>
                <img src="/logo5.png" alt="GenZRides logo" title="GenZRides" className="hidden h-9 w-9 shrink-0 rounded-xl object-cover ring-1 ring-green-500/40 shadow-[0_0_24px_rgba(34,197,94,0.35)] lg:block" />
              </>
            )}
          </div>

          <SidebarNav
            items={navItems}
            expanded={sidebarExpanded || sidebarOpen}
            badgeCounts={badgeCounts}
            onNavigate={() => setSidebarOpen(false)}
          />

          <div className={`shrink-0 border-t border-white/5 ${sidebarExpanded ? "p-2.5" : "p-2.5 lg:p-2"}`}>
            <button
              onClick={handleLogout}
              title={sidebarExpanded ? undefined : "Sign Out"}
              className={`group relative flex w-full items-center rounded-xl text-[13px] font-medium text-red-400/90 transition hover:bg-red-500/10 hover:text-red-300 ${
                sidebarExpanded ? "gap-2.5 px-3 py-2" : "gap-2.5 px-3 py-2 lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:gap-0 lg:px-0 lg:py-0"
              }`}
            >
              <LogOut size={18} className="shrink-0" />
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
                Admin Dashboard
              </h2>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 hover:bg-white/5 rounded-xl transition"
              >
                <div className="w-9 h-9 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center overflow-hidden shrink-0">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
                  ) : (
                    <span className="font-semibold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || "A"}
                    </span>
                  )}
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

        <main className="@container flex-1 min-w-0 w-full max-w-full overflow-x-clip p-4 sm:p-6">
          <PushListener />
          <AutoPushSync />
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
