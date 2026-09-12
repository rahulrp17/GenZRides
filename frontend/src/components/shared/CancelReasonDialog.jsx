import React, { useEffect, useState } from 'react';
import Modal from './Modal';

const DEFAULT_REASONS = [
  'Change of plans',
  'Driver is delayed',
  'Booked by mistake',
  'Found another ride',
  'Emergency',
];

const CancelReasonDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Cancel Booking',
  message = 'Please tell us why you are cancelling. This action cannot be undone.',
  confirmText = 'Cancel Booking',
  reasons = DEFAULT_REASONS,
  isPending = false,
}) => {
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setCustomReason('');
    }
  }, [isOpen]);

  const finalReason = (reason === '__custom__' ? customReason : reason).trim();

  const handleConfirm = () => {
    if (!finalReason || isPending) return;
    onConfirm(finalReason);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <p className="text-sm text-slate-200/70 mb-4">{message}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {reasons.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setReason(r)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              reason === r
                ? 'bg-red-500/15 text-red-300 border-red-500/40'
                : 'bg-white/5 text-slate-200/80 border-white/10 hover:bg-white/10'
            }`}
          >
            {r}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setReason('__custom__')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
            reason === '__custom__'
              ? 'bg-red-500/15 text-red-300 border-red-500/40'
              : 'bg-white/5 text-slate-200/80 border-white/10 hover:bg-white/10'
          }`}
        >
          Other
        </button>
      </div>

      {reason === '__custom__' && (
        <textarea
          value={customReason}
          onChange={(e) => setCustomReason(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Type your reason..."
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500/30 focus:border-red-500/50 outline-none resize-none mb-4"
        />
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onClose}
          disabled={isPending}
          className="px-4 py-2 text-sm font-medium text-slate-200/80 bg-white/5 rounded-xl hover:bg-white/10 transition border border-white/10 disabled:opacity-50"
        >
          Keep Ride
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={!finalReason || isPending}
          className="px-4 py-2 text-sm font-medium text-red-300 bg-red-500/15 border border-red-500/30 rounded-xl hover:bg-red-500/25 transition disabled:opacity-50"
        >
          {isPending ? 'Cancelling...' : confirmText}
        </button>
      </div>
    </Modal>
  );
};

export default CancelReasonDialog;
