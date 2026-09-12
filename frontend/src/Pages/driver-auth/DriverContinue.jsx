import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { Car, Shield, Clock, Banknote, ChevronRight, Star, MapPin } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import SEO from '../../components/SEO';
import { hero10 } from '../../assets/images';

const benefits = [
  { icon: Banknote, title: 'Earn More', desc: 'Competitive fares with tips and bonuses. Cash out anytime.' },
  { icon: Clock, title: 'Flexible Hours', desc: 'Drive when you want. No fixed shifts. Be your own boss.' },
  { icon: Shield, title: 'Safe & Secure', desc: 'GPS tracking, SOS support, and insurance coverage on every ride.' },
  { icon: Star, title: 'Top Rated', desc: 'Build your reputation. Higher ratings = more ride requests.' },
];

const requirements = [
  'Valid driving license (2+ years)',
  'Aadhaar card for identity verification',
  'Vehicle registration (RC book)',
  'Vehicle insurance certificate',
  'Profile photo',
];

const steps = [
  { num: '01', title: 'Register', desc: 'Create your driver account in minutes' },
  { num: '02', title: 'Submit Documents', desc: 'Upload your license, RC, and Aadhaar' },
  { num: '03', title: 'Get Approved', desc: 'Our team verifies your documents' },
  { num: '04', title: 'Start Earning', desc: 'Go online and accept ride requests' },
];

const DriverContinue = () => {
  const { user } = useAuth();

  if (user) {
    if (user.role === 'driver') return <Navigate to="/driver" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen bg-black">
      <SEO title="Drive With Us" description="Earn driving with GenZRides. Flexible hours, fair commission, weekly payouts." path="/driver/continue" noindex />
      {/* Hero */}
      <div className="relative overflow-hidden">
        <img
          src={hero10}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent" />
        <div className="max-w-6xl mx-auto px-4 pt-32 pb-20 relative">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-1.5 mb-6">
              <Car size={16} className="text-green-400" />
              <span className="text-green-300 text-sm font-medium">Drive with Let&apos;s Go</span>
            </div>

            <h1 className="font-editorial text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Turn your car into<br />
              <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">
                a money-making machine
              </span>
            </h1>

            <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-10">
              Join thousands of drivers earning on their own schedule. Flexible hours,
              competitive pay, and full support — all you need is a car and a license.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/driver/register"
                className="group flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white lg:px-8 md:px-6 px-4  py-4 rounded-full font-semibold text-lg shadow-xl shadow-green-500/25 hover:shadow-[0_0_35px_rgba(34,197,94,0.5)] transition-all"
              >
                Continue to Driver Registration
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/driver/login"
                className="flex items-center gap-2 border border-slate-600 text-slate-300 hover:text-white hover:border-slate-400 px-8 py-4 rounded-full font-semibold text-lg transition-all"
              >
                Already registered? Login
              </Link>
            </div>
          </Motion.div>
        </div>
      </div>

      {/* Benefits */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Why drive with us?</h2>
          <p className="text-slate-400 text-lg">Everything you need to succeed as a driver</p>
        </Motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((b, i) => (
            <Motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center justify-center mb-4">
                <b.icon size={24} className="text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{b.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{b.desc}</p>
            </Motion.div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="max-w-6xl mx-auto px-4 py-20 border-t border-white/5">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p className="text-slate-400 text-lg">Get started in 4 simple steps</p>
        </Motion.div>

        <div className="grid md:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <Motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center bg-green-500/10 border border-green-500/30 rounded-2xl p-6 hover:bg-green-500/20 shadow-lg hover:shadow-green-500/25 transition-colors"
            >
              <div className="font-editorial text-5xl font-bold text-green-500 mb-4">{s.num}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-slate-400 text-sm">{s.desc}</p>
            </Motion.div>
          ))}
        </div>
      </div>

      {/* Requirements */}
      <div className="max-w-6xl mx-auto px-4 py-20 border-t border-white/5">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <Motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">What you&apos;ll need</h2>
            <p className="text-slate-400 text-lg mb-8">
              Make sure you have these documents ready before starting registration.
            </p>
            <div className="space-y-4">
              {requirements.map((r, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-slate-300">{r}</span>
                </div>
              ))}
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-[30px] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin size={24} className="text-green-400" />
              <h3 className="text-white font-semibold text-xl">Service Areas</h3>
            </div>
            <p className="text-slate-300 mb-4">
              We operate across major cities and towns. During registration, you can select
              your preferred service area.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Tamil Nadu', 'Bangalore', 'Puducherry', 'Kerala'].map((city) => (
                <span key={city} className="bg-white/10 text-slate-300 text-sm px-3 py-1 rounded-full">
                  {city}
                </span>
              ))}
            </div>
          </Motion.div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
            className="bg-gradient-to-r from-green-500/15 to-emerald-500/10 border border-green-500/30 rounded-[30px] p-12 text-center backdrop-blur-xl"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">Ready to start earning?</h2>
            <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
              Join our growing network of drivers. Sign up today and start making money on your own schedule.
            </p>
            <Link
              to="/driver/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-[0_0_35px_rgba(34,197,94,0.55)] transition-all shadow-xl"
            >
            Get Started Now
            <ChevronRight size={20} />
          </Link>
        </Motion.div>
      </div>
    </div>
  );
};

export default DriverContinue;
