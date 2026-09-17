import React, { memo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-3">
        <p className="text-sm font-medium text-white">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EmptyChart = ({ message }) => (
  <div className="flex items-center justify-center h-full text-gray-500 text-sm">{message}</div>
);

// Lazy-loaded by DriverDashboard so recharts ships in its own chunk.
// Memoized: parent re-renders on polling, chart props are memo-stable.
const DriverCharts = memo(({ earningsData, hasEarningsData, tripsData, hasTripsData }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6">
      <h3 className="font-semibold text-white mb-4">Earnings Overview</h3>
      <ResponsiveContainer width="100%" height={280}>
        {hasEarningsData ? (
          <LineChart data={earningsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} name="Earnings" />
          </LineChart>
        ) : (
          <EmptyChart message="No earnings data yet" />
        )}
      </ResponsiveContainer>
    </div>

    <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6">
      <h3 className="font-semibold text-white mb-4">Trip Status</h3>
      <ResponsiveContainer width="100%" height={280}>
        {hasTripsData ? (
          <BarChart data={tripsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {tripsData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        ) : (
          <EmptyChart message="No trip data yet" />
        )}
      </ResponsiveContainer>
    </div>
  </div>
));

const RATE_COLORS = { Completed: "#10b981", Cancelled: "#f43f5e" };

export const DriverPie = memo(({ rateData }) => {
  const total = rateData.reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  const completed = rateData.find((d) => d.name === "Completed");
  const completedPct = total > 0 && completed ? Math.round((completed.value / total) * 100) : 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl rounded-[30px] border border-white/10 p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
      <h3 className="font-display font-semibold text-white text-sm sm:text-base tracking-tight">
        Completion vs Cancellation
      </h3>
      <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
        {total > 0 ? `${total} decided trip${total === 1 ? "" : "s"}` : "No trips yet"}
      </p>

      {rateData.length > 0 ? (
        <>
          <div className="relative mx-auto w-full max-w-[280px]">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rateData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="66%"
                  outerRadius="92%"
                  paddingAngle={4}
                  cornerRadius={7}
                  strokeWidth={0}
                  isAnimationActive
                >
                  {rateData.map((entry) => (
                    <Cell key={entry.name} fill={RATE_COLORS[entry.name] || "#6366f1"} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-3xl sm:text-4xl font-bold text-white tabular-nums">
                {completedPct}%
              </p>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-gray-500 mt-1">
                completed
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-1">
            {rateData.map((entry) => (
              <span key={entry.name} className="inline-flex items-center gap-2 text-xs sm:text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: RATE_COLORS[entry.name] || "#6366f1",
                    boxShadow: `0 0 10px ${RATE_COLORS[entry.name] || "#6366f1"}66`,
                  }}
                />
                <span className="text-gray-400">{entry.name}</span>
                <span className="font-bold text-white tabular-nums">
                  {Number(entry.value).toFixed(1)}%
                </span>
              </span>
            ))}
          </div>
        </>
      ) : (
        <div className="h-[220px]">
          <EmptyChart message="No rides completed yet" />
        </div>
      )}
    </div>
  );
});

export default DriverCharts;
