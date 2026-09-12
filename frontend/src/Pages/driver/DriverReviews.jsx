import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import { reviewAPI } from '../../services/endpoints';
import { ListSkeleton } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import { useState } from 'react';
import { motion as Motion } from 'framer-motion';

const DriverReviews = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['driverReviews', page],
    queryFn: async () => {
      const { data } = await reviewAPI.getDriverReviews({ page, limit: 10 });
      return data;
    },
  });

  const reviews = data?.data || [];
  const pagination = data || {};

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Reviews</h1>

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
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-600'} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
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
