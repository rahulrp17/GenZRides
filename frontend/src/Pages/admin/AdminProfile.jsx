import React, { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Camera, Lock, Save, Mail, Phone, Shield } from 'lucide-react';
import { authAPI, userAPI, uploadAPI } from '../../services/endpoints';
import useAuth from '../../hooks/useAuth';
import { motion as Motion } from 'framer-motion';

const AdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profileData } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const { data } = await authAPI.getProfile();
      return data;
    },
  });

  const profile = profileData?.data || user;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: profile?.name || '' },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  const profileMutation = useMutation({
    mutationFn: (data) => userAPI.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated');
      refreshUser();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
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
    onSuccess: () => {
      toast.success('Profile image updated');
      refreshUser();
    },
    onError: () => toast.error('Upload failed'),
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Admin Profile</h1>

      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-violet-400">{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-violet-500 text-white rounded-full cursor-pointer hover:bg-violet-600 transition">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && imageMutation.mutate(e.target.files[0])} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded-full text-xs font-medium mt-1">
              <Shield size={10} /> Admin
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/10 rounded-xl p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 flex-1 justify-center py-2.5 rounded-lg text-sm font-medium transition ${
              activeTab === tab.id ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {activeTab === 'profile' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
          <form onSubmit={handleSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
              <input
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <div className="flex items-center gap-2 w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-gray-400">
                <Mail size={16} className="text-gray-500" />
                {profile?.email || user?.email}
              </div>
              <p className="text-xs text-slate-200/60 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <div className="flex items-center gap-2 w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-gray-400">
                <Phone size={16} className="text-gray-500" />
                {profile?.phone || 'Not set'}
              </div>
            </div>
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
            >
              <Save size={16} /> {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
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
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
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
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none"
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all disabled:opacity-50"
            >
              <Lock size={16} /> {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </Motion.div>
  );
};

export default AdminProfile;
