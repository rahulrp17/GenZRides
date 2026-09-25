import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import {
  ShieldAlert,
  ArrowLeft,
  Home,
  LayoutDashboard,
  LogIn,
  Fingerprint,
  LockKeyhole,
  LifeBuoy,
  ChevronRight,
} from "lucide-react";
import Navbar from "../Component/Navbar/Navbar";
import Footer from "../Component/Footer/Footer";
import SEO from "../components/SEO";
import useAuth from "../hooks/useAuth";

const ROLE_HOME = {
  admin: "/admin",
  driver: "/driver",
  customer: "/customer",
};

const ROLE_LABEL = {
  admin: "Admins",
  driver: "Drivers",
  customer: "Customers",
};

const ROLE_BADGE = {
  admin: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  driver: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  customer: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * 401 — premium role-aware "access denied" page.
 * Guests are sent to login by the layouts; this page covers
 * authenticated role mismatches (and direct visits, which get
 * generic copy + a login CTA). Logic is preserved — only styling
 * was elevated to match the glass + emerald brand system.
 */
const Unauthorized = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const requiredRole = location.state?.requiredRole || null;
  const from = location.state?.from || null;
  const home = ROLE_HOME[user?.role] || "/";
  const signedIn = Boolean(user);

  return (
    <main className="bg-[#020617] text-white overflow-x-clip min-h-screen flex flex-col">
      <SEO
        noindex
        title="Unauthorized — 401"
        description="You don't have permission to view this page. Head back to your dashboard or sign in with an authorized account."
        path="/unauthorized"
      />
      <Navbar />

      <section className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-14 md:py-20">
        {/* ── ambient backdrop ─────────────────────────────── */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.5]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              maskImage: "radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 75% 65% at 50% 40%, black 30%, transparent 75%)",
            }}
          />
          <div className="landing-drift absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] bg-red-500/[0.13] blur-[140px] rounded-full" />
          <div className="landing-drift-slow absolute bottom-[-8rem] left-[8%] w-[26rem] h-[26rem] bg-emerald-500/[0.09] blur-[140px] rounded-full" />
          <div className="absolute top-1/3 right-[4%] w-72 h-72 bg-violet-600/[0.08] blur-[120px] rounded-full" />
        </div>

        <Motion.div
          initial="hidden"
          animate="show"
          className="relative w-full max-w-3xl"
        >
          {/* ── premium card ─────────────────────────────── */}
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04] backdrop-blur-2xl shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
            {/* top hairline + corner glow */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-red-400/70 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[30rem] h-64 bg-red-500/10 blur-[100px] rounded-full" />

            {/* header strip */}
            <Motion.div
              variants={fadeUp}
              custom={0}
              className="relative flex flex-wrap items-center gap-2.5 px-6 sm:px-9 pt-6 sm:pt-7"
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-red-300">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-red-400" />
                </span>
                Error 401
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                <LockKeyhole size={12} className="text-gray-500" />
                Restricted zone
              </span>
              {requiredRole && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] ${ROLE_BADGE[requiredRole] || "bg-white/5 text-gray-300 border-white/15"}`}
                >
                  <Fingerprint size={12} />
                  {ROLE_LABEL[requiredRole] || requiredRole} only
                </span>
              )}
            </Motion.div>

            <div className="relative grid gap-8 sm:gap-10 px-6 sm:px-9 py-8 sm:py-10 md:grid-cols-[auto_1fr] md:items-center">
              {/* ── emblem ─────────────────────────────── */}
              <Motion.div variants={fadeUp} custom={1} className="flex md:block justify-center">
                <div className="relative w-40 h-40 sm:w-48 sm:h-48 shrink-0">
                  {/* rotating conic ring */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full animate-spin"
                    style={{
                      animationDuration: "14s",
                      background:
                        "conic-gradient(from 0deg, rgba(248,113,113,0.55), transparent 28%, transparent 55%, rgba(52,211,153,0.5) 78%, rgba(248,113,113,0.55))",
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))",
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 2px))",
                    }}
                  />
                  <div aria-hidden className="absolute inset-3 rounded-full border border-white/10" />
                  <div aria-hidden className="absolute inset-6 rounded-full border border-white/[0.07]" />
                  {/* core */}
                  <div className="absolute inset-9 sm:inset-10 rounded-[28px] bg-gradient-to-br from-red-500/25 via-[#1a0b0e] to-emerald-500/15 border border-red-500/30 shadow-[0_0_50px_rgba(248,113,113,0.25),inset_0_1px_0_rgba(255,255,255,0.12)] flex items-center justify-center backdrop-blur-xl">
                    <ShieldAlert size={40} className="text-red-300 drop-shadow-[0_0_14px_rgba(248,113,113,0.6)]" />
                  </div>
                  {/* floating 401 chip */}
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full border border-white/15 bg-black/80 backdrop-blur px-4 py-1 font-display text-sm font-bold tracking-[0.3em] text-white shadow-xl">
                    401
                  </div>
                </div>
              </Motion.div>

              {/* ── copy ─────────────────────────────── */}
              <div className="text-center md:text-left">
                <Motion.p
                  variants={fadeUp}
                  custom={2}
                  className="font-editorial italic text-emerald-300/90 text-sm sm:text-base"
                >
                  Hold on — this area is off-limits for this account.
                </Motion.p>
                <Motion.h1
                  variants={fadeUp}
                  custom={3}
                  className="font-display text-3xl sm:text-[2.6rem] font-bold leading-[1.05] tracking-tight mt-2"
                >
                  Access{" "}
                  <span className="bg-gradient-to-r from-red-300 via-rose-400 to-amber-300 bg-clip-text text-transparent">
                    denied.
                  </span>
                </Motion.h1>
                <Motion.p
                  variants={fadeUp}
                  custom={4}
                  className="text-sm sm:text-[15px] text-gray-400 mt-3 leading-relaxed max-w-md mx-auto md:mx-0"
                >
                  {signedIn ? (
                    <>
                      You&apos;re signed in as{" "}
                      <span className="text-white font-semibold">{user.name || user.role}</span>
                      {requiredRole ? (
                        <>
                          {" "}— but this zone needs{" "}
                          <span className="text-white font-semibold">
                            {ROLE_LABEL[requiredRole] || requiredRole}-level
                          </span>{" "}
                          clearance.
                        </>
                      ) : (
                        <> — this account doesn&apos;t have clearance for this zone.</>
                      )}
                    </>
                  ) : (
                    <>This is a members-only zone. Sign in with an authorized account to continue.</>
                  )}
                </Motion.p>

                {/* context tiles */}
                <Motion.div
                  variants={fadeUp}
                  custom={5}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-6 text-left"
                >
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-white mt-1 truncate">
                      {signedIn ? (
                        <>
                          {user.name || "Account"}{" "}
                          <span className="text-gray-500 font-normal">· {user.role}</span>
                        </>
                      ) : (
                        "Guest"
                      )}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Needs access</p>
                    <p className="text-sm font-semibold text-white mt-1">
                      {requiredRole ? ROLE_LABEL[requiredRole] || requiredRole : "Authorized role"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Blocked route</p>
                    <p className="text-xs font-mono text-gray-400 mt-1.5 truncate" title={from || "/"}>
                      {from || "/"}
                    </p>
                  </div>
                </Motion.div>
              </div>
            </div>

            {/* ── actions ─────────────────────────────── */}
            <Motion.div
              variants={fadeUp}
              custom={6}
              className="relative border-t border-white/[0.07] bg-black/30 px-6 sm:px-9 py-5 sm:py-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {signedIn ? (
                  <Link
                    to={home}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-bold text-white shadow-[0_8px_30px_rgba(34,197,94,0.35)] hover:shadow-[0_0_32px_rgba(34,197,94,0.55)] hover:-translate-y-px active:translate-y-0 transition-all"
                  >
                    <LayoutDashboard size={16} /> Take me to my dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    state={from ? { from } : undefined}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-sm font-bold text-white shadow-[0_8px_30px_rgba(34,197,94,0.35)] hover:shadow-[0_0_32px_rgba(34,197,94,0.55)] hover:-translate-y-px active:translate-y-0 transition-all"
                  >
                    <LogIn size={16} /> Sign in to continue
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-2xl bg-white/[0.06] border border-white/15 text-sm font-semibold text-white hover:bg-white/10 hover:border-white/25 transition-all"
                >
                  <ArrowLeft size={16} /> Go back
                </button>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 min-h-[46px] rounded-2xl text-sm font-semibold text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                >
                  <Home size={16} /> Home
                </Link>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldAlert size={13} className="text-emerald-400/70" />
                  Protected by GenZRides role-based access
                </span>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-1 font-semibold text-gray-400 hover:text-emerald-300 transition-colors"
                >
                  <LifeBuoy size={13} /> Need clearance? Contact support
                  <ChevronRight size={13} />
                </Link>
              </div>
            </Motion.div>
          </div>

          {/* under-card hint */}
          <Motion.p
            variants={fadeUp}
            custom={7}
            className="text-center text-[11px] uppercase tracking-[0.28em] text-gray-600 mt-6"
          >
            401 · Unauthorized · {requiredRole ? `${requiredRole} zone` : "Restricted zone"}
          </Motion.p>
        </Motion.div>
      </section>

      <Footer />
    </main>
  );
};

export default Unauthorized;
