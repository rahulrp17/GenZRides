import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Download, Loader2 } from 'lucide-react';
import { bookingAPI, invoiceAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import { toast } from 'react-hot-toast';
import { motion as Motion } from 'framer-motion';

const getInvoiceAmount = (b) =>
  b?.finalFare ?? b?.estimatedFare ?? b?.fare ?? b?.totalAmount ?? 0;

const Invoices = () => {
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['invoiceBookings', page],
    queryFn: async () => {
      const { data } = await bookingAPI.getMyBookings({ page, limit: 10, status: 'Completed' });
      return data;
    },
    staleTime: 30_000,
  });

  // Backend contract: GET /bookings/my-bookings -> { success, bookings, total, page, totalPages }
  // Server-side status=Completed filter keeps pagination totals correct.
  const allBookings = data?.bookings || [];
  const completedBookings = allBookings.filter((b) => b.bookingStatus === 'Completed');
  const totalPages = data?.totalPages || 1;
  const currentPage = data?.page || page;

  const handleDownload = async (bookingId) => {
    if (downloadingId) return;
    setDownloadingId(bookingId);
    let url = null;
    try {
      const response = await invoiceAPI.download(bookingId);
      const contentType = response?.headers?.['content-type'] || '';
      // Backend returns JSON { success:false, message } on error even with blob responseType
      if (contentType.includes('application/json')) {
        const text = await response.data.text();
        let message = 'Failed to download invoice';
        try {
          message = JSON.parse(text)?.message || message;
        } catch {
          /* keep default */
        }
        throw new Error(message);
      }
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: 'application/pdf' });
      url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Invoice downloaded');
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to download invoice');
    } finally {
      if (url) {
        setTimeout(() => window.URL.revokeObjectURL(url), 4000);
      }
      setDownloadingId(null);
    }
  };

  if (isError) {
    return (
      <ErrorState
        message={error?.response?.data?.message || error?.message || 'Failed to load invoices'}
        onRetry={() => queryClient.invalidateQueries({ queryKey: ['invoiceBookings'] })}
      />
    );
  }

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 min-w-0 w-full max-w-full overflow-x-clip">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Invoices</h1>
        <p className="text-sm text-slate-200/80 mt-1">
          {completedBookings.length > 0
            ? `${completedBookings.length} completed ride${completedBookings.length === 1 ? '' : 's'} ready to download`
            : 'Completed rides will generate invoices here.'}
        </p>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={4} />
      ) : completedBookings.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices" description="Completed rides will generate invoices here." />
      ) : (
        <>
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 overflow-hidden max-w-full">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-200 uppercase whitespace-nowrap">Booking ID</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-200 uppercase">Route</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-200 uppercase whitespace-nowrap">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-200 uppercase whitespace-nowrap">Date</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-200 uppercase">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {completedBookings.map((b) => (
                    <tr key={b._id} className="hover:bg-white/5 transition">
                      <td className="px-6 py-4 text-sm font-mono text-slate-200 whitespace-nowrap">{b._id.slice(-8).toUpperCase()}</td>
                      <td className="px-6 py-4 text-sm text-slate-200 min-w-0">
                        <span className="block truncate max-w-[220px]" title={`${b.pickup?.address || ''} → ${b.drop?.address || ''}`}>
                          {b.pickup?.address} → {b.drop?.address}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white whitespace-nowrap">₹{Number(getInvoiceAmount(b) ?? 0).toLocaleString('en-IN')}</td>
                      <td className="px-6 py-4 text-sm text-slate-200 whitespace-nowrap">
                        {new Date(b.completedAt || b.updatedAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownload(b._id)}
                          disabled={downloadingId === b._id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition disabled:opacity-50"
                        >
                          {downloadingId === b._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="md:hidden space-y-3 min-w-0">
            {completedBookings.map((b) => (
              <div key={b._id} className="bg-white/5 backdrop-blur-lg rounded-xl p-4 shadow-sm border border-white/10 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                  <span className="text-xs font-mono text-slate-200 shrink-0">#{b._id.slice(-8).toUpperCase()}</span>
                  <span className="text-sm font-bold text-white shrink-0">₹{Number(getInvoiceAmount(b) ?? 0).toLocaleString('en-IN')}</span>
                </div>
                <p className="text-sm text-slate-200/90 truncate mb-1 min-w-0">{b.pickup?.address} → {b.drop?.address}</p>
                <p className="text-xs text-slate-200/60 mb-3">
                  {new Date(b.completedAt || b.updatedAt).toLocaleDateString('en-IN')}
                </p>
                <button
                  onClick={() => handleDownload(b._id)}
                  disabled={downloadingId === b._id}
                  className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition disabled:opacity-50"
                >
                  {downloadingId === b._id ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download Invoice
                </button>
              </div>
            ))}
          </div>

          <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </Motion.div>
  );
};

export default Invoices;
