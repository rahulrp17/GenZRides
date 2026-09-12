import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, Wallet, Eye, Calendar } from 'lucide-react';
import { paymentAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import Modal from '../../components/shared/Modal';
import { motion as Motion } from 'framer-motion';

const Payments = () => {
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['paymentHistory', page],
    queryFn: async () => {
      const { data } = await paymentAPI.getHistory({ page, limit: 10 });
      return data;
    },
  });

  const payments = data?.payments || [];
  const pagination = data || {};

  const statusColors = {
    Created: 'bg-white/10 text-gray-400',
    Paid: 'bg-emerald-500/10 text-emerald-400',
    Failed: 'bg-red-500/10 text-red-400',
    Refunded: 'bg-amber-500/10 text-amber-400',
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Payment History</h1>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : payments.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments yet" description="Your payment history will appear here." />
      ) : (
        <>
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Method</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-white">₹{(p.amount / 100).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{p.method || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => setSelectedPayment(p)} className="p-1.5 hover:bg-white/10 rounded-lg transition">
                        <Eye size={16} className="text-gray-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {payments.map((p) => (
              <div key={p._id} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 shadow-sm border border-white/10 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1 min-w-0">
                  <span className="text-sm font-semibold text-white shrink-0">₹{(p.amount / 100).toFixed(2)}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${statusColors[p.status]}`}>{p.status}</span>
                </div>
                <div className="flex items-center justify-between gap-2 text-xs text-gray-400 mb-3">
                  <span className="truncate">{p.method || 'N/A'}</span>
                  <span className="shrink-0">{new Date(p.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
                <button onClick={() => setSelectedPayment(p)} className="w-full py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition">
                  <Eye size={14} /> View Details
                </button>
              </div>
            ))}
          </div>

          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!selectedPayment} onClose={() => setSelectedPayment(null)} title="Payment Details">
        {selectedPayment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-400">Amount</p>
                <p className="text-lg font-bold text-white">₹{(selectedPayment.amount / 100).toFixed(2)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-400">Status</p>
                <p className="font-medium">{selectedPayment.status}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-400">Method</p>
                <p className="font-medium">{selectedPayment.method || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-xs text-gray-400">Gateway</p>
                <p className="font-medium">{selectedPayment.gateway}</p>
              </div>
              {selectedPayment.razorpayOrderId && (
                <div className="bg-white/5 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-gray-400">Order ID</p>
                  <p className="font-medium text-xs break-all">{selectedPayment.razorpayOrderId}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </Motion.div>
  );
};

export default Payments;
