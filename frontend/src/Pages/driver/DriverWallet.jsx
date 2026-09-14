import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { driverAPI } from '../../services/endpoints';
import { TableSkeleton, CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import Modal from '../../components/shared/Modal';

const DriverWallet = () => {
  const [page, setPage] = useState(1);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: wallet, isLoading: loadingWallet, isError: walletError, error: walletErr } = useQuery({
    queryKey: ['driverWallet'],
    queryFn: async () => {
      const { data } = await driverAPI.getWallet();
      return data;
    },
    staleTime: 30_000,
  });

  const { data: transactions, isLoading: loadingTx, isError: txError, error: txErr } = useQuery({
    queryKey: ['walletHistory', page],
    queryFn: async () => {
      const { data } = await driverAPI.getWalletHistory({ page, limit: 15 });
      return data;
    },
    staleTime: 30_000,
  });

  if (walletError || txError) return <ErrorState message={walletErr?.message || txErr?.message || 'Failed to load wallet'} onRetry={() => { queryClient.invalidateQueries({ queryKey: ['driverWallet'] }); queryClient.invalidateQueries({ queryKey: ['walletHistory'] }); }} />;

  const withdrawMutation = useMutation({
    mutationFn: (data) => driverAPI.requestWithdrawal(data),
    onSuccess: () => {
      toast.success('Withdrawal request submitted');
      queryClient.invalidateQueries({ queryKey: ['driverWallet'] });
      queryClient.invalidateQueries({ queryKey: ['walletHistory'] });
      setShowWithdraw(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const walletData = wallet?.data || {};
  const txList = transactions?.data?.transactions || transactions?.transactions || [];
  const pagination = transactions?.pagination || {};

  const typeColors = {
    Ride: 'bg-emerald-500/20 text-emerald-400',
    Tip: 'bg-amber-500/20 text-amber-400',
    Bonus: 'bg-blue-500/20 text-blue-400',
    Withdrawal: 'bg-red-500/20 text-red-400',
    Adjustment: 'bg-white/10 text-gray-400',
    Refund: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Wallet</h1>
        <button
          onClick={() => setShowWithdraw(true)}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
        >
          <Plus size={16} /> Withdraw
        </button>
      </div>

      {/* Balance Card */}
      {loadingWallet ? (
        <CardSkeleton />
      ) : (
      <div className="bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl p-6 text-white">
        <Wallet size={24} className="mb-2 opacity-80" />
        <p className="text-sm opacity-80">Available Balance</p>
        <p className="text-3xl font-bold mt-1">₹{(walletData.balance ?? 0).toLocaleString('en-IN')}</p>
        <div className="flex gap-6 mt-4 text-sm">
          <div>
            <p className="opacity-70">Lifetime</p>
            <p className="font-semibold">₹{(walletData.lifetimeEarnings ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="opacity-70">Withdrawn</p>
            <p className="font-semibold">₹{(walletData.totalWithdrawn ?? 0).toLocaleString('en-IN')}</p>
          </div>
          <div>
            <p className="opacity-70">Pending</p>
            <p className="font-semibold">₹{(walletData.pendingWithdrawal ?? 0).toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>
      )}

      {/* Transactions */}
      <div className="bg-white/5 rounded-2xl shadow-sm border border-white/10">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold text-white">Transactions</h2>
        </div>
        {loadingTx ? (
          <div className="p-6"><TableSkeleton rows={5} cols={4} /></div>
        ) : txList.length === 0 ? (
          <EmptyState icon={Wallet} title="No transactions" description="Your wallet transactions will appear here." />
        ) : (
          <>
            <div className="divide-y divide-white/10">
              {txList.map((tx, i) => (
                <div key={tx._id || i} className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 hover:bg-white/5 transition min-w-0">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${typeColors[tx.type] || 'bg-white/10'}`}>
                      {['Withdrawal'].includes(tx.type) ? <ArrowUpRight size={18} /> : <ArrowDownLeft size={18} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white">{tx.type}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[40vw] sm:max-w-none">{tx.description || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}₹{Math.abs(tx.amount)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
          </>
        )}
      </div>

      {/* Withdraw Modal */}
      <Modal isOpen={showWithdraw} onClose={() => setShowWithdraw(false)} title="Request Withdrawal">
        <form onSubmit={handleSubmit((data) => withdrawMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Amount (₹)</label>
            <input
              type="number"
              min="1"
              {...register('amount', { required: 'Required', min: { value: 1, message: 'Min ₹1' } })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Bank Name</label>
            <input
              {...register('bankName', { required: 'Required' })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
            />
            {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Account Holder</label>
            <input
              {...register('accountHolder', { required: 'Required' })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Account Number</label>
            <input
              {...register('accountNumber', { required: 'Required' })}
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">IFSC Code</label>
            <input
              {...register('ifscCode', { required: 'Required', pattern: { value: /^[A-Z]{4}0[A-Z0-9]{6}$/, message: 'Invalid IFSC' } })}
              placeholder="XXXX0XXXXXX"
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none uppercase"
            />
            {errors.ifscCode && <p className="text-red-500 text-xs mt-1">{errors.ifscCode.message}</p>}
          </div>
          <button
            type="submit"
            disabled={withdrawMutation.isPending}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
          >
            {withdrawMutation.isPending ? 'Processing...' : 'Submit Request'}
          </button>
        </form>
      </Modal>
    </Motion.div>
  );
};

export default DriverWallet;
