import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Loader2, RotateCcw, X, ChevronDown } from 'lucide-react';
import Modal from '../shared/Modal';

/**
 * Premium edit-profile modal shared by Customer / Driver / Admin.
 *
 * Props:
 * - open, onClose, title
 * - fields: [{ name, label, type?, placeholder?, hint?, readOnly?,
 *              readOnlyNote?, options?, validation? }]
 * - defaultValues: pre-filled from EXISTING backend data
 * - onSubmit: async (values) => void — page calls the real backend API
 * - submitLabel, accent ('emerald' | 'green' | 'violet')
 *
 * Handles: pre-fill + re-seed when data arrives, validation messages,
 * loading state, cancel, and reset-to-saved.
 */
const ACCENT_RING = {
  emerald: 'focus:ring-emerald-500/30 focus:border-emerald-500',
  green: 'focus:ring-green-500/30 focus:border-green-500',
  violet: 'focus:ring-violet-500/30 focus:border-violet-500',
};

const ACCENT_BTN = {
  emerald: 'from-emerald-500 to-green-600 hover:shadow-[0_0_25px_rgba(16,185,129,0.5)]',
  green: 'from-green-500 to-emerald-600 hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]',
  violet: 'from-violet-500 to-purple-600 hover:shadow-[0_0_25px_rgba(139,92,246,0.5)]',
};

const EditProfileModal = ({
  open,
  onClose,
  title = 'Update Profile',
  fields = [],
  defaultValues = {},
  onSubmit,
  isPending = false,
  submitLabel = 'Save Changes',
  accent = 'emerald',
}) => {
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm({
    defaultValues,
  });

  // Re-seed whenever fresh backend data arrives (e.g. query resolves
  // after mount) — but never while the user has unsaved edits.
  useEffect(() => {
    if (open && !isDirty) reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, JSON.stringify(defaultValues)]);

  const handleReset = () => reset(defaultValues);

  const submit = async (values) => {
    // Coerce numeric fields so zod number() schemas pass.
    const coerced = { ...values };
    fields.forEach((f) => {
      if (f.type === 'number' && coerced[f.name] !== '' && coerced[f.name] != null) {
        const n = Number(coerced[f.name]);
        if (Number.isFinite(n)) coerced[f.name] = n;
      }
    });
    await onSubmit(coerced);
  };

  return (
    <Modal isOpen={open} onClose={onClose} title={title} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit(submit)} className="space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-300 mb-1">{f.label}</label>
            {f.readOnly ? (
              <>
                <div className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-gray-400 truncate">
                  {f.readOnlyValue ?? defaultValues[f.name] ?? '—'}
                </div>
                {f.readOnlyNote && <p className="text-[11px] text-gray-500 mt-1">{f.readOnlyNote}</p>}
              </>
            ) : f.type === 'select' ? (
              <div className="relative">
                <select
                  {...register(f.name, f.validation)}
                  className={`w-full appearance-none pl-4 pr-10 py-2.5 bg-white/[0.06] backdrop-blur-md border border-white/15 text-white rounded-xl outline-none shadow-lg shadow-black/20 cursor-pointer transition-all hover:border-emerald-500/40 hover:bg-white/[0.08] [color-scheme:dark] ${ACCENT_RING[accent]}`}
                >
                  {(f.options || []).map((o) => (
                    <option key={o.value} value={o.value} className="bg-gray-900 text-white">{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-400 pointer-events-none" />
              </div>
            ) : (
              <input
                type={f.type || 'text'}
                placeholder={f.placeholder}
                {...register(f.name, f.validation)}
                className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl outline-none [color-scheme:dark] ${ACCENT_RING[accent]}`}
              />
            )}
            {f.hint && !errors[f.name] && <p className="text-[11px] text-gray-500 mt-1">{f.hint}</p>}
            {errors[f.name] && <p className="text-red-400 text-xs mt-1">{errors[f.name].message}</p>}
          </div>
        ))}

        <div className="flex flex-col-reverse sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending || !isDirty}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] bg-white/5 border border-white/10 text-gray-300 rounded-2xl text-sm font-medium hover:bg-white/10 transition disabled:opacity-40"
          >
            <RotateCcw size={15} /> Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 min-h-[44px] bg-white/5 border border-white/10 text-gray-300 rounded-2xl text-sm font-medium hover:bg-white/10 transition disabled:opacity-40"
          >
            <X size={15} /> Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className={`flex-[2] inline-flex items-center justify-center gap-2 py-2.5 min-h-[44px] bg-gradient-to-r ${ACCENT_BTN[accent]} text-white rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50`}
          >
            {isPending && <Loader2 size={15} className="animate-spin" />}
            {isPending ? 'Saving…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
