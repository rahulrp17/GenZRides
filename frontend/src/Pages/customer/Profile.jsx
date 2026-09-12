import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { User, Camera, Lock, Save } from 'lucide-react';
import { userAPI, uploadAPI } from '../../services/endpoints';
import useAuth from '../../hooks/useAuth';
import { motion as Motion } from 'framer-motion';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '', phone: user?.phone || '' },
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
      toast.success('Password changed');
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
    onError: (err) => toast.error(err.response?.data?.message || 'Upload failed'),
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) imageMutation.mutate(file);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Profile Settings</h1>

      {/* Profile Header */}
      <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-green-400">{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-green-500 text-white rounded-full cursor-pointer hover:bg-green-600 transition">
              <Camera size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <span className="inline-flex px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full text-xs font-medium mt-1 capitalize">
              {user?.role}
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
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-gray-400"
              />
              <p className="text-xs text-slate-200/60 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
              <input
                value={user?.phone || ''}
                disabled
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl bg-white/5 text-gray-400"
              />
            </div>
            <button
              type="submit"
              disabled={profileMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
            >
              <Save size={16} /> {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* Password Form */}
      {activeTab === 'password' && (
        <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10">
          <form onSubmit={handleSubmitPassword((data) => passwordMutation.mutate(data))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Current Password</label>
              <input
                type="password"
                {...registerPassword('currentPassword', { required: 'Required' })}
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
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
                className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none"
              />
              {passwordErrors.newPassword && <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword.message}</p>}
            </div>
            <button
              type="submit"
              disabled={passwordMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
            >
              <Lock size={16} /> {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </Motion.div>
  );
};

export default Profile;
