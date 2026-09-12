import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/endpoints";
import useAuth from "../../hooks/useAuth";

const getAuthErrorMessage = (error, fallback) => {
  const status = error?.response?.status;
  if (status === 429) {
    const retryAfter = error?.response?.headers?.["retry-after"];
    const wait = retryAfter ? ` Please wait ${retryAfter}s and try again.` : " Please wait a few minutes and try again.";
    return `Too many attempts.${wait}`;
  }
  return (
    error.response?.data?.message ||
    error.response?.data?.errors?.[0]?.message ||
    error.message ||
    fallback
  );
};
import SEO from "../../components/SEO";
import AuthSplit from "../Auth/AuthSplit";
import { toast } from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Loader2, Eye, EyeOff, CarFront } from "lucide-react";

const Login = () => {
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();
  // In-flight guard: exactly one login request per submit, even on
  // double-click/Enter-key bursts. Button disable alone can race.
  const loginInFlight = useRef(false);

  const togglePassword = () => setShowPassword(!showPassword);

  const resetForm = () => {
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
  };

  const onLoginSubmit = async (e) => {
    e.preventDefault();
    if (loginInFlight.current || loading) return;
    loginInFlight.current = true;
    setLoading(true);
    try {
      // Route through AuthContext so user state hydrates immediately —
      // dashboards must load on first navigation without a page refresh
      const data = await login({ email, password });

      if (data.success) {
        toast.success("Login successful");
        const role = data.user?.role;
        if (role === "admin") navigate("/admin");
        else if (role === "driver") navigate("/driver");
        else navigate("/customer");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Login failed. Please try again."));
    } finally {
      setLoading(false);
      loginInFlight.current = false;
    }
  };

  const onRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name, email, phone, password });

      if (data.success) {
        toast.success("Account created! Please login.");
        resetForm();
        setIsCreateAccount(false);
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthSplit eyebrow="Rider Access">
      <SEO title="Login or Create Account" description="Sign in to manage rides, invoices and wallet, or create a free account." path="/login" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-[30px] w-full p-6 sm:p-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
            <CarFront size={22} className="text-white" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold text-white tracking-tight">
              {isCreateAccount ? "Create Account" : "Welcome Back!"}
            </h2>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">
              {isCreateAccount ? "Join the ride" : "Rider Login"}
            </p>
          </div>
        </div>
        <p className="text-gray-400 mb-6 text-sm">
          {isCreateAccount
            ? "Join us and start booking cabs effortlessly."
            : "Please login to continue."}
        </p>

        <form
          onSubmit={isCreateAccount ? onRegisterSubmit : onLoginSubmit}
          className="space-y-4"
        >
          {isCreateAccount && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {isCreateAccount && (
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                type="tel"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                placeholder="10-digit mobile number"
                required
                pattern="[6-9]\d{9}"
                title="Enter a valid 10-digit Indian mobile number starting with 6-9"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
              />
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className="w-full px-4 py-3 pr-11 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition"
                placeholder="********"
                required
                minLength={isCreateAccount ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={togglePassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {isCreateAccount ? (
              <p className="text-xs text-gray-500 mt-1">
                Min 8 chars, 1 uppercase, 1 lowercase, 1 number
              </p>
            ) : (
              <div className="text-right mt-1.5">
                <span
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-green-400 hover:text-green-300 hover:underline cursor-pointer font-medium"
                >
                  Forgot Password?
                </span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] text-white font-semibold py-3 rounded-2xl transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-4 w-4" /> Loading...
              </>
            ) : isCreateAccount ? (
              "Sign Up"
            ) : (
              "Login"
            )}
          </button>

          <div className="text-center mt-4 text-sm text-gray-400">
            {isCreateAccount ? (
              <p>
                Already have an account?{" "}
                <span
                  className="text-green-400 hover:text-green-300 hover:underline cursor-pointer font-semibold"
                  onClick={() => {
                    setIsCreateAccount(false);
                    resetForm();
                  }}
                >
                  Login
                </span>
              </p>
            ) : (
              <p>
                Don&apos;t have an account?{" "}
                <span
                  className="text-green-400 hover:text-green-300 hover:underline cursor-pointer font-semibold"
                  onClick={() => {
                    setIsCreateAccount(true);
                    resetForm();
                  }}
                >
                  Sign Up
                </span>
              </p>
            )}
          </div>
        </form>
      </Motion.div>
    </AuthSplit>
  );
};

export default Login;
