import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import SEO from "../../components/SEO";
import AuthSplit from "../../Component/Auth/AuthSplit";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { ShieldCheck, ArrowRight, CheckCircle, Mail, RotateCcw } from "lucide-react";

const OTP_LENGTH = 6;

const OtpBox = ({ index, value, onChange, onBackspace, onPaste, submitting }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (index === 0) inputRef.current?.focus();
  }, [index]);

  const handleKeyDown = (e) => {
    if (e.key === "Backspace" && !value) onBackspace();
  };

  return (
    <Motion.input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      maxLength={1}
      value={value}
      onChange={(e) => {
        const d = e.target.value.replace(/\D/g, "");
        if (d) onChange(d, index);
      }}
      onKeyDown={handleKeyDown}
      onPaste={onPaste}
      disabled={submitting}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 500, damping: 30 }}
      className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono rounded-xl border-2 transition-all duration-300 outline-none
        ${submitting
          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(34,197,94,0.3)]"
          : value
            ? "bg-white/10 border-green-500/50 text-white shadow-[0_0_8px_rgba(34,197,94,0.2)]"
            : "bg-white/5 border-white/10 text-white focus:border-green-500/50 focus:shadow-[0_0_8px_rgba(34,197,94,0.15)]"
        }
        ${submitting ? "pointer-events-none" : ""}
      `}
      style={{ caretColor: "transparent" }}
    />
  );
};

const OtpVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otpDigits, setOtpDigits] = useState(Array(OTP_LENGTH).fill(""));
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
  }, [location.state]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const otp = otpDigits.join("");

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
        next[index] = "";
        return next;
      });
      setTimeout(() => inputRefs.current[index - 1]?.focus(), 0);
    }
  }, []);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const newDigits = Array(OTP_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) newDigits[i] = pasted[i];
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1);
    setTimeout(() => inputRefs.current[focusIdx]?.focus(), 0);
  }, []);

  const handleVerify = async () => {
    if (!email || otp.length !== OTP_LENGTH) return toast.error("Enter the complete 6-digit OTP");
    setVerifying(true);
    try {
      const { data } = await authAPI.verifyOtp({ email: email.trim().toLowerCase(), otp });
      toast.success(data.message || "OTP verified");
      setVerified(true);
      setTimeout(() => {
        navigate("/new-password", { state: { email: email.trim().toLowerCase(), otp } });
      }, 800);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || "Invalid or expired OTP";
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (!email) return toast.error("Enter email first");
    try {
      const { data } = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      if (data.emailWarning) {
        toast.error(data.emailWarning, { duration: 6000 });
      } else {
        toast.success(data.message || "OTP resent");
      }
      setVerified(false);
      setOtpDigits(Array(OTP_LENGTH).fill(""));
      setCountdown(60);
      setTimeout(() => inputRefs.current[0]?.focus(), 0);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleResendClick = () => {
    if (countdown > 0) return;
    resend();
  };

  if (!email) {
    return (
      <AuthSplit eyebrow="Verify Identity">
        <SEO title="Verify OTP" description="Enter the 6-digit OTP sent to your email." path="/verify-otp" noindex />
        <Motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 flex items-center justify-center mb-4">
            <Mail size={32} className="text-red-400" />
          </div>
          <h2 className="font-display text-xl font-bold text-white mb-2">No Email Found</h2>
          <p className="text-gray-400 text-sm mb-6">Please go back and enter your email first.</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            <ArrowRight size={18} /> Go to Forgot Password
          </Link>
        </Motion.div>
      </AuthSplit>
    );
  }

  return (
    <AuthSplit eyebrow="Verify Identity">
      <SEO title="Verify OTP" description="Enter the 6-digit OTP sent to your email to verify your identity." path="/verify-otp" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8"
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <ShieldCheck size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">Verify OTP</h2>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">Expires in 10 minutes</p>
          </div>
        </div>
        <p className="text-gray-400 mb-1 text-sm">
          We sent a 6-digit code to
        </p>
        <p className="text-white font-medium text-sm mb-6">{email}</p>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-2 sm:gap-3 mb-4">
          {otpDigits.map((digit, i) => (
            <OtpBox
              key={i}
              index={i}
              value={digit}
              onChange={handleOtpChange}
              onBackspace={() => handleBackspace(i)}
              onPaste={i === 0 ? handlePaste : undefined}
              submitting={submitting}
            />
          ))}
        </div>

        {/* Verified indicator */}
        {verified && (
          <Motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-2 mb-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
          >
            <CheckCircle size={16} className="text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">OTP verified — redirecting...</span>
          </Motion.div>
        )}

        {/* Resend */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            type="button"
            onClick={handleResendClick}
            disabled={countdown > 0}
            className="flex items-center gap-1.5 text-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} className={countdown > 0 ? "text-gray-500" : "text-green-400"} />
            <span className={countdown > 0 ? "text-gray-500" : "text-green-400 hover:text-green-300"}>
              {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
            </span>
          </button>
        </div>

        {/* Verify Button */}
        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying || otp.length !== OTP_LENGTH || verified}
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50"
        >
          {verifying ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Verifying...
            </span>
          ) : (
            <>
              Continue <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center text-sm text-gray-400 mt-4">
          <Link to="/forgot-password" className="text-green-400 hover:text-green-300 hover:underline font-semibold">
            Change email
          </Link>
          <span className="mx-2 text-gray-600">·</span>
          <Link to="/login" className="text-green-400 hover:text-green-300 hover:underline font-semibold">
            Back to Login
          </Link>
        </div>
      </Motion.div>
    </AuthSplit>
  );
};

export default OtpVerification;
