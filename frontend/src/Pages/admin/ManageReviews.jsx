import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Star, Eye, EyeOff, Trash2 } from 'lucide-react';
import { adminAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion as Motion } from 'framer-motion';

const ManageReviews = () => {
  const [page, setPage] = useState(1);
  const [ratingFilter, setRatingFilter] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminReviews', page, ratingFilter],
    queryFn: async () => {
      const params = { page, limit: 10 };
      if (ratingFilter) params.rating = ratingFilter;
      const { data } = await adminAPI.getReviews(params);
      return data;
    },
    staleTime: 30_000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load reviews'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['adminReviews'] })} />;

  const hideMutation = useMutation({
    mutationFn: (id) => adminAPI.hideReview(id),
    onSuccess: () => { toast.success('Review hidden'); queryClient.invalidateQueries({ queryKey: ['adminReviews'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to hide review'),
  });

  const unhideMutation = useMutation({
    mutationFn: (id) => adminAPI.unhideReview(id),
    onSuccess: () => { toast.success('Review unhidden'); queryClient.invalidateQueries({ queryKey: ['adminReviews'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to unhide review'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteReview(id),
    onSuccess: () => { toast.success('Review deleted'); queryClient.invalidateQueries({ queryKey: ['adminReviews'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete review'),
  });

  const reviews = data?.reviews || [];
  const pagination = data || {};

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Manage Reviews</h1>
        <select
          value={ratingFilter}
          onChange={(e) => { setRatingFilter(e.target.value); setPage(1); }}
          className="w-full sm:w-auto px-3 py-2 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl text-sm outline-none"
        >
          <option value="" className="bg-gray-900">All Ratings</option>
          {[5, 4, 3, 2, 1].map((r) => (
            <option key={r} value={r} className="bg-gray-900">{r} Stars</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" />
      ) : (
        <>
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Rating</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Review</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reviews.map((r) => (
                  <tr key={r._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4 text-sm text-white">{r.customer?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{r.driver?.user?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={14} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-[200px] truncate">{r.review || 'N/A'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${r.isHidden ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {r.isHidden ? 'Hidden' : 'Visible'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => r.isHidden ? unhideMutation.mutate(r._id) : hideMutation.mutate(r._id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                          title={r.isHidden ? 'Unhide' : 'Hide'}
                        >
                          {r.isHidden ? <Eye size={16} className="text-emerald-400" /> : <EyeOff size={16} className="text-amber-400" />}
                        </button>
                        <button onClick={() => setDeleteId(r._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
          </div>

          {/* Mobile cards — stacked layout where the table cannot fit */}
          <div className="md:hidden space-y-3">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-4 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2 min-w-0">
                  <div className="flex items-center gap-1 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${r.isHidden ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {r.isHidden ? 'Hidden' : 'Visible'}
                  </span>
                </div>
                <p className="text-sm font-medium text-white truncate">{r.customer?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 mb-1">Driver: {r.driver?.user?.name || 'N/A'}</p>
                {r.review && <p className="text-sm text-gray-300 mb-3 break-words">{r.review}</p>}
                <div className="flex gap-2">
                  <button
                    onClick={() => r.isHidden ? unhideMutation.mutate(r._id) : hideMutation.mutate(r._id)}
                    className="flex-1 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-xs font-medium hover:bg-white/10 transition"
                  >
                    {r.isHidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button onClick={() => setDeleteId(r._id)} aria-label="Delete review" className="py-2 px-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Review"
        message="This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </Motion.div>
  );
};

export default ManageReviews;
