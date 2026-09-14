import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { reviewAPI } from '../../services/endpoints';
import { ListSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import { motion as Motion } from 'framer-motion';

const Stars = ({ value = 0, size = 16 }) => (
  <div className="flex items-center gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} size={size} className={i < value ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />
    ))}
  </div>
);

const DriverReviews = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['driverReviews', page],
    queryFn: async () => {
      const { data } = await reviewAPI.getDriverReviews({ page, limit: 10 });
      return data;
    },
    staleTime: 5 * 60_000,
  });

  const reviews = data?.data || [];
  const pagination = data || {};

  const summary = useMemo(() => {
    if (!reviews.length) return null;
    const avg = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length;
    return { avg, count: pagination.total || reviews.length };
  }, [reviews, pagination.total]);

  if (isError) return <ErrorState message={error?.message || 'Failed to load reviews'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['driverReviews'] })} />;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Reviews</h1>

      {!isLoading && summary && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-5 flex items-center gap-4">
          <p className="text-3xl font-bold text-white">{summary.avg.toFixed(1)}</p>
          <div>
            <Stars value={Math.round(summary.avg)} />
            <p className="text-xs text-gray-400 mt-1">Based on {summary.count} review{summary.count !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : reviews.length === 0 ? (
        <EmptyState icon={Star} title="No reviews yet" description="Reviews from customers will appear here." />
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <Stars value={r.rating} />
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                {r.review && <p className="text-sm text-gray-400">{r.review}</p>}
                {r.customer && (
                  <p className="text-xs text-gray-500 mt-2">
                    by {r.customer.name || 'Customer'}
                  </p>
                )}
              </div>
            ))}
          </div>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}
    </Motion.div>
  );
};

export default DriverReviews;
