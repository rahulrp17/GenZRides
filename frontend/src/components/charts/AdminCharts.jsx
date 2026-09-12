import React from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#6366f1'];
const BAR_COLORS = ['#6366f1', '#10b981', '#3b82f6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-3.5 min-w-[140px]">
        <p className="text-xs font-semibold text-white mb-1.5 tracking-wide">{label || payload[0]?.name}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.fill }} />
              <span className="text-gray-400">{entry.name}</span>
            </span>
            <span className="font-semibold text-white">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('en-IN') : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyChart = ({ message }) => (
  <div className="flex flex-col items-center justify-center h-[260px] text-gray-500 text-sm gap-2">
    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
      <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    </div>
    <span>{message}</span>
  </div>
);

const ChartCard = ({ children, title, subtitle, accentColor = 'green', className = '' }) => (
  <div className={`relative overflow-hidden bg-white/[0.04] backdrop-blur-xl rounded-[28px] border border-white/[0.08] p-5 sm:p-6 min-w-0 ${className}`}>
    <div className={`pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-${accentColor}-400/50 to-transparent`} />
    <h3 className="font-display text-base font-bold text-white tracking-tight">{title}</h3>
    <p className="text-xs text-gray-500 mt-0.5 mb-4">{subtitle}</p>
    {children}
  </div>
);

const AdminCharts = ({ stats = {} }) => {
  const total = Number(stats.totalBookings || 0);
  const pending = Number(stats.pendingBookings || 0);
  const completed = Number(stats.completedBookings || 0);
  const cancelled = Number(stats.cancelledBookings || 0);
  const inProgress = Math.max(0, total - pending - completed - cancelled);

  /* ── Pie: Bookings by Status ─────────────────────────────── */
  const statusData = [
    { name: 'Pending', value: pending },
    { name: 'Completed', value: completed },
    { name: 'Cancelled', value: cancelled },
    { name: 'In Progress', value: inProgress },
  ];
  const hasStatusData = statusData.some((d) => d.value > 0);

  /* ── Bar: Revenue by Trip Type ───────────────────────────── */
  const revenueData = [
    { name: 'One-Way', revenue: Number(stats.oneWayRevenue || 0) },
    { name: 'Round-Trip', revenue: Number(stats.roundTripRevenue || 0) },
  ];
  const hasRevenueData = revenueData.some((d) => d.revenue > 0);

  /* ── Bar: Total Bookings by Status ───────────────────────── */
  const bookingsStatusData = [
    { name: 'Pending', count: pending },
    { name: 'Completed', count: completed },
    { name: 'Cancelled', count: cancelled },
    { name: 'In Progress', count: inProgress },
  ];
  const hasBookingsStatusData = bookingsStatusData.some((d) => d.count > 0);

  /* ── Bar: One-Way Bookings by Status ─────────────────────── */
  const oneWayData = [
    { name: 'Pending', count: Number(stats.oneWayPending || 0) },
    { name: 'Completed', count: Number(stats.oneWayCompleted || 0) },
    { name: 'Cancelled', count: Number(stats.oneWayCancelled || 0) },
  ];
  const hasOneWayData = oneWayData.some((d) => d.count > 0);

  /* ── Bar: Round-Trip Bookings by Status ──────────────────── */
  const roundTripData = [
    { name: 'Pending', count: Number(stats.roundTripPending || 0) },
    { name: 'Completed', count: Number(stats.roundTripCompleted || 0) },
    { name: 'Cancelled', count: Number(stats.roundTripCancelled || 0) },
  ];
  const hasRoundTripData = roundTripData.some((d) => d.count > 0);

  /* ── Bar: Weekly One-Way vs Round-Trip (last 7 days) ─────── */
  const weeklyData = stats.weeklyData || [];
  const hasWeeklyData = weeklyData.some((d) => d.oneWay > 0 || d.roundTrip > 0);

  return (
    <div className="space-y-4 sm:space-y-6 min-w-0">
      {/* Row 1 — Pie + Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Bookings by Status" subtitle="Live distribution from all bookings" accentColor="amber">
          <ResponsiveContainer width="100%" height={280}>
            {hasStatusData ? (
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="46%"
                  outerRadius="72%"
                  innerRadius="42%"
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                  label={({ name, percent }) => (percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : '')}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconSize={10} />
              </PieChart>
            ) : (
              <EmptyChart message="No booking data yet" />
            )}
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Trip Type" subtitle="Completed booking revenue split" accentColor="emerald">
          <ResponsiveContainer width="100%" height={280}>
            {hasRevenueData ? (
              <BarChart data={revenueData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }} barSize={52}>
                <defs>
                  <linearGradient id="gradOneWay" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                  </linearGradient>
                  <linearGradient id="gradRoundTrip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="revenue" name="Revenue" radius={[10, 10, 0, 0]}>
                  {revenueData.map((entry, index) => (
                    <Cell key={index} fill={index === 0 ? 'url(#gradOneWay)' : 'url(#gradRoundTrip)'} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <EmptyChart message="No revenue data yet" />
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 2 — Total Bookings + One-Way */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Total Bookings" subtitle="All bookings by current status" accentColor="blue">
          <ResponsiveContainer width="100%" height={260}>
            {hasBookingsStatusData ? (
              <BarChart data={bookingsStatusData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }} barSize={40}>
                <defs>
                  <linearGradient id="gradPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Bookings" radius={[8, 8, 0, 0]}>
                  {bookingsStatusData.map((entry, index) => (
                    <Cell key={index} fill={['url(#gradPending)', 'url(#gradCompleted)', 'url(#gradCancelled)', 'url(#gradInProgress)'][index]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <EmptyChart message="No booking data yet" />
            )}
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="One-Way Bookings" subtitle="Point-to-point trip breakdown" accentColor="indigo">
          <ResponsiveContainer width="100%" height={260}>
            {hasOneWayData ? (
              <BarChart data={oneWayData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }} barSize={44}>
                <defs>
                  <linearGradient id="gradOWPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradOWCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradOWCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="One-Way" radius={[8, 8, 0, 0]}>
                  {oneWayData.map((entry, index) => (
                    <Cell key={index} fill={['url(#gradOWPending)', 'url(#gradOWCompleted)', 'url(#gradOWCancelled)'][index]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <EmptyChart message="No one-way booking data yet" />
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 3 — Round-Trip + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Round-Trip Bookings" subtitle="Multi-day round-trip breakdown" accentColor="emerald">
          <ResponsiveContainer width="100%" height={260}>
            {hasRoundTripData ? (
              <BarChart data={roundTripData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }} barSize={44}>
                <defs>
                  <linearGradient id="gradRTPending" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradRTCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradRTCancelled" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" name="Round-Trip" radius={[8, 8, 0, 0]}>
                  {roundTripData.map((entry, index) => (
                    <Cell key={index} fill={['url(#gradRTPending)', 'url(#gradRTCompleted)', 'url(#gradRTCancelled)'][index]} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <EmptyChart message="No round-trip booking data yet" />
            )}
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weekly Bookings" subtitle="One-Way vs Round-Trip (last 7 days)" accentColor="purple">
          <ResponsiveContainer width="100%" height={260}>
            {hasWeeklyData ? (
              <BarChart data={weeklyData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }} barSize={28}>
                <defs>
                  <linearGradient id="gradWeeklyOW" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="gradWeeklyRT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend wrapperStyle={{ fontSize: 12 }} iconSize={10} />
                <Bar dataKey="oneWay" name="One-Way" fill="url(#gradWeeklyOW)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="roundTrip" name="Round-Trip" fill="url(#gradWeeklyRT)" radius={[6, 6, 0, 0]} />
              </BarChart>
            ) : (
              <EmptyChart message="No weekly booking data yet" />
            )}
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Row 4 — Trip Type Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartCard title="Trip Type Summary" subtitle="One-way vs round-trip overview" accentColor="purple">
          <div className="flex items-center justify-center h-[260px]">
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-indigo-400">
                  {Number(stats.oneWayBookings || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">One-Way</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ₹{Number(stats.oneWayRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center">
                <p className="text-3xl font-display font-bold text-emerald-400">
                  {Number(stats.roundTripBookings || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1">Round-Trip</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  ₹{Number(stats.roundTripRevenue || 0).toLocaleString('en-IN')}
                </p>
              </div>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
};

export default AdminCharts;
