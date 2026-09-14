import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { Users, Eye, Ban, CheckCircle, Trash2, Search } from 'lucide-react';
import { adminAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import SearchBar from '../../components/shared/SearchBar';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion as Motion } from 'framer-motion';

const ManageCustomers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: null, id: null, title: '', message: '' });
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminCustomers', page, search],
    queryFn: async () => {
      const { data } = await adminAPI.getCustomers({ page, limit: 10, search });
      return data;
    },
    staleTime: 30_000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load customers'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['adminCustomers'] })} />;

  const blockMutation = useMutation({
    mutationFn: (id) => adminAPI.blockCustomer(id),
    onSuccess: () => { toast.success('Customer blocked'); queryClient.invalidateQueries({ queryKey: ['adminCustomers'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => adminAPI.unblockCustomer(id),
    onSuccess: () => { toast.success('Customer unblocked'); queryClient.invalidateQueries({ queryKey: ['adminCustomers'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteCustomer(id),
    onSuccess: () => { toast.success('Customer deleted'); queryClient.invalidateQueries({ queryKey: ['adminCustomers'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const customers = data?.customers || [];
  const pagination = data || {};

  const handleAction = (action, id) => {
    const actions = {
      block: { title: 'Block Customer', message: 'This customer will not be able to use the platform.' },
      unblock: { title: 'Unblock Customer', message: 'Restore this customer\'s access.' },
      delete: { title: 'Delete Customer', message: 'This action cannot be undone.' },
    };
    setActionDialog({ open: true, action, id, ...actions[action] });
  };

  const confirmAction = () => {
    if (actionDialog.action === 'block') blockMutation.mutate(actionDialog.id);
    else if (actionDialog.action === 'unblock') unblockMutation.mutate(actionDialog.id);
    else if (actionDialog.action === 'delete') deleteMutation.mutate(actionDialog.id);
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Manage Customers</h1>
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search customers..." />
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" description="No customers match your search." />
      ) : (
        <>
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Name</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Email</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Phone</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                          <span className="text-green-400 font-semibold text-sm">{c.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <span className="text-sm font-medium text-white">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{c.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{c.phone}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${c.isBlocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {c.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedCustomer(c)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl" title="View">
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleAction(c.isBlocked ? 'unblock' : 'block', c._id)}
                          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"
                          title={c.isBlocked ? 'Unblock' : 'Block'}
                        >
                          {c.isBlocked ? <CheckCircle size={16} className="text-emerald-400" /> : <Ban size={16} className="text-amber-400" />}
                        </button>
                        <button onClick={() => handleAction('delete', c._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="md:hidden space-y-3">
            {customers.map((c) => (
              <div key={c._id} className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                      <span className="text-green-400 font-semibold text-xs">{c.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <span className="font-medium text-white">{c.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isBlocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                    {c.isBlocked ? 'Blocked' : 'Active'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 truncate mb-1">{c.email}</p>
                <p className="text-xs text-gray-500 mb-3">{c.phone || '—'}</p>
                <button onClick={() => setSelectedCustomer(c)} className="w-full mb-2 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition">
                  <Eye size={14} /> View Details
                </button>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(c.isBlocked ? 'unblock' : 'block', c._id)} className="flex-1 py-2 text-sm bg-white/5 text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition">
                    {c.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button onClick={() => handleAction('delete', c._id)} aria-label="Delete customer" className="py-2 px-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/30 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!selectedCustomer} onClose={() => setSelectedCustomer(null)} title="Customer Details">
        {selectedCustomer && (
          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Name</p><p className="font-medium text-white">{selectedCustomer.name}</p></div>
            <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Email</p><p className="font-medium text-white">{selectedCustomer.email}</p></div>
            <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-white">{selectedCustomer.phone}</p></div>
            <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Status</p><p className="font-medium text-white">{selectedCustomer.isBlocked ? 'Blocked' : 'Active'}</p></div>
            <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Joined</p><p className="font-medium text-white">{new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN')}</p></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={actionDialog.open}
        onClose={() => setActionDialog({ open: false })}
        onConfirm={confirmAction}
        title={actionDialog.title}
        message={actionDialog.message}
        confirmText={actionDialog.action === 'delete' ? 'Delete' : actionDialog.action === 'block' ? 'Block' : 'Unblock'}
        variant={actionDialog.action === 'delete' ? 'danger' : actionDialog.action === 'block' ? 'warning' : 'success'}
      />
    </Motion.div>
  );
};

export default ManageCustomers;
