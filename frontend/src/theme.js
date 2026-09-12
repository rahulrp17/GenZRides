export const glass = {
  page: 'min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900',
  card: 'bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 shadow-2xl',
  cardHover: 'hover:border-green-400/40 transition-all duration-500',
  cardP: 'bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-6',
  table: 'bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-hidden',
  tableRow: 'border-b border-white/5 hover:bg-white/5 transition',
  tableHead: 'px-6 py-4 text-xs font-semibold text-green-400 uppercase tracking-wider',
  tableCell: 'px-6 py-4 text-sm text-gray-300',
  input: 'bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 focus:border-green-500/50 outline-none transition',
  badge: {
    success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/30',
    info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    indigo: 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30',
    purple: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
    emerald: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    rose: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
  },
  nav: {
    item: 'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
    active: 'bg-green-500/10 text-green-400 border border-green-500/20',
    inactive: 'text-gray-400 hover:bg-white/5 hover:text-white',
  },
};

export const btn = {
  primary: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-2xl px-6 py-3 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300 active:scale-95',
  primarySm: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl px-4 py-2 text-sm hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all duration-300 active:scale-95',
  ghost: 'text-gray-400 hover:text-white hover:bg-white/5 rounded-xl px-4 py-2 text-sm transition-all',
  danger: 'bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl px-4 py-2 text-sm font-medium hover:bg-red-500/30 transition-all',
  ghostCard: 'p-1.5 hover:bg-white/10 rounded-lg transition',
};

export const statusBadge = (status) => {
  const map = {
    Pending: glass.badge.warning,
    Accepted: glass.badge.info,
    'On The Way': glass.badge.indigo,
    Arrived: glass.badge.purple,
    Started: glass.badge.cyan,
    Completed: glass.badge.success,
    Cancelled: glass.badge.danger,
    Approved: glass.badge.success,
    Rejected: glass.badge.danger,
    Active: glass.badge.success,
    Blocked: glass.badge.danger,
    Online: glass.badge.success,
    Offline: glass.badge.warning,
  };
  return `${map[status] || glass.badge.info} px-2.5 py-0.5 rounded-full text-xs font-medium`;
};

export const glow = {
  green: 'absolute top-0 left-0 w-72 h-72 bg-green-500/20 blur-[120px]',
  blue: 'absolute bottom-0 right-0 w-72 h-72 bg-blue-500/20 blur-[120px]',
};
