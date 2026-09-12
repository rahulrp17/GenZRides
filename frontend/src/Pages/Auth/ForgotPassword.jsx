import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import SEO from "../../components/SEO";
import AuthSplit from "../../Component/Auth/AuthSplit";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Loader2, Mail, ArrowRight, ShieldCheck } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return toast.error("Please enter your email");
    setLoading(true);
    try {
      const { data } = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success(data.message || "OTP sent to your email");
      navigate("/reset-password", { state: { email: email.trim().toLowerCase() } });
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || "Failed to send OTP";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit eyebrow="Recover Access">
      <SEO title="Forgot Password" description="Reset your GenZRides password with a secure OTP sent to your email." path="/forgot-password" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">Forgot Password</h2>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">Reset in 30 seconds</p>
          </div>
        </div>
        <p className="text-gray-400 mb-6 text-sm">Enter your registered email and we&apos;ll send a 6-digit OTP valid for 10 minutes.</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                id="email"
                type="email"
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50"
          >
            {loading ? <><Loader2 className="animate-spin h-4 w-4" /> Sending OTP...</> : <>Send OTP <ArrowRight size={18} /></>}
          </button>

          <div className="text-center text-sm text-gray-400">
            Remember your password? <Link to="/login" className="text-green-400 hover:text-green-300 hover:underline font-semibold">Login</Link>
          </div>
        </form>
      </Motion.div>
    </AuthSplit>
  );
};

export default ForgotPassword;
