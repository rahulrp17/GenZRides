import React, { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion as Motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, Car, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import SEO from '../../components/SEO';
import AuthSplit from '../../Component/Auth/AuthSplit';

const DriverLogin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const inFlight = useRef(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' });

  if (user) {
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/customer" replace />;
  }

  const onSubmit = async (data) => {
    // Exactly one login request per submit — ignore bursts/double-taps.
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      await login({ email: data.email, password: data.password });
      toast.success('Login successful!');
      navigate('/driver');
    } catch (error) {
      if (error?.response?.status === 429) {
        const retryAfter = error?.response?.headers?.['retry-after'];
        toast.error(
          `Too many attempts.${retryAfter ? ` Please wait ${retryAfter}s and try again.` : ' Please wait a few minutes and try again.'}`
        );
      } else {
        toast.error(error?.response?.data?.message || error?.message || 'Login failed');
      }
    } finally {
      inFlight.current = false;
    }
  };

  return (
    <AuthSplit eyebrow="Driver Access">
      <SEO title="Driver Login" description="Driver sign-in for ride requests, earnings and wallet." path="/driver/login" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Link
          to="/driver/continue"
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 mb-6 transition-colors"
        >
          <ChevronLeft size={16} />
          Back
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Car size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight">Driver Login</h1>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">Chauffeur Access</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-1 mb-6">Welcome back! Sign in to your driver account.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all ${
                  errors.email ? 'border-red-500' : 'border-white/10'
                }`}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Enter a valid email address',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 transition-all ${
                    errors.password ? 'border-red-500' : 'border-white/10'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
              <div className="text-right mt-1.5">
                <Link
                  to="/forgot-password"
                  className="text-xs text-green-400 hover:text-green-300 hover:underline font-medium"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] disabled:opacity-50 text-white font-semibold rounded-2xl flex items-center justify-center gap-2 transition-all"
            >
              {(isSubmitting || loading) && <Loader2 size={18} className="animate-spin" />}
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/driver/register" className="text-green-400 hover:text-green-300 font-semibold transition-colors">
              Register
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          After registration, your account will be reviewed by our team.
        </p>
      </Motion.div>
    </AuthSplit>
  );
};

export default DriverLogin;
