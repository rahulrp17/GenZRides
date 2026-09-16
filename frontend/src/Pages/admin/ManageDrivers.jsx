import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useSocket } from '../../Context/SocketContext';
import { Car, Eye, CheckCircle, XCircle, Ban, Trash2, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { adminAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Pagination from '../../components/shared/Pagination';
import SearchBar from '../../components/shared/SearchBar';
import useDebounce from '../../hooks/useDebounce';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import Badge from '../../components/shared/Badge';
import { motion as Motion } from 'framer-motion';

// Backend contract differs per tab: "all" returns
// { drivers: [{ user, profile }] } while pending/approved/rejected return
// DriverProfile[] directly. Normalize to a flat DriverProfile with .user.
const normalizeDriver = (d) => {
  if (!d) return d;
  if (d.profile) return { ...d.profile, user: d.user };
  return d;
};

const ManageDrivers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  // Debounce typing → one request per pause, not one per keystroke.
  const debouncedSearch = useDebounce(search, 300);
  const [tab, setTab] = useState('all');
  const [selectedDriverId, setSelectedDriverId] = useState(null);
  const [actionDialog, setActionDialog] = useState({ open: false, action: null, id: null, title: '', message: '' });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [expandedDoc, setExpandedDoc] = useState(null);
  const queryClient = useQueryClient();
  const { socket } = useSocket();

  // New driver registrations appear in real time (backend notifies admins
  // on profile creation, and list changes refresh instantly).
  useEffect(() => {
    if (!socket) return;
    const handleDriverUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ['adminDrivers'] });
    };
    socket.on('notification', handleDriverUpdate);
    return () => {
      socket.off('notification', handleDriverUpdate);
    };
  }, [socket, queryClient]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminDrivers', page, debouncedSearch, tab],
    queryFn: async () => {
      const params = { page, limit: 10, search: debouncedSearch };
      if (tab === 'pending') return (await adminAPI.getPendingDrivers()).data;
      if (tab === 'approved') return (await adminAPI.getApprovedDrivers()).data;
      if (tab === 'rejected') return (await adminAPI.getRejectedDrivers()).data;
      const { data } = await adminAPI.getDrivers(params);
      return data;
    },
    staleTime: 30_000,
  });

  // Full detail for the modal — shows every backend field (profile, phone,
  // email, vehicle, stats, documents) instead of the partial list row.
  const { data: driverDetailData, isLoading: detailLoading } = useQuery({
    queryKey: ['adminDriver', selectedDriverId],
    queryFn: async () => {
      const { data } = await adminAPI.getDriver(selectedDriverId);
      return data;
    },
    enabled: !!selectedDriverId,
  });

  const approveMutation = useMutation({
    mutationFn: (id) => adminAPI.approveDriver(id),
    onSuccess: () => { toast.success('Driver approved'); queryClient.invalidateQueries({ queryKey: ['adminDrivers'] }); queryClient.invalidateQueries({ queryKey: ['approvedDrivers'] }); setSelectedDriverId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve driver'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.rejectDriver(id, { reason }),
    onSuccess: () => { toast.success('Driver rejected'); queryClient.invalidateQueries({ queryKey: ['adminDrivers'] }); setShowRejectModal(false); setRejectReason(''); setRejectId(null); setSelectedDriverId(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const blockMutation = useMutation({
    mutationFn: (id) => adminAPI.blockDriver(id),
    onSuccess: () => { toast.success('Driver blocked'); queryClient.invalidateQueries({ queryKey: ['adminDrivers'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to block driver'),
  });

  const unblockMutation = useMutation({
    mutationFn: (id) => adminAPI.unblockDriver(id),
    onSuccess: () => { toast.success('Driver unblocked'); queryClient.invalidateQueries({ queryKey: ['adminDrivers'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to unblock driver'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteDriver(id),
    onSuccess: () => { toast.success('Driver deleted'); queryClient.invalidateQueries({ queryKey: ['adminDrivers'] }); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete driver'),
  });

  const drivers = (data?.drivers || []).map(normalizeDriver);
  const pagination = data || {};
  const listSelected = selectedDriverId ? drivers.find((d) => d._id === selectedDriverId) : null;
  // Prefer the full backend detail; fall back to the normalized list row.
  const selectedDriver = normalizeDriver(driverDetailData?.driver) || listSelected || null;

  if (isError) return <ErrorState message={error?.message || 'Failed to load drivers'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['adminDrivers'] })} />;

  const handleAction = (action, id) => {
    const actions = {
      block: { title: 'Block Driver', message: 'This driver will be restricted from the platform.' },
      unblock: { title: 'Unblock Driver', message: 'Restore this driver\'s access.' },
      delete: { title: 'Delete Driver', message: 'This action cannot be undone.' },
    };
    setActionDialog({ open: true, action, id, ...actions[action] });
  };

  const confirmAction = () => {
    if (actionDialog.action === 'block') blockMutation.mutate(actionDialog.id);
    else if (actionDialog.action === 'unblock') unblockMutation.mutate(actionDialog.id);
    else if (actionDialog.action === 'delete') deleteMutation.mutate(actionDialog.id);
  };

  const approvalColors = { Pending: 'warning', Approved: 'success', Rejected: 'danger' };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'rejected', label: 'Rejected' },
  ];

  const docFields = [
    { key: 'profilePhoto', label: 'Profile Photo' },
    { key: 'drivingLicense', label: 'Driving License' },
    { key: 'aadhaarFront', label: 'Aadhaar Front' },
    { key: 'aadhaarBack', label: 'Aadhaar Back' },
    { key: 'rcBook', label: 'RC Book' },
    { key: 'insurance', label: 'Insurance' },
    { key: 'pollutionCertificate', label: 'Pollution Certificate' },
  ];

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Manage Drivers</h1>
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search drivers..." />
        </div>
      </div>

      <div className="flex gap-1 bg-white/5 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setPage(1); }}
            className={`flex-1 min-w-0 px-2 py-2 rounded-lg text-xs sm:text-sm font-medium transition truncate ${tab === t.id ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : drivers.length === 0 ? (
        <EmptyState icon={Car} title="No drivers found" description="No drivers match your criteria." />
      ) : (
        <>
          <div className="hidden md:block bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="bg-white/5 border-b border-white/5">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Driver</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Vehicle</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Approval</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Rating</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-green-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {drivers.map((d) => (
                  <tr key={d._id} className="border-b border-white/5 hover:bg-white/5 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {d.user?.profileImage ? (
                          <img src={d.user.profileImage} alt={d.user?.name || 'Driver'} className="w-9 h-9 rounded-full object-cover border border-green-500/30" />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                            <span className="text-green-400 font-semibold text-sm">{d.user?.name?.charAt(0)?.toUpperCase() || 'D'}</span>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white">{d.user?.name || 'Driver'}</p>
                          <p className="text-xs text-gray-500">{d.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{d.vehicleBrand} {d.vehicleModel}</td>
                    <td className="px-6 py-4"><Badge variant={approvalColors[d.approvalStatus]}>{d.approvalStatus}</Badge></td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${d.user?.isBlocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                        {d.user?.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{'⭐'} {d.rating?.toFixed(1) || '5.0'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedDriverId(d._id)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl"><Eye size={16} /></button>
                        {d.approvalStatus === 'Pending' && (
                          <>
                            <button onClick={() => approveMutation.mutate(d._id)} className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-xl"><CheckCircle size={16} /></button>
                            <button onClick={() => { setRejectId(d._id); setShowRejectModal(true); }} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-xl"><XCircle size={16} /></button>
                          </>
                        )}
                        <button onClick={() => handleAction(d.user?.isBlocked ? 'unblock' : 'block', d._id)} className="p-1.5 hover:bg-white/5 rounded-xl" title={d.user?.isBlocked ? 'Unblock' : 'Block'}>
                          {d.user?.isBlocked ? <CheckCircle size={16} className="text-emerald-400" /> : <Ban size={16} className="text-amber-400" />}
                        </button>
                        <button onClick={() => handleAction('delete', d._id)} className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-3">
            {drivers.map((d) => (
              <div key={d._id} className="bg-white/5 backdrop-blur-lg rounded-[30px] border border-white/10 p-4 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-2 min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {d.user?.profileImage ? (
                      <img src={d.user.profileImage} alt={d.user?.name || 'Driver'} className="w-8 h-8 rounded-full object-cover border border-green-500/30 shrink-0" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                        <span className="text-green-400 font-semibold text-xs">{d.user?.name?.charAt(0)?.toUpperCase() || 'D'}</span>
                      </div>
                    )}
                    <span className="font-medium text-white truncate">{d.user?.name || 'Driver'}</span>
                  </div>
                  <Badge variant={approvalColors[d.approvalStatus]}>{d.approvalStatus}</Badge>
                </div>
                <p className="text-sm text-gray-400 mb-1 truncate">{d.vehicleBrand} {d.vehicleModel}{d.vehicleColor ? ` · ${d.vehicleColor}` : ''}</p>
                <p className="text-xs text-gray-500 truncate mb-1">{d.user?.email || '—'}{d.user?.phone ? ` · ${d.user.phone}` : ''}</p>
                <p className="text-xs text-gray-500 mb-3">{'⭐'} {d.rating?.toFixed(1) || '5.0'} · {d.user?.isBlocked ? 'Blocked' : d.isOnline ? 'Online' : 'Offline'}</p>
                {d.approvalStatus === 'Pending' && (
                  <div className="flex gap-2 mb-2">
                    <button onClick={() => approveMutation.mutate(d._id)} disabled={approveMutation.isPending} className="flex-1 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-sm font-medium disabled:opacity-50">Approve</button>
                    <button onClick={() => { setRejectId(d._id); setShowRejectModal(true); }} className="flex-1 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-sm font-medium">Reject</button>
                  </div>
                )}
                <button onClick={() => setSelectedDriverId(d._id)} className="w-full py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition"><Eye size={14} /> View Details</button>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => handleAction(d.user?.isBlocked ? 'unblock' : 'block', d._id)} className="flex-1 py-2 bg-white/5 text-gray-300 border border-white/10 rounded-xl text-xs font-medium hover:bg-white/10 transition">
                    {d.user?.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                  <button onClick={() => handleAction('delete', d._id)} className="flex-1 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium hover:bg-red-500/20 transition">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={pagination.page || 1} totalPages={pagination.totalPages || 1} onPageChange={setPage} />
        </>
      )}

      <Modal isOpen={!!selectedDriverId} onClose={() => setSelectedDriverId(null)} title="Driver Details" maxWidth="max-w-2xl">
        {(detailLoading && !selectedDriver ? (
          <p className="text-sm text-gray-400 py-6 text-center">Loading driver details…</p>
        ) : selectedDriver ? (
          <div className="space-y-5">
            {/* Profile header: photo + identity + account status */}
            <div className="flex items-center gap-3 bg-white/5 rounded-xl p-3 border border-white/10">
              {(selectedDriver.user?.profileImage || selectedDriver.documents?.profilePhoto) ? (
                <img
                  src={selectedDriver.user?.profileImage || selectedDriver.documents?.profilePhoto}
                  alt={selectedDriver.user?.name || 'Driver'}
                  className="w-14 h-14 rounded-full object-cover border border-white/10 shrink-0"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center shrink-0">
                  <span className="text-green-400 font-semibold text-lg">{selectedDriver.user?.name?.charAt(0)?.toUpperCase() || 'D'}</span>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white truncate">{selectedDriver.user?.name || 'Driver'}</p>
                <p className="text-xs text-gray-400 truncate">{selectedDriver.user?.email || '—'}</p>
                <p className="text-xs text-gray-400">{selectedDriver.user?.phone || '—'}</p>
              </div>
              <div className="flex flex-col gap-1 items-end shrink-0">
                <Badge variant={approvalColors[selectedDriver.approvalStatus]}>{selectedDriver.approvalStatus}</Badge>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${selectedDriver.user?.isBlocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                  {selectedDriver.user?.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Phone</p><p className="font-medium text-white break-all">{selectedDriver.user?.phone || '—'}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Email</p><p className="font-medium text-white break-all">{selectedDriver.user?.email || '—'}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Rating</p><p className="font-medium text-white">{'⭐'} {selectedDriver.rating?.toFixed(1) || '5.0'} ({selectedDriver.totalRatings ?? 0} ratings)</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Availability</p><p className="font-medium text-white">{selectedDriver.isOnline ? 'Online' : 'Offline'} · {selectedDriver.isAvailable ? 'Available' : 'Busy'}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Trips</p><p className="font-medium text-white">{selectedDriver.completedTrips ?? 0} completed / {selectedDriver.totalTrips ?? 0} total{selectedDriver.completionRate != null ? ` · ${selectedDriver.completionRate}%` : ''}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Earnings</p><p className="font-medium text-white">₹{selectedDriver.totalEarnings ?? 0} total · ₹{selectedDriver.todayEarnings ?? 0} today</p></div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Vehicle Information</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Type</p><p className="font-medium text-white">{selectedDriver.vehicleType?.name || selectedDriver.vehicleType || '—'}</p></div>
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Brand / Model</p><p className="font-medium text-white">{selectedDriver.vehicleBrand} {selectedDriver.vehicleModel}</p></div>
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Color</p><p className="font-medium text-white">{selectedDriver.vehicleColor || '—'}</p></div>
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Year</p><p className="font-medium text-white">{selectedDriver.vehicleYear || '—'}</p></div>
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Number</p><p className="font-medium font-mono text-white">{selectedDriver.vehicleNumber || '—'}</p></div>
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Seats</p><p className="font-medium text-white">{selectedDriver.seats || '—'}</p></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Identity Documents</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">Aadhaar Number</p><p className="font-medium font-mono text-white">{selectedDriver.aadhaarNumber ? `****${String(selectedDriver.aadhaarNumber).slice(-4)}` : '—'}</p></div>
                <div className="bg-white/5 rounded-xl p-3"><p className="text-xs text-gray-500">License Number</p><p className="font-medium font-mono text-white">{selectedDriver.licenseNumber || '—'}</p></div>
              </div>
            </div>

            {selectedDriver.documents && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Uploaded Documents</h4>
                <div className="space-y-2">
                  {docFields.map((doc) => {
                    const src = selectedDriver.documents[doc.key];
                    if (!src) return null;
                    const isExpanded = expandedDoc === doc.key;
                    return (
                      <div key={doc.key} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                        <button onClick={() => setExpandedDoc(isExpanded ? null : doc.key)} className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-gray-500" />
                            <span className="text-sm font-medium text-gray-300">{doc.label}</span>
                            <span className="text-xs text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-1.5 py-0.5 rounded">Uploaded</span>
                          </div>
                          {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
                        </button>
                        {isExpanded && (
                          <div className="px-3 pb-3">
                            <img src={src} alt={doc.label} className="w-full max-h-64 object-contain rounded-xl border border-white/10" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {Object.entries(selectedDriver.documents).filter(([k, v]) => v && k !== 'documentVerification' && k !== 'rejectionReason').length === 0 && (
                    <p className="text-sm text-gray-500 italic">No documents uploaded yet</p>
                  )}
                </div>
              </div>
            )}

            {(selectedDriver.documents?.vehicleImages?.length > 0) && (
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">Vehicle Photos ({selectedDriver.documents.vehicleImages.length})</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedDriver.documents.vehicleImages.map((src, i) => (
                    <img key={i} src={src} alt={`Vehicle ${i + 1}`} className="w-full h-24 object-cover rounded-xl border border-white/10" loading="lazy" />
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-500">
              <div className="bg-white/5 rounded-xl p-3"><p>Verification</p><p className="font-medium text-white text-sm">{selectedDriver.documents?.documentVerification || 'Pending'}</p></div>
              <div className="bg-white/5 rounded-xl p-3"><p>Member since</p><p className="font-medium text-white text-sm">{selectedDriver.createdAt ? new Date(selectedDriver.createdAt).toLocaleDateString('en-IN') : '—'}</p></div>
            </div>
            {selectedDriver.documents?.rejectionReason && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">Rejection reason: {selectedDriver.documents.rejectionReason}</p>
            )}

            {selectedDriver.approvalStatus === 'Pending' && (
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-white/10">
                <button onClick={() => approveMutation.mutate(selectedDriver._id)} disabled={approveMutation.isPending} className="flex-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {approveMutation.isPending ? 'Approving...' : 'Approve Driver'}
                </button>
                <button onClick={() => { setShowRejectModal(true); setRejectId(selectedDriver._id); }} className="flex-1 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-medium hover:bg-red-500/30 transition">
                  Reject
                </button>
              </div>
            )}
          </div>
        ) : null)}
      </Modal>

      <Modal isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectReason(''); }} title="Reject Driver">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Reason for Rejection</label>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} placeholder="Enter reason..."
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none resize-none" />
          </div>
          <button onClick={() => rejectMutation.mutate({ id: rejectId, reason: rejectReason })} disabled={!rejectReason.trim() || rejectMutation.isPending}
            className="w-full py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl font-medium hover:bg-red-500/30 transition disabled:opacity-50">
            {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={actionDialog.open} onClose={() => setActionDialog({ open: false })} onConfirm={confirmAction}
        title={actionDialog.title} message={actionDialog.message}
        confirmText={actionDialog.action === 'delete' ? 'Delete' : actionDialog.action === 'block' ? 'Block' : 'Unblock'}
        variant={actionDialog.action === 'delete' ? 'danger' : actionDialog.action === 'block' ? 'warning' : 'success'} />
    </Motion.div>
  );
};

export default ManageDrivers;
