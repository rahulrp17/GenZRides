import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Wallet, CheckCircle, XCircle } from 'lucide-react';
import { adminAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion as Motion } from 'framer-motion';

const ManageWithdrawals = () => {
  const [rejectId, setRejectId] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ open: false, action: null, id: null });
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminWithdrawals'],
    queryFn: async () => {
      const { data } = await adminAPI.getWithdrawals();
      return data;
    },
    staleTime: 30_000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load withdrawals'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] })} />;

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveWithdrawal(id),
    onSuccess: () => { toast.success('Withdrawal approved'); queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve withdrawal'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, remarks }) => adminAPI.rejectWithdrawal(id, { remarks }),
    onSuccess: () => { toast.success('Withdrawal rejected'); queryClient.invalidateQueries({ queryKey: ['adminWithdrawals'] }); setShowRejectModal(false); setRejectRemarks(''); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to reject withdrawal'),
  });

  const withdrawals = data?.data || data?.requests || [];
  const statusColors = {
    Pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    Approved: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    Rejected: 'bg-red-500/20 text-red-400 border border-red-500/30',
    Processing: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Withdrawal Requests</h1>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : withdrawals.length === 0 ? (
        <EmptyState icon={Wallet} title="No withdrawal requests" description="Driver withdrawal requests will appear here." />
      ) : (
        <>
        <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-white/5 border-b border-white/5">
                <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Driver</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Bank</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">IFSC</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {withdrawals.map((w) => (
                <tr key={w._id} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="px-6 py-4 text-sm font-medium text-white">{w.driver?.user?.name || 'Driver'}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-white">₹{w.amount}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{w.bankName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-300">{w.ifscCode}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[w.status]}`}>{w.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    {w.status === 'Pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setConfirmAction({ open: true, action: 'approve', id: w._id })}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition"
                        >
                          <CheckCircle size={14} /> Approve
                        </button>
                        <button
                          onClick={() => { setRejectId(w._id); setShowRejectModal(true); }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-medium hover:bg-red-500/30 transition"
                        >
                          <XCircle size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards — stacked layout where the table cannot fit */}
        <div className="md:hidden space-y-3">
          {withdrawals.map((w) => (
            <div key={w._id} className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-4 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{w.driver?.user?.name || 'Driver'}</p>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[w.status]}`}>{w.status}</span>
              </div>
              <p className="text-lg font-bold text-white mb-1">₹{w.amount}</p>
              <p className="text-xs text-gray-500 mb-3 truncate">{w.bankName || '—'} · {w.ifscCode || '—'}</p>
              {w.status === 'Pending' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmAction({ open: true, action: 'approve', id: w._id })}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-medium hover:bg-emerald-500/30 transition"
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button
                    onClick={() => { setRejectId(w._id); setShowRejectModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-medium hover:bg-red-500/30 transition"
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        </>
      )}

      <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Reject Withdrawal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Remarks</label>
            <textarea
              value={rejectRemarks}
              onChange={(e) => setRejectRemarks(e.target.value)}
              rows={3}
              placeholder="Enter reason for rejection..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none resize-none"
            />
          </div>
          <button
            onClick={() => rejectMutation.mutate({ id: rejectId, remarks: rejectRemarks })}
            disabled={!rejectRemarks.trim()}
            className="w-full py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-medium hover:bg-red-500/30 transition disabled:opacity-50"
          >
            Reject Withdrawal
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirmAction.open}
        onClose={() => setConfirmAction({ open: false })}
        onConfirm={() => approveMutation.mutate(confirmAction.id)}
        title="Approve Withdrawal"
        message="Confirm approving this withdrawal request?"
        confirmText="Approve"
        variant="success"
      />
    </Motion.div>
  );
};

export default ManageWithdrawals;
