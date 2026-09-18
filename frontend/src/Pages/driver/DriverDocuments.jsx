import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, Pencil } from 'lucide-react';
import { driverAPI, driverUploadAPI } from '../../services/endpoints';
import ErrorState from '../../components/shared/ErrorState';
import { motion as Motion } from 'framer-motion';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const documentTypes = [
  { key: 'profilePhoto', label: 'Profile Photo', accept: 'image/*' },
  { key: 'drivingLicense', label: 'Driving License', accept: 'image/*' },
  { key: 'aadhaarFront', label: 'Aadhaar Front', accept: 'image/*' },
  { key: 'aadhaarBack', label: 'Aadhaar Back', accept: 'image/*' },
  { key: 'rcBook', label: 'RC Book', accept: 'image/*' },
  { key: 'insurance', label: 'Insurance', accept: 'image/*' },
  { key: 'pollutionCertificate', label: 'Pollution Certificate', accept: 'image/*' },
];

const validateFile = (file) => {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Invalid file type. Use JPG, PNG, or WEBP.';
  if (file.size > MAX_FILE_SIZE) return 'File too large. Max size is 5MB.';
  return null;
};

const DriverDocuments = () => {
  const queryClient = useQueryClient();
  const [_uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const { data } = await driverAPI.getProfile();
      return data;
    },
    staleTime: 60_000,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ type, file }) => driverUploadAPI.uploadDocument(type, file),
    onMutate: ({ type }) => {
      setUploadProgress((prev) => ({ ...prev, [type]: 0 }));
      setUploadErrors((prev) => {
        const next = { ...prev };
        delete next[type];
        return next;
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded');
      queryClient.invalidateQueries({ queryKey: ['driverProfile'] });
      setUploadProgress({});
    },
    onError: (err, variables) => {
      const msg = err.response?.data?.message || 'Upload failed';
      toast.error(msg);
      setUploadErrors((prev) => ({ ...prev, [variables?.type || 'unknown']: msg }));
      setUploadProgress({});
    },
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load documents'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['driverProfile'] })} />;

  const documents = profile?.data?.documents || {};
  const verificationStatus = documents.documentVerification || 'Pending';
  const approvalStatus = profile?.data?.approvalStatus || 'Pending';

  // Upload reality: the verification flag only flips when an admin acts,
  // so derive what the driver actually sees from uploaded files.
  const uploadedCount = documentTypes.filter((d) => !!documents[d.key]).length;
  const docsComplete = uploadedCount >= documentTypes.length;

  // Docs display: an admin-approved driver shows Approved everywhere;
  // otherwise Verified/Rejected come from admin review, and the rest
  // mirrors upload reality (never a stale "Pending").
  const docsDisplay =
    approvalStatus === 'Approved'
      ? 'Approved'
      : verificationStatus === 'Verified'
        ? 'Verified'
        : verificationStatus === 'Rejected'
          ? 'Rejected'
          : docsComplete
            ? 'Under Review'
            : 'Pending';

  const statusConfig = {
    Pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    'Under Review': { icon: Clock, color: 'text-sky-400', bg: 'bg-sky-500/10' },
    Verified: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    Approved: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  };

  const status = statusConfig[docsDisplay] || statusConfig.Pending;
  const StatusIcon = status.icon;

  const approvalCfg = statusConfig[approvalStatus] || statusConfig.Pending;
  const ApprovalIcon = approvalCfg.icon;

  // Overall: admin approval turns everything Approved; a rejection
  // anywhere wins; otherwise mirror upload reality.
  const overallStatus =
    approvalStatus === 'Approved'
      ? 'Approved'
      : approvalStatus === 'Rejected' || verificationStatus === 'Rejected'
        ? 'Rejected'
        : docsComplete
          ? 'Under Review'
          : verificationStatus === 'Verified'
            ? approvalStatus
            : 'Pending';

  const overallCfg = statusConfig[overallStatus] || statusConfig.Pending;
  const OverallIcon = overallCfg.icon;

  const handleUpload = (doc) => {
    const error = validateFile(doc.file);
    if (error) {
      setUploadErrors((prev) => ({ ...prev, [doc.key]: error }));
      toast.error(error);
      return;
    }
    uploadMutation.mutate({ type: doc.key, file: doc.file }, {
      onMutate: () => {
        setUploadProgress((prev) => ({ ...prev, [doc.key]: 0 }));
        setUploadErrors((prev) => {
          const next = { ...prev };
          delete next[doc.key];
          return next;
        });
      },
    });
  };

  if (isLoading) {
    return <div className="space-y-6"><div className="h-8 bg-white/10 rounded-lg w-48 animate-pulse" /> <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_, i) => <div key={i} className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10 h-48 animate-pulse" />)}</div></div>;
  }

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 sm:space-y-6 min-w-0">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Documents</h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">Verify your identity to start accepting rides.</p>
      </div>

      {/* Overall verification status — hero panel */}
      <div className="relative overflow-hidden rounded-[26px] border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent" />
        <div className="pointer-events-none absolute -top-20 -right-20 w-56 h-56 bg-emerald-500/10 blur-[90px] rounded-full" />
        <div className="relative flex items-center gap-4">
          <span className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 border ${overallStatus === 'Approved' ? 'bg-emerald-500/15 border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : overallStatus === 'Rejected' ? 'bg-red-500/15 border-red-500/30' : 'bg-amber-500/15 border-amber-500/30'}`}>
            <OverallIcon size={24} className={overallCfg.color} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.22em] text-gray-500">Overall status</p>
            <p className={`font-display text-lg sm:text-2xl font-bold tracking-tight truncate ${overallCfg.color}`}>
              {overallStatus === 'Approved' ? 'Approved' : overallStatus}
            </p>
          </div>
          {overallStatus === 'Approved' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shrink-0">
              <CheckCircle size={14} /> Ready to drive
            </span>
          )}
        </div>

        {/* Upload progress */}
        <div className="relative mt-4 sm:mt-5">
          <div className="flex items-center justify-between text-[11px] sm:text-xs mb-1.5">
            <span className="text-gray-400 font-medium">Documents uploaded</span>
            <span className="text-white font-bold tabular-nums">{uploadedCount}/{documentTypes.length}</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
              style={{ width: `${Math.round((uploadedCount / documentTypes.length) * 100)}%` }}
            />
          </div>
        </div>

        {/* Docs vs Approval — always 2 columns, wraps cleanly on phones */}
        <div className="relative grid grid-cols-2 gap-2.5 sm:gap-3 mt-4 sm:mt-5">
          <div className="flex items-center gap-2.5 sm:gap-3 bg-black/25 border border-white/10 rounded-2xl px-3.5 py-3 min-w-0">
            <StatusIcon size={18} className={`${status.color} shrink-0`} />
            <div className="min-w-0 flex-1">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Docs</p>
              <p className={`text-sm font-bold truncate ${status.color}`}>{docsDisplay}</p>
            </div>
            <span className="text-[11px] font-bold text-gray-400 tabular-nums shrink-0">
              {uploadedCount}/{documentTypes.length}
            </span>
          </div>
          <div className="flex items-center gap-2.5 sm:gap-3 bg-black/25 border border-white/10 rounded-2xl px-3.5 py-3 min-w-0">
            <ApprovalIcon size={18} className={`${approvalCfg.color} shrink-0`} />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500 font-semibold">Approval</p>
              <p className={`text-sm font-bold truncate ${approvalCfg.color}`}>{approvalStatus}</p>
            </div>
          </div>
        </div>
      </div>

      {documents.rejectionReason && verificationStatus === 'Rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 sm:p-5 flex gap-3">
          <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-bold text-red-300">Rejection Reason</p>
            <p className="text-sm text-red-300/80 mt-1 break-words">{documents.rejectionReason}</p>
            <p className="text-xs text-red-400/60 mt-2">Fix the issue above and re-upload the document.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
        {documentTypes.map((doc) => {
          const hasDoc = documents[doc.key];
          const isUploading = uploadMutation.isPending && uploadMutation.variables?.type === doc.key;
          const error = uploadErrors[doc.key];

          return (
            <div key={doc.key} className="group relative overflow-hidden bg-white/[0.04] backdrop-blur-lg rounded-[24px] p-5 border border-white/10 hover:border-emerald-500/30 transition-colors">
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <div className="flex items-center gap-3 mb-4">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${hasDoc ? 'bg-emerald-500/15 border-emerald-500/30' : 'bg-white/5 border-white/10 group-hover:border-emerald-500/25'}`}>
                  <FileText size={18} className={hasDoc ? 'text-emerald-400' : 'text-gray-500'} />
                </span>
                <h3 className="font-semibold text-white text-sm sm:text-[15px] leading-snug">{doc.label}</h3>
              </div>

              {hasDoc ? (
                <div className="space-y-3">
                  <div className="relative overflow-hidden rounded-xl border border-white/10">
                    <img src={hasDoc} alt={doc.label} loading="lazy" className="w-full h-32 sm:h-36 object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                    <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/70 backdrop-blur text-emerald-300 border border-emerald-500/30">
                      <CheckCircle size={12} /> Uploaded
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:text-white hover:border-white/20 cursor-pointer transition">
                      <Pencil size={12} /> Replace
                      <input type="file" accept={doc.accept} className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload({ key: doc.key, file }); e.target.value = ''; }} />
                    </label>
                  </div>
                </div>
              ) : error ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 rounded-lg p-3">
                    <AlertCircle size={14} />
                    <span className="flex-1">{error}</span>
                  </div>
                  <div className="flex gap-2">
                    <label className="flex-1 cursor-pointer">
                      <div className="border-2 border-dashed border-red-500/30 rounded-lg p-3 text-center hover:border-red-400 transition text-sm text-red-400">
                        <RefreshCw size={14} className="mx-auto mb-1" />
                        Retry
                      </div>
                      <input type="file" accept={doc.accept} className="hidden"
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) { setUploadErrors((prev) => { const next = { ...prev }; delete next[doc.key]; return next }); handleUpload({ key: doc.key, file }); } }} />
                    </label>
                    <button onClick={() => setUploadErrors((prev) => { const next = { ...prev }; delete next[doc.key]; return next })} className="px-3 py-2 text-sm text-gray-400 hover:text-gray-300 border border-white/10 rounded-lg">Dismiss</button>
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/10 rounded-2xl p-5 sm:p-6 text-center hover:border-emerald-500/50 hover:bg-emerald-500/[0.04] transition-all">
                    <Upload size={22} className="mx-auto text-gray-500 mb-2" />
                    <p className="text-sm font-medium text-gray-300">Click to upload</p>
                    <p className="text-[11px] text-gray-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
                  </div>
                  <input type="file" accept={doc.accept} className="hidden"
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload({ key: doc.key, file }); }} />
                </label>
              )}

              {isUploading && (
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-400">
                  <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin" />
                  Uploading...
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Motion.div>
  );
};

export default DriverDocuments;