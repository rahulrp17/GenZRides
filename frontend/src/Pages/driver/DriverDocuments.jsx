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
  const [uploadProgress, setUploadProgress] = useState({});
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

  const statusConfig = {
    Pending: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    Verified: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    Rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  };

  const status = statusConfig[verificationStatus] || statusConfig.Pending;
  const StatusIcon = status.icon;

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
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Documents</h1>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${status.bg} ${status.color}`}>
          <StatusIcon size={16} />
          {verificationStatus}
        </div>
      </div>

      {documents.rejectionReason && verificationStatus === 'Rejected' && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm font-medium text-red-400">Rejection Reason</p>
          <p className="text-sm text-red-400 mt-1">{documents.rejectionReason}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {documentTypes.map((doc) => {
          const hasDoc = documents[doc.key];
          const isUploading = uploadMutation.isPending && uploadMutation.variables?.type === doc.key;
          const error = uploadErrors[doc.key];

          return (
            <div key={doc.key} className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <FileText size={20} className="text-gray-500" />
                <h3 className="font-medium text-white">{doc.label}</h3>
              </div>

              {hasDoc ? (
                <div className="space-y-3">
                  <img src={hasDoc} alt={doc.label} className="w-full h-32 object-cover rounded-lg border border-white/10" />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-emerald-400">
                      <CheckCircle size={14} /> Uploaded
                    </div>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:text-white cursor-pointer transition">
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
                  <div className="border-2 border-dashed border-white/10 rounded-lg p-6 text-center hover:border-indigo-400 transition">
                    <Upload size={24} className="mx-auto text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">Click to upload</p>
                    <p className="text-xs text-slate-200/60 mt-1">JPG, PNG, WEBP (max 5MB)</p>
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