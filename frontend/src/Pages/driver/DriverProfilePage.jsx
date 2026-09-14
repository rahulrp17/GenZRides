import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Lock, Car } from 'lucide-react';
import { driverAPI, userAPI, uploadAPI } from '../../services/endpoints';
import useAuth from '../../hooks/useAuth';
import { CardSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import ProfileCard from '../../components/profile/ProfileCard';
import EditProfileModal from '../../components/profile/EditProfileModal';

const TABS = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'vehicle', label: 'Vehicle', Icon: Car },
  { id: 'password', label: 'Password', Icon: Lock },
];

const STATUS_TONE = {
  Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  Approved: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  Rejected: 'bg-red-500/15 text-red-300 border-red-500/25',
};

const MAX_YEAR = new Date().getFullYear() + 1;

const DriverProfile = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [editOpen, setEditOpen] = useState(false);

  const { data: profile, isLoading, isError, error } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const { data } = await driverAPI.getProfile();
      return data;
    },
    staleTime: 60_000,
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const updateMutation = useMutation({
    mutationFn: async ({ name, vehicle }) => {
      // Two backend-supported updates: user name + driver vehicle fields.
      const calls = [];
      if (name !== undefined) calls.push(userAPI.updateProfile({ name }));
      if (vehicle && Object.keys(vehicle).length > 0) calls.push(driverAPI.updateProfile(vehicle));
      await Promise.all(calls);
    },
    onSuccess: async () => {
      toast.success('Profile updated');
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['driverProfile'] });
      setEditOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed successfully');
      resetPassword();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to change password'),
  });

  const imageMutation = useMutation({
    mutationFn: (file) => uploadAPI.profileImage(file),
    onSuccess: async () => {
      toast.success('Profile photo updated');
      await refreshUser();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pt-2 sm:pt-4">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  if (isError) return <ErrorState message={error?.message || 'Failed to load profile'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['driverProfile'] })} />;

  const d = profile?.data || {};
  const vehicleType = typeof d.vehicleType === 'object' ? d.vehicleType : null;

  const badges = [];
  if (d.approvalStatus) {
    badges.push({ label: d.approvalStatus, className: STATUS_TONE[d.approvalStatus] || 'bg-white/5 text-gray-300 border-white/10' });
  }
  if (d.isOnline) badges.push({ label: 'Online', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' });
  if (d.documents?.documentVerification && d.documents.documentVerification !== 'Pending') {
    badges.push({ label: `Docs: ${d.documents.documentVerification}` });
  }

  const stats = [];
  if (d.rating != null) stats.push({ label: 'Rating', value: Number(d.rating).toFixed(1) });
  if (d.completedTrips != null || d.totalTrips != null) {
    stats.push({ label: 'Trips', value: `${d.completedTrips ?? 0}/${d.totalTrips ?? 0}` });
  }
  if (vehicleType?.seats) stats.push({ label: 'Seats', value: vehicleType.seats });
  if (vehicleType?.name) stats.push({ label: 'Cab Type', value: vehicleType.name });

  const editDefaults = {
    name: user?.name || '',
    vehicleBrand: d.vehicleBrand || '',
    vehicleModel: d.vehicleModel || '',
    vehicleColor: d.vehicleColor || '',
    vehicleYear: d.vehicleYear ?? '',
  };

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6 pt-2 sm:pt-4">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Driver Profile</h1>

      <ProfileCard
        name={user?.name}
        email={user?.email}
        phone={user?.phone}
        avatarSrc={user?.profileImage || d.documents?.profilePhoto}
        roleLabel="Driver"
        badges={badges}
        stats={stats}
        accent="emerald"
        onEdit={() => setEditOpen(true)}
        onAvatarChange={(file) => imageMutation.mutate(file)}
        uploading={imageMutation.isPending}
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-white/10 rounded-xl p-1" role="tablist" aria-label="Profile sections">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 justify-center py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition ${
              activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.Icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Account details (read-only, from backend) */}
      {activeTab === 'profile' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-[30px] p-6 shadow-sm border border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-white">Account Details</h3>
          {[
            { label: 'Full Name', value: user?.name || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Phone', value: user?.phone || '—' },
            { label: 'License Number', value: d.licenseNumber || '—' },
            { label: 'Aadhaar', value: d.aadhaarNumber ? `**** **** ${String(d.aadhaarNumber).slice(-4)}` : '—' },
          ].map((row) => (
            <div key={row.label} className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{row.label}</p>
              <p className="font-medium text-white mt-0.5 break-words">{row.value}</p>
            </div>
          ))}
          <p className="text-xs text-gray-500">License and identity details are verified by support — only name and vehicle info can be edited here.</p>
        </div>
      )}

      {/* Vehicle details (read-only snapshot; editable fields live in Update Profile) */}
      {activeTab === 'vehicle' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-[30px] p-6 shadow-sm border border-white/10 space-y-3">
          <div className="flex items-center gap-2">
            <Car size={18} className="text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Vehicle Details</h3>
          </div>
          {vehicleType && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Vehicle Type</p>
              <p className="text-sm font-semibold text-emerald-400">{vehicleType.name || 'N/A'}</p>
              {vehicleType.seats && <p className="text-xs text-gray-400 mt-0.5">{vehicleType.seats} seats</p>}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Brand', value: d.vehicleBrand || '—' },
              { label: 'Model', value: d.vehicleModel || '—' },
              { label: 'Color', value: d.vehicleColor || '—' },
              { label: 'Year', value: d.vehicleYear || '—' },
              { label: 'Vehicle Number', value: d.vehicleNumber || '—' },
              { label: 'Seats', value: d.seats ?? '—' },
            ].map((row) => (
              <div key={row.label} className="bg-white/5 rounded-xl px-4 py-3 min-w-0">
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">{row.label}</p>
                <p className="font-medium text-white mt-0.5 truncate">{row.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password */}
      {activeTab === 'password' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-[30px] p-6 shadow-sm border border-white/10">
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-300">Change Password</h3>
            <p className="text-xs text-gray-500 mt-0.5">You will remain logged in after changing your password.</p>
          </div>
          <form onSubmit={handleSubmitPassword((data) => passwordMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Required' })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              />
              {passwordErrors.currentPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input
                type="password"
                {...registerPassword('newPassword', {
                  required: 'Required',
                  minLength: { value: 8, message: 'Min 8 characters' },
                  pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must include uppercase, lowercase, and number' },
                })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none"
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Lock size={16} /> {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}

      <EditProfileModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Update Profile"
        accent="emerald"
        defaultValues={editDefaults}
        fields={[
          {
            name: 'name',
            label: 'Full Name',
            placeholder: 'Your name',
            validation: {
              required: 'Name is required',
              minLength: { value: 2, message: 'Min 2 characters' },
              maxLength: { value: 50, message: 'Max 50 characters' },
            },
          },
          { name: 'email', label: 'Email', readOnly: true, readOnlyValue: user?.email, readOnlyNote: 'Email cannot be changed' },
          {
            name: 'vehicleBrand',
            label: 'Vehicle Brand',
            placeholder: 'e.g. Maruti',
            validation: { required: 'Brand is required' },
          },
          {
            name: 'vehicleModel',
            label: 'Vehicle Model',
            placeholder: 'e.g. Swift',
            validation: { required: 'Model is required' },
          },
          {
            name: 'vehicleColor',
            label: 'Vehicle Color',
            placeholder: 'e.g. White',
            validation: { required: 'Color is required' },
          },
          {
            name: 'vehicleYear',
            label: 'Vehicle Year',
            type: 'number',
            placeholder: `1990–${MAX_YEAR}`,
            validation: {
              required: 'Year is required',
              min: { value: 1990, message: 'Must be 1990 or later' },
              max: { value: MAX_YEAR, message: `Must be ${MAX_YEAR} or earlier` },
            },
          },
          { name: 'vehicleNumber', label: 'Vehicle Number', readOnly: true, readOnlyValue: d.vehicleNumber || '—', readOnlyNote: 'Set at registration — contact support to change' },
        ]}
        isPending={updateMutation.isPending}
        onSubmit={(values) =>
          updateMutation.mutateAsync({
            name: values.name,
            vehicle: {
              vehicleBrand: values.vehicleBrand,
              vehicleModel: values.vehicleModel,
              vehicleColor: values.vehicleColor,
              vehicleYear: values.vehicleYear,
            },
          })
        }
      />
    </Motion.div>
  );
};

export default DriverProfile;
