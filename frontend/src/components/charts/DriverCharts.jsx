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

export const DriverPie = memo(({ rateData }) => (
  <div className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6">
    <h3 className="font-semibold text-white mb-4">Completion vs Cancellation</h3>
    <ResponsiveContainer width="100%" height={260}>
      {rateData.length > 0 ? (
        <PieChart>
          <Pie data={rateData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}>
            {rateData.map((entry, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      ) : (
        <EmptyChart message="No rides completed yet" />
      )}
      </ResponsiveContainer>
  </div>
));

export default DriverCharts;
