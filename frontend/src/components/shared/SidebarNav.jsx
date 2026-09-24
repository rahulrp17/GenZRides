import React, { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

/* ===========================================================
   Shared dashboard sidebar nav (Admin / Driver / Customer).
   Compact sizing, premium hover tooltips on collapsed icons,
   collapsible dropdown groups with a flyout submenu when the
   sidebar is collapsed, and live count badges from real data.

   items: [{
     path?, label, icon?, end?, countKey?,
     children?: [{ path, label, countKey? }],
   }]
   badgeCounts: { [countKey]: number } — resolved live by each layout.
========================================================== */

const tipCls =
  "pointer-events-none absolute left-full top-1/2 z-50 ml-2 hidden -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 group-hover:block";

export const NavCountBadge = ({ count, collapsed }) => {
  const n = Number(count || 0);
  if (!n) return null;
  if (collapsed) {
    return (
      <span
        aria-label={`${n} new`}
        className="hidden lg:block absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
      />
    );
  }
  return (
    <span className="ml-auto min-w-[20px] h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[11px] font-bold tabular-nums shrink-0">
      {n > 99 ? "99+" : n}
    </span>
  );
};

const rowCls = ({ isActive }, compact) =>
  `group relative flex items-center rounded-xl font-medium transition-all duration-200 gap-2.5 px-3 py-2 text-[13px] ${
    compact ? "lg:mx-auto lg:h-10 lg:w-10 lg:justify-center lg:gap-0 lg:px-0 lg:py-0" : ""
  } ${
    isActive
      ? "border border-green-500/30 bg-green-500/10 text-green-300 shadow-[0_0_20px_rgba(34,197,94,0.18)] before:absolute before:left-0 before:top-1/2 before:h-5 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-green-400 before:shadow-[0_0_10px_rgba(34,197,94,0.8)]"
      : "border border-transparent text-gray-400 hover:border-white/10 hover:bg-white/5 hover:text-white"
  }`;

// Best-match wins: an exact path beats a prefix. Without this,
// "/admin/instant-bookings/requests" would also highlight the
// "/admin/instant-bookings" sibling (prefix match), while detail pages
// like "/admin/bookings/:id" still highlight their parent entry.
const activeChildPath = (pathname, kids) => {
  const exact = kids.find((c) => pathname === c.path);
  if (exact) return exact.path;
  return kids.find((c) => pathname.startsWith(`${c.path}/`))?.path || null;
};

const NavItem = ({ item, compact, badgeCounts, onNavigate }) => (
  <Motion.div whileHover={{ x: compact ? 0 : 2 }} whileTap={{ scale: 0.99 }}>
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      aria-label={item.label}
      className={(state) => rowCls(state, compact)}
    >
      <item.icon
        size={18}
        className="shrink-0 transition-transform duration-200 group-hover:scale-110"
      />
      <span className={`truncate ${compact ? "lg:hidden" : ""}`}>{item.label}</span>
      {item.countKey && (
        <NavCountBadge count={badgeCounts[item.countKey]} collapsed={compact} />
      )}
      {compact && <span className={tipCls}>{item.label}</span>}
    </NavLink>
  </Motion.div>
);

const NavDropdown = ({ item, compact, badgeCounts, onNavigate }) => {
  const location = useLocation();
  const kids = item.children || [];
  const activePath = activeChildPath(location.pathname, kids);
  const active = activePath !== null;
  const isActiveChild = (c) => c.path === activePath;
  const childTotal = kids.reduce(
    (s, c) => s + Number(badgeCounts[c.countKey] || 0),
    0
  );
  const [open, setOpen] = useState(active);
  const rootRef = useRef(null);

  useEffect(() => {
    if (active && !compact) setOpen(true);
  }, [active, compact]);

  // Close the flyout on route change, outside tap/click, or Escape —
  // hover (group-hover) reopens it for mouse users.
  useEffect(() => {
    if (!compact) return;
    setOpen(false);
  }, [location.pathname, compact]);

  useEffect(() => {
    if (!compact || !open) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [compact, open]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  if (compact) {
    return (
      <div className="relative group" ref={rootRef}>
        <Motion.div whileTap={{ scale: 0.96 }}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={`${item.label} submenu`}
            className={`w-full ${rowCls({ isActive: active }, true)}`}
          >
            <item.icon
              size={18}
              className="shrink-0 transition-transform duration-200 group-hover:scale-110"
            />
            <span className={tipCls}>{item.label}</span>
            {childTotal > 0 && (
              <span
                aria-label={`${childTotal} new`}
                className="hidden lg:block absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)]"
              />
            )}
          </button>
        </Motion.div>
        {/* Flyout submenu: hover (mouse) or tap (touch, via open state). */}
        <div
          className={`absolute left-full top-0 z-50  w-56 rounded-2xl border border-white/10 bg-[#0a0f0d]/95 p-1.5 shadow-2xl backdrop-blur-xl ${
            open ? "block" : "hidden"
          } group-hover:block`}
        >
          <p className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            {item.label}
          </p>
          {kids.map((c) => (
            <NavLink
              key={c.path}
              to={c.path}
              onClick={close}
              className={() =>
                `relative flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${
                  isActiveChild(c)
                    ? "bg-green-500/10 text-green-300 border border-green-500/30 before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-green-400 before:shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                    : "border border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 shrink-0" />
              <span className="truncate flex-1">{c.label}</span>
              {c.countKey && <NavCountBadge count={badgeCounts[c.countKey]} />}
            </NavLink>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Motion.div whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={`w-full ${rowCls({ isActive: active }, false)}`}
        >
          <item.icon
            size={18}
            className="shrink-0 transition-transform duration-200 group-hover:scale-110"
          />
          <span className="truncate flex-1 text-left">{item.label}</span>
          {childTotal > 0 && !open && (
            <NavCountBadge count={childTotal} />
          )}
          <ChevronDown
            size={15}
            className={`shrink-0 text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </button>
      </Motion.div>
      {open && (
        <div className="mt-1 ml-5 space-y-0.5 border-l border-white/10 pl-2">
          {kids.map((c) => (
            <Motion.div key={c.path} whileHover={{ x: 2 }} whileTap={{ scale: 0.99 }}>
              <NavLink
                to={c.path}
                onClick={onNavigate}
                className={() =>
                  `relative flex items-center gap-2 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${
                    isActiveChild(c)
                      ? "bg-green-500/10 text-green-300 border border-green-500/30 before:absolute before:left-0 before:top-1/2 before:h-4 before:w-[3px] before:-translate-y-1/2 before:rounded-full before:bg-green-400 before:shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                      : "border border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                  }`
                }
              >
                <span className="truncate flex-1">{c.label}</span>
                {c.countKey && <NavCountBadge count={badgeCounts[c.countKey]} />}
              </NavLink>
            </Motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

const SidebarNav = ({ items, expanded, badgeCounts = {}, onNavigate }) => {
  const compact = !expanded;
  return (
    <nav
      className={`flex-1 space-y-1 min-w-0 ${
        compact ? "overflow-visible p-2" : "overflow-y-auto p-2.5"
      }`}
    >
      {items.map((item, i) =>
        item.children ? (
          <NavDropdown
            key={item.label || i}
            item={item}
            compact={compact}
            badgeCounts={badgeCounts}
            onNavigate={onNavigate}
          />
        ) : (
          <NavItem
            key={item.path || item.label || i}
            item={item}
            compact={compact}
            badgeCounts={badgeCounts}
            onNavigate={onNavigate}
          />
        )
      )}
    </nav>
  );
};

export default SidebarNav;
