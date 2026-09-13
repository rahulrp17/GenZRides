import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import SEO from "../../components/SEO";
import AuthSplit from "../../Component/Auth/AuthSplit";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Eye, EyeOff, KeyRound, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";

const OTP_LENGTH = 6;

const OtpInput = ({ index, value, onChange, onBackspace, onPaste, focusRef, submitting }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (focusRef) focusRef.current = inputRef.current;
  }, [focusRef]);

  useEffect(() => {
    if (index === 0 && !value) inputRef.current?.focus();
  }, [index, value]);

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && !value) {
      onBackspace();
    }
  };

  return (
    <Motion.input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => {
        const digit = e.target.value.replace(/\D/g, '');
        if (digit) onChange(digit, index);
      }}
      onKeyDown={handleKeyDown}
      onPaste={onPaste}
      disabled={submitting}
      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all duration-300 outline-none
        ${submitting
          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
          : value
            ? 'bg-white/10 border-green-500/50 text-white shadow-[0_0_8px_rgba(34,197,94,0.2)]'
            : 'bg-white/5 border-white/10 text-white focus:border-green-500/50 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)]'
        }
        ${submitting ? 'pointer-events-none' : ''}
      `}
      style={{ caretColor: 'transparent' }}
    />
  );
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
  }, [location.state]);

  const otp = otpDigits.join('');

  const handleOtpChange = useCallback((digit, index) => {
    setOtpDigits((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (index < OTP_LENGTH - 1) {
      setTimeout(() => inputRefs.current[index + 1]?.focus(), 0);
    }
  }, []);

  const handleBackspace = useCallback((index) => {
    if (index > 0) {
      setOtpDigits((prev) => {
        const next = [...prev];
        next[index] = '';
        return next;
      });
      setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
    }
  }, []);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setTimeout(() => inputRefs.current[focusIdx]?.focus(), 0);
  }, []);

  const handleVerify = async () => {
    if (!email || otp.length !== OTP_LENGTH) return toast.error("Enter email and complete OTP");
    setVerifying(true);
    try {
      const { data } = await authAPI.verifyOtp({ email: email.trim().toLowerCase(), otp });
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
    if (!email.trim() || otp.length !== OTP_LENGTH || !newPassword) return toast.error("All fields are required");
    if (newPassword.length < 8) return toast.error("Password must be at least 8 characters");
    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
      return toast.error("Password must contain uppercase, lowercase and number");
    }
    if (newPassword !== confirm) return toast.error("Passwords do not match");
    if (!verified) {
      try {
        await authAPI.verifyOtp({ email: email.trim().toLowerCase(), otp });
      } catch (err) {
        const msg = err.response?.data?.message || "Invalid or expired OTP";
        return toast.error(msg);
      }
    }
    setSubmitting(true);
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword({ email: email.trim().toLowerCase(), otp, newPassword });
      toast.success(data.message || "Password reset successful");
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || err.message || "Reset failed";
      if (msg.toLowerCase().includes("expired")) toast.error("OTP expired. Please request a new one on Forgot Password.");
      else if (msg.toLowerCase().includes("invalid")) toast.error("Invalid OTP. Please check and try again.");
      else toast.error(msg);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const resend = async () => {
    if (!email) return toast.error("Enter email first");
    try {
      const { data } = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      toast.success(data.message || "OTP resent");
      setVerified(false);
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
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

        <form onSubmit={onSubmit} className="space-y-5">
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
            <label className="block text-sm font-medium text-gray-300 mb-3">OTP Code</label>
            <div className="flex justify-center gap-2 sm:gap-3">
              {otpDigits.map((digit, i) => (
                <OtpInput
                  key={i}
                  index={i}
                  value={digit}
                  onChange={handleOtpChange}
                  onBackspace={() => handleBackspace(i)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  focusRef={{ current: inputRefs.current[i] }}
                  submitting={submitting}
                />
              ))}
            </div>

            {verified && (
              <Motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-1.5 mt-2 text-green-400 text-xs">
                <CheckCircle size={14} /> OTP verified
              </Motion.div>
            )}
            <div className="flex items-center justify-between mt-3">
              <button type="button" onClick={resend} className="text-xs text-green-400 hover:text-green-300 hover:underline">Resend OTP</button>
              {!verified && otp.length === OTP_LENGTH && (
                <button type="button" onClick={handleVerify} disabled={verifying} className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition disabled:opacity-50">
                  {verifying ? (
                    <span className="w-3 h-3 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck size={14} />
                  )}
                  Verify
                </button>
              )}
            </div>
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
            disabled={loading || otp.length !== OTP_LENGTH}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <span className="flex gap-1">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Motion.span
                      key={i}
                      className="w-1.5 h-1.5 bg-white rounded-full"
                      animate={{ y: [0, -6, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.08 }}
                    />
                  ))}
                </span>
                Resetting...
              </span>
            ) : (
              <>Reset Password <ArrowRight size={18} /></>
            )}
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
