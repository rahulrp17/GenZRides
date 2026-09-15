import React, { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion as Motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  LayoutDashboard,
  Bell,
  User,
  ChevronDown,
  MapPin,
  Plane,
} from "lucide-react";
import { GenZRides } from "../../assets/images";
import useAuth from "../../hooks/useAuth";
import { useSocket } from "../../Context/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { notificationAPI } from "../../services/endpoints";

const DASHBOARD_ROUTES = {
  customer: "/customer",
  driver: "/driver",
  admin: "/admin",
};

const PROFILE_ROUTES = {
  customer: "/customer/profile",
  driver: "/driver/profile",
  admin: "/admin",
};

const NOTIF_ROUTES = {
  customer: "/customer/notifications",
  driver: "/driver/notifications",
  admin: "/admin/notifications",
};

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [transportOpen, setTransportOpen] = useState(false);
  const [mobileTransportOpen, setMobileTransportOpen] = useState(false);
  const profileRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const transportRef = useRef(null);
  const menuButtonRef = useRef(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handle = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [profileOpen]);

  // Close mobile menu on outside click (exclude toggle button)
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [isOpen]);

  // Close transport dropdown on outside click
  useEffect(() => {
    if (!transportOpen) return;
    const handle = (e) => {
      if (transportRef.current && !transportRef.current.contains(e.target))
        setTransportOpen(false);
    };
    document.addEventListener("mousedown", handle);
    document.addEventListener("touchstart", handle, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("touchstart", handle);
    };
  }, [transportOpen]);

  // Close all on Escape
  useEffect(() => {
    const handle = (e) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setIsOpen(false);
        setTransportOpen(false);
        setMobileTransportOpen(false);
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, []);

  const menuItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/tariff", label: "Tariff" },
    { path: "/services", label: "Our Services" },
    { path: "/vehicles", label: "Vehicle" },
    { path: "/contact", label: "Contact" },
  ];

  const transportItems = [
    {
      path: "/popular-routes",
      label: "Popular Routes",
      icon: MapPin,
      desc: "Trending intercity routes",
    },
    {
      path: "/airport-transfers",
      label: "Airport Transfers",
      icon: Plane,
      desc: "Chennai • Bangalore • Trichy",
    },
  ];

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setProfileOpen(false);
    navigate("/");
  };

  const dashboardPath = user
    ? DASHBOARD_ROUTES[user.role] || "/customer"
    : null;
  const profilePath = user
    ? PROFILE_ROUTES[user.role] || "/customer/profile"
    : null;
  const notifPath = user
    ? NOTIF_ROUTES[user.role] || "/customer/notifications"
    : null;

  const { data: notifData } = useQuery({
    queryKey: ["unreadCount"],
    queryFn: async () => {
      const { data } = await notificationAPI.getUnreadCount();
      return data;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Realtime bell badge: drop the count the moment a notification lands
  // (server read-state persists across refresh via the same query).
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  React.useEffect(() => {
    if (!socket || !user) return;
    const handleIncoming = () => {
      queryClient.invalidateQueries({ queryKey: ["unreadCount"] });
    };
    socket.on("notification", handleIncoming);
    return () => {
      socket.off("notification", handleIncoming);
    };
  }, [socket, user, queryClient]);
  const unreadCount = notifData?.unread || 0;

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <Motion.nav
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7 }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.45)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 lg:gap-4">
          {/* LEFT — Logo */}
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-3 cursor-pointer justify-start min-w-0"
          >
            <img
              src={GenZRides}
              alt="logo"
              className="w-30 h-11 rounded-[10px] object-fill ring-1 ring-green-500/40 shrink-0"
            />
            {/* <div className="leading-tight  xs:block sm:block">
              <p className="font-display text-base sm:text-lg font-bold text-white tracking-tight whitespace-nowrap">
                GenZRides
              </p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-green-400  sm:block">
                Premium Rides
              </p>
            </div> */}
          </div>

          {/* CENTER — Links (desktop) */}
          <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 font-medium text-[13px] xl:text-[14px] whitespace-nowrap flex-1 mx-2 xl:mx-4">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative transition-all duration-300 ${
                    isActive
                      ? "text-green-400"
                      : "text-gray-300 hover:text-green-400"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && (
                      <Motion.div
                        layoutId="activeNav"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
            {/* Transport — premium dropdown */}
            <div className="relative" ref={transportRef}>
              <button
                onClick={() => setTransportOpen((v) => !v)}
                className={`relative flex items-center cursor-pointer gap-1.5 transition-all duration-300 ${transportOpen || transportItems.some((t) => window.location.pathname.startsWith(t.path)) ? "text-green-400" : "text-gray-300 hover:text-green-400"}`}
              >
                Transport{" "}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${transportOpen ? "rotate-180" : ""}`}
                />
                {(transportOpen ||
                  transportItems.some((t) =>
                    window.location.pathname.startsWith(t.path),
                  )) && (
                  <Motion.div
                    layoutId="activeNav"
                    className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_12px_rgba(34,197,94,0.8)]"
                  />
                )}
              </button>
              <AnimatePresence>
                {transportOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }}
                    transition={{ duration: 0.18 }}
                    className="absolute left-1/2  -translate-x-1/2 top-full mt-3 w-72 bg-[#0a0f0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2"
                  >
                    {transportItems.map((t) => (
                      <button
                        key={t.path}
                        onClick={() => {
                          setTransportOpen(false);
                          navigate(t.path);
                        }}
                        className="flex items-center cursor-pointer gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/10 text-left transition group"
                      >
                        <span className="w-9 h-9 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center group-hover:bg-green-500/20 transition">
                          <t.icon size={16} className="text-green-400" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {t.label}
                          </p>
                          <p className="text-xs text-gray-400">{t.desc}</p>
                        </div>
                      </button>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT — Actions (desktop) */}
          <div className="hidden lg:flex items-center justify-end gap-2 xl:gap-2.5 shrink-0">
            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/booking")}
              className="flex items-center cursor-pointer  gap-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-full font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all whitespace-nowrap"
            >
              Book <ArrowRight size={16} />
            </Motion.button>

            {user ? (
              <>
                {user.role === "customer" && (
                  <Motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate("/driver/continue")}
                    className="hidden xl:flex cursor-pointer items-center gap-1.5 text-sm border border-green-500/50 text-green-400 hover:bg-green-500/10 px-4 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap"
                  >
                    Drive With Us
                  </Motion.button>
                )}

                <button
                  onClick={() => navigate(notifPath)}
                  className="relative p-2.5 rounded-full text-gray-300 cursor-pointer hover:text-white hover:bg-white/10 transition-all"
                  aria-label="Notifications"
                >
                  <Bell size={19} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shadow-[0_0_12px_rgba(34,197,94,0.7)]">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>

                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen((v) => !v)}
                    className="flex items-center cursor-pointer gap-1.5 p-1 pr-1.5 rounded-full hover:bg-white/10 transition-all"
                    aria-label="Profile menu"
                  >
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-green-500/40"
                      />
                    ) : (
                      <span className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white text-sm font-bold flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
                        {avatarLetter}
                      </span>
                    )}
                    <ChevronDown size={15} className="text-gray-400" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <Motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 top-full mt-2 w-52 bg-[#0a0f0d]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-sm font-semibold text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-green-400 capitalize">
                            {user?.role}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(profilePath);
                          }}
                          className="flex cursor-pointer items-center gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white w-full transition"
                        >
                          <User size={16} /> My Profile
                        </button>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            navigate(dashboardPath);
                          }}
                          className="flex items-center cursor-pointer gap-2.5 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white w-full transition"
                        >
                          <LayoutDashboard size={16} /> Dashboard
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 w-full transition"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/driver/continue")}
                  className="hidden xl:flex items-center gap-1.5 text-sm border border-green-500/50 text-green-400 hover:bg-green-500/10 px-4 py-2.5 rounded-full font-semibold transition-all whitespace-nowrap"
                >
                  Drive With Us
                </Motion.button>

                <Motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/signup")}
                  className="flex items-center gap-1.5 text-sm bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 xl:px-5 py-2 xl:py-2.5 rounded-full font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all whitespace-nowrap shrink-0"
                >
                  Sign Up
                  <ArrowRight size={16} />
                </Motion.button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex lg:hidden items-center gap-1.5 ml-auto">
            {user && (
              <button
                onClick={() => navigate(notifPath)}
                className="relative p-2 rounded-full text-gray-300 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-4 h-4 px-0.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
            )}
            <button
              ref={menuButtonRef}
              onClick={() => setIsOpen((v) => !v)}
              className="p-2 text-gray-200 hover:text-white transition cursor-pointer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
              ref={mobileMenuRef}
              className="lg:hidden mx-4 mb-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] shadow-2xl p-6 max-h-[70vh] overflow-y-auto"
            >
              <div className="flex flex-col gap-1">
                {user && (
                  <div className="flex items-center gap-3 pb-4 mb-2 border-b border-white/10">
                    {user?.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt=""
                        className="w-11 h-11 rounded-full object-cover ring-1 ring-green-500/40"
                      />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white font-bold flex items-center justify-center text-lg">
                        {avatarLetter}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-green-400 capitalize">
                        {user?.role}
                      </p>
                    </div>
                  </div>
                )}

                {menuItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `text-base py-2 ${
                        isActive ? "text-green-400 font-bold" : "text-gray-300"
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}

                <button
                  onClick={() => setMobileTransportOpen((v) => !v)}
                  className="flex items-center justify-between w-full text-base py-2 text-gray-300"
                >
                  <span>Transport</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${mobileTransportOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {mobileTransportOpen && (
                    <Motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-2 pl-4 border-l border-white/10 space-y-1 overflow-hidden"
                    >
                      {transportItems.map((t) => (
                        <button
                          key={t.path}
                          onClick={() => {
                            setIsOpen(false);
                            setMobileTransportOpen(false);
                            navigate(t.path);
                          }}
                          className="flex items-center gap-3 w-full py-2.5 text-left"
                        >
                          <span className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                            <t.icon size={14} className="text-green-400" />
                          </span>
                          <span className="text-sm text-gray-300">
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={() => {
                    navigate("/booking");
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full py-3 mt-3 font-semibold"
                >
                  Book a Ride <ArrowRight size={18} />
                </button>

                {user ? (
                  <>
                    <button
                      onClick={() => {
                        navigate(profilePath);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white rounded-full py-3 mt-2 font-semibold"
                    >
                      <User size={18} /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate(dashboardPath);
                        setIsOpen(false);
                      }}
                      className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-white rounded-full py-3 mt-2 font-semibold"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </button>
                    {user.role === "customer" && (
                      <button
                        onClick={() => {
                          navigate("/driver/continue");
                          setIsOpen(false);
                        }}
                        className="border border-green-500/50 text-green-400 rounded-full py-3 mt-2 font-semibold"
                      >
                        Drive With Us
                      </button>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 border border-white/10 text-red-400 rounded-full py-3 mt-2 transition-all"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate("/driver/continue");
                        setIsOpen(false);
                      }}
                      className="border border-green-500/50 text-green-400 rounded-full py-3 mt-2 font-semibold"
                    >
                      Drive With Us
                    </button>
                    <button
                      onClick={() => {
                        navigate("/signup");
                        setIsOpen(false);
                      }}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full py-3 mt-2 font-semibold"
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </Motion.nav>
  );
};

export default Navbar;
