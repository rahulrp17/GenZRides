import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import SEO from "../../components/SEO";
import AuthSplit from "../../Component/Auth/AuthSplit";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, Shield } from "lucide-react";

const passwordRules = [
  { test: (p) => p.length >= 8, label: "At least 8 characters" },
  { test: (p) => /[A-Z]/.test(p), label: "One uppercase letter" },
  { test: (p) => /[a-z]/.test(p), label: "One lowercase letter" },
  { test: (p) => /\d/.test(p), label: "One number" },
];

const NewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState(location.state?.otp || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
    if (location.state?.otp) setOtp(location.state.otp);
  }, [location.state]);

  const allValid = passwordRules.every((r) => r.test(newPassword)) && newPassword === confirm && newPassword.length > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) return toast.error("Session expired. Please start from Forgot Password.");
    if (!allValid) return toast.error("Please meet all password requirements");
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ email: email.trim().toLowerCase(), otp, newPassword });
      toast.success(data.message || "Password reset successful");
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || "Reset failed";
      if (msg.toLowerCase().includes("expired")) toast.error("OTP expired. Please request a new one.");
      else if (msg.toLowerCase().includes("invalid")) toast.error("Invalid OTP. Please go back and try again.");
      else toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!email || !otp) {
    return (
      <AuthSplit eyebrow="Set New Password">
        <SEO title="Set New Password" description="Set a new password for your GenZRides account." path="/new-password" noindex />
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <Shield size={32} className="text-red-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">Session Expired</h2>
          <p className="text-gray-400 text-sm mb-6">Please verify your OTP first before setting a new password.</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            <ArrowRight size={18} /> Start Over
          </Link>
        </Motion.div>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit eyebrow="Set New Password">
      <SEO title="Set New Password" description="Set a new secure password for your GenZRides account." path="/new-password" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <Lock size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">Set New Password</h2>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">Choose a strong password</p>
          </div>
        </div>
        <p className="text-gray-400 mb-6 text-sm">
          Create a new password for <span className="text-white font-medium">{email}</span>
        </p>

        {success ? (
          <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center py-8"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Password Reset!</h3>
            <p className="text-sm text-gray-400">Redirecting to login...</p>
          </Motion.div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={show ? "text" : "password"}
                  className="w-full pl-10 pr-11 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 transition"
                  placeholder="Enter new password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400">
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {/* Password rules */}
              {newPassword.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {passwordRules.map((rule) => (
                    <div key={rule.label} className="flex items-center gap-1.5 text-xs">
                      <CheckCircle size={12} className={rule.test(newPassword) ? "text-emerald-400" : "text-gray-600"} />
                      <span className={rule.test(newPassword) ? "text-emerald-400" : "text-gray-500"}>{rule.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type={show ? "text" : "password"}
                  className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 transition ${
                    confirm && newPassword !== confirm
                      ? "border-red-500/50 focus:ring-red-500/30"
                      : confirm && newPassword === confirm
                        ? "border-emerald-500/50 focus:ring-emerald-500/30"
                        : "border-white/10 focus:ring-green-500/40"
                  }`}
                  placeholder="Repeat new password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {confirm && newPassword !== confirm && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
              {confirm && newPassword === confirm && (
                <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle size={12} /> Passwords match
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !allValid}
              className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </span>
              ) : (
                <>
                  Reset Password <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center text-sm text-gray-400">
              <Link to="/verify-otp" state={{ email }} className="text-green-400 hover:text-green-300 hover:underline font-semibold">
                Back to OTP
              </Link>
              <span className="mx-2 text-gray-600">·</span>
              <Link to="/login" className="text-green-400 hover:text-green-300 hover:underline font-semibold">
                Login
              </Link>
            </div>
          </form>
        )}
      </Motion.div>
    </AuthSplit>
  );
};

export default NewPassword;
