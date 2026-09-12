import React from 'react';

const StatsCard = ({ icon: Icon, label, value, trend, trendUp, color = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    emerald: 'bg-emerald-500/10 text-emerald-400',
    amber: 'bg-amber-500/10 text-amber-400',
    blue: 'bg-blue-500/10 text-blue-400',
    rose: 'bg-rose-500/10 text-rose-400',
    purple: 'bg-purple-500/10 text-purple-400',
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className={`text-xs mt-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? '+' : ''}{trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${colors[color]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
