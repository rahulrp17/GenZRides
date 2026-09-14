import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Lock } from 'lucide-react';
import { userAPI, uploadAPI } from '../../services/endpoints';
import useAuth from '../../hooks/useAuth';
import { motion as Motion } from 'framer-motion';
import ProfileCard from '../../components/profile/ProfileCard';
import EditProfileModal from '../../components/profile/EditProfileModal';

const TABS = [
  { id: 'profile', label: 'Profile', Icon: User },
  { id: 'password', label: 'Password', Icon: Lock },
];

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');
  const [editOpen, setEditOpen] = useState(false);

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const updateMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile({ name: data.name }),
    onSuccess: async () => {
      toast.success('Profile updated');
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      setEditOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data) => userAPI.changePassword(data),
    onSuccess: () => {
      toast.success('Password changed');
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

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Profile Settings</h1>

      <ProfileCard
        name={user?.name}
        email={user?.email}
        phone={user?.phone}
        avatarSrc={user?.profileImage}
        roleLabel="Customer"
        accent="green"
        stats={memberSince ? [{ label: 'Member since', value: memberSince }] : []}
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

      {/* Read-only account details */}
      {activeTab === 'profile' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-[30px] p-6 shadow-sm border border-white/10 space-y-3">
          <h3 className="text-sm font-semibold text-white">Account Details</h3>
          {[
            { label: 'Full Name', value: user?.name || '—' },
            { label: 'Email', value: user?.email || '—' },
            { label: 'Phone', value: user?.phone || '—' },
          ].map((row) => (
            <div key={row.label} className="bg-white/5 rounded-xl px-4 py-3">
              <p className="text-[11px] text-gray-500 uppercase tracking-wider">{row.label}</p>
              <p className="font-medium text-white mt-0.5 break-words">{row.value}</p>
            </div>
          ))}
          <p className="text-xs text-gray-500">Email and phone are managed by support — only your name can be changed here.</p>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-[30px] p-6 shadow-sm border border-white/10">
          <form onSubmit={handleSubmitPassword((data) => passwordMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Required' })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
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
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 min-h-[44px] bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
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
        accent="green"
        defaultValues={{ name: user?.name || '' }}
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
          { name: 'phone', label: 'Phone', readOnly: true, readOnlyValue: user?.phone || 'Not set', readOnlyNote: 'Phone cannot be changed here' },
        ]}
        isPending={updateMutation.isPending}
        onSubmit={(values) => updateMutation.mutateAsync({ name: values.name })}
      />
    </Motion.div>
  );
};

export default Profile;
