import React from 'react';
import { motion as Motion } from 'framer-motion';
import { Camera, Loader2, Mail, Phone, Pencil } from 'lucide-react';

const ACCENTS = {
  emerald: {
    avatarRing: 'ring-emerald-500/30',
    avatarBg: 'bg-emerald-500/20',
    avatarText: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    editBtn: 'from-emerald-500 to-green-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]',
    uploadBtn: 'bg-emerald-600 hover:bg-emerald-700',
  },
  green: {
    avatarRing: 'ring-green-500/30',
    avatarBg: 'bg-green-500/20',
    avatarText: 'text-green-400',
    badge: 'bg-green-500/10 text-green-400 border-green-500/20',
    editBtn: 'from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]',
    uploadBtn: 'bg-green-500 hover:bg-green-600',
  },
  violet: {
    avatarRing: 'ring-violet-500/30',
    avatarBg: 'bg-violet-500/20',
    avatarText: 'text-violet-400',
    badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    editBtn: 'from-violet-500 to-purple-600 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]',
    uploadBtn: 'bg-violet-500 hover:bg-violet-600',
  },
};

/**
 * Premium glassmorphism profile card shared by Customer / Driver / Admin.
 * All displayed values come from backend data passed in as props —
 * nothing here is mocked. Optional sections hide when data is absent.
 */
const ProfileCard = ({
  name,
  email,
  phone,
  avatarSrc,
  roleLabel,
  badges = [],
  stats = [],
  onEdit,
  editLabel = 'Update Profile',
  onAvatarChange,
  uploading = false,
  accent = 'emerald',
}) => {
  const a = ACCENTS[accent] || ACCENTS.emerald;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-white/[0.04] backdrop-blur-xl rounded-[30px] border border-white/[0.08] p-6 sm:p-8"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px]" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
        <div className="relative shrink-0 mx-auto sm:mx-0">
          <div className={`w-24 h-24 rounded-full ${a.avatarBg} ring-2 ${a.avatarRing} flex items-center justify-center overflow-hidden`}>
            {avatarSrc ? (
              <img src={avatarSrc} alt={name || 'Profile'} className="w-full h-full object-cover" />
            ) : (
              <span className={`text-4xl font-bold ${a.avatarText}`}>
                {name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            )}
          </div>
          {onAvatarChange && (
            <label
              className={`absolute bottom-0 right-0 p-2 text-white rounded-full transition ${
                uploading ? 'opacity-60 cursor-wait' : `cursor-pointer ${a.uploadBtn}`
              }`}
              title="Change profile photo"
            >
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) onAvatarChange(e.target.files[0]);
                  e.target.value = '';
                }}
              />
            </label>
          )}
        </div>

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-white truncate">{name || '—'}</h2>
          {email && (
            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-400 mt-1 truncate">
              <Mail size={13} className="shrink-0 text-gray-500" />
              <span className="truncate">{email}</span>
            </p>
          )}
          {phone && (
            <p className="flex items-center justify-center sm:justify-start gap-1.5 text-sm text-gray-400 mt-1">
              <Phone size={13} className="shrink-0 text-gray-500" />
              {phone}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mt-2.5">
            {roleLabel && (
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${a.badge}`}>
                {roleLabel}
              </span>
            )}
            {badges.map((b) => (
              <span
                key={b.label}
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border ${b.className || 'bg-white/5 text-gray-300 border-white/10'}`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className={`shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 min-h-[44px] bg-gradient-to-r ${a.editBtn} text-white rounded-2xl text-sm font-semibold transition-all active:scale-[0.98]`}
          >
            <Pencil size={15} /> {editLabel}
          </button>
        )}
      </div>

      {stats.length > 0 && (
        <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-black/25 border border-white/[0.07] rounded-2xl px-3 py-3 text-center min-w-0">
              <p className="text-base sm:text-lg font-bold text-white truncate">{s.value}</p>
              <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 truncate">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </Motion.div>
  );
};

export default ProfileCard;
