import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import SEO from "../../components/SEO";
import AuthSplit from "../../Component/Auth/AuthSplit";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Loader2, Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight } from "lucide-react";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
  }, [location.state]);

  const handleVerify = async () => {
    if (!email || !otp) return toast.error("Enter email and OTP");
    if (!/^\d{6}$/.test(otp)) return toast.error("OTP must be 6 digits");
    setVerifying(true);
    try {
      const { data } = await authAPI.verifyOtp({ email: email.trim().toLowerCase(), otp: otp.trim() });
      toast.success(data.message || "OTP verified");
      setVerified(true);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Invalid or expired OTP";
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !otp.trim() || !newPassword) return toast.error("All fields are required");
    if (!/^\d{6}$/.test(otp.trim())) return toast.error("OTP must be 6 digits");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return toast.error("Password must contain uppercase, lowercase and number");
    }
    if (newPassword !== confirm) return toast.error("Passwords do not match");
    // If not yet verified, verify first (optional but helps UX)
    if (!verified) {
      try {
        await authAPI.verifyOtp({ email: email.trim().toLowerCase(), otp: otp.trim() });
      } catch (err) {
        const msg = err.response?.data?.message || "Invalid or expired OTP";
        return toast.error(msg);
      }
    }
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ email: email.trim().toLowerCase(), otp: otp.trim(), newPassword });
      toast.success(data.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || "Reset failed";
      if (msg.toLowerCase().includes("expired")) toast.error("OTP expired. Please request a new one on Forgot Password.");
      else if (msg.toLowerCase().includes("invalid")) toast.error("Invalid OTP. Please check and try again.");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    if (!email) return toast.error("Enter email first");
    try {
      const { data } = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success(data.message || "OTP resent");
      setVerified(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  return (
    <AuthSplit eyebrow="Secure Reset">
      <SEO title="Reset Password" description="Enter the OTP sent to your email and set a new password for your GenZRides account." path="/reset-password" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <KeyRound size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">Reset Password</h2>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">OTP valid 10 minutes</p>
          </div>
        </div>
        <p className="text-gray-400 mb-6 text-sm">Enter the 6-digit OTP and your new password.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition"
              placeholder="you@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">OTP</label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 tracking-[0.3em] text-center font-mono text-lg transition"
                placeholder="000000"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
              <button type="button" onClick={handleVerify} disabled={verifying || !otp} className="px-4 py-3 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-50 flex items-center gap-1.5">
                {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} Verify
              </button>
            </div>
            {verified && <p className="text-xs text-green-400 mt-1.5">✓ OTP verified</p>}
            <button type="button" onClick={resend} className="text-xs text-green-400 hover:text-green-300 hover:underline mt-1.5">Resend OTP</button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition"
                placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 number"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400">
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
            <input
              type={show ? "text" : "password"}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition"
              placeholder="Repeat new password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="animate-spin h-4 w-4" /> Resetting...</> : <>Reset Password <ArrowRight size={18} /></>}
          </button>

          <div className="text-center text-sm text-gray-400">
            Remembered? <Link to="/login" className="text-green-400 hover:text-green-300 hover:underline font-semibold">Back to Login</Link>
          </div>
        </form>
      </Motion.div>
    </AuthSplit>
  );
};

export default ResetPassword;
