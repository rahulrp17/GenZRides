import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Star, MessageSquare } from 'lucide-react';
import { reviewAPI, bookingAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import Modal from '../../components/shared/Modal';

const Reviews = () => {
  const [page, setPage] = useState(1);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const queryClient = useQueryClient();
  const location = useLocation();

  const { register, handleSubmit, reset } = useForm();
  const [rating, setRating] = useState(5);

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['myReviews', page],
    queryFn: async () => {
      const { data } = await reviewAPI.getMyReviews({ page, limit: 10 });
      return data;
    },
  });

  const { data: completedBookings } = useQuery({
    queryKey: ['completedBookingsForReview'],
    queryFn: async () => {
      const { data } = await bookingAPI.getMyBookings({ page: 1, limit: 50 });
      return (data?.bookings || []).filter((b) => b.bookingStatus === 'Completed' && !b.rating);
    },
  });

  // Deep-link from the completed-ride panel ("Rate Your Ride")
  // pre-selects that booking and opens the review modal.
  useEffect(() => {
    const bookingId = location.state?.bookingId;
    if (bookingId && completedBookings?.length) {
      const match = completedBookings.find((b) => b._id === bookingId);
      if (match) {
        setSelectedBooking(match);
        setShowReviewModal(true);
      }
    }
  }, [location.state?.bookingId, completedBookings]);

  const reviewMutation = useMutation({
    mutationFn: (data) => reviewAPI.create(selectedBooking._id, { rating: data.rating, review: data.review }),
    onSuccess: () => {
      toast.success('Review submitted!');
      queryClient.invalidateQueries({ queryKey: ['myReviews'] });
      queryClient.invalidateQueries({ queryKey: ['completedBookingsForReview'] });
      setShowReviewModal(false);
      reset();
      setRating(5);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to submit review'),
  });

  const reviews = reviewsData?.data || [];
  const pagination = reviewsData || {};

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">My Reviews</h1>
        {completedBookings?.length > 0 && (
          <button
            onClick={() => { setSelectedBooking(completedBookings[0]); setShowReviewModal(true); }}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
          >
            Write a Review
          </button>
        )}
      </div>

      {isLoading ? (
        <TableSkeleton rows={3} cols={3} />
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={Star}
          title="No reviews yet"
          description="You haven't left any reviews. Rate your completed rides!"
        />
      ) : (
        <>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={16} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'} />
                      ))}
                    </div>
                    {r.review && <p className="text-sm text-gray-400">{r.review}</p>}
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
                {r.adminReply && (
                  <div className="mt-3 bg-white/5 rounded-lg p-3 border-l-4 border-indigo-400">
                    <p className="text-xs font-semibold text-gray-300 mb-1">Admin Reply</p>
                    <p className="text-sm text-gray-400">{r.adminReply}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Write a Review">
        <form onSubmit={handleSubmit((data) => reviewMutation.mutate(data))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setRating(s); register('rating').onChange({ target: { value: s } }); }}
                  className="p-1"
                >
                  <Star
                    size={28}
                    className={s <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500 hover:text-amber-200'}
                  />
                </button>
              ))}
            </div>
            <input type="hidden" {...register('rating', { required: true, value: rating })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Review (optional)</label>
            <textarea
              {...register('review')}
              rows={3}
              placeholder="Tell us about your experience..."
              className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={reviewMutation.isPending}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
          >
            {reviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </Modal>
    </Motion.div>
  );
};

export default Reviews;
