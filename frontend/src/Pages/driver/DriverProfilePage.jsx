import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { motion as Motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Save, Car, Lock } from 'lucide-react';
import { driverAPI, userAPI, uploadAPI } from '../../services/endpoints';
import useAuth from '../../hooks/useAuth';

const DriverProfile = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profile } = useQuery({
    queryKey: ['driverProfile'],
    queryFn: async () => {
      const { data } = await driverAPI.getProfile();
      return data;
    },
  });

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      vehicleBrand: '',
      vehicleModel: '',
      vehicleColor: '',
      vehicleYear: '',
    },
  });

  const { register: registerPassword, handleSubmit: handleSubmitPassword, reset: resetPassword, formState: { errors: passwordErrors } } = useForm();

  useEffect(() => {
    if (profile?.data) {
      reset({
        vehicleBrand: profile.data.vehicleBrand || '',
        vehicleModel: profile.data.vehicleModel || '',
        vehicleColor: profile.data.vehicleColor || '',
        vehicleYear: profile.data.vehicleYear || '',
      });
    }
  }, [profile, reset]);

  const updateMutation = useMutation({
    mutationFn: (data) => driverAPI.updateProfile(data),
    onSuccess: () => {
      toast.success('Profile updated');
      queryClient.invalidateQueries({ queryKey: ['driverProfile'] });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
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
      toast.success('Image updated');
      refreshUser();
    },
    onError: () => toast.error('Upload failed'),
  });

  const data = profile?.data || {};

  const statusColors = {
    Pending: 'bg-amber-500/10 text-amber-400',
    Approved: 'bg-emerald-500/10 text-emerald-400',
    Rejected: 'bg-red-500/10 text-red-400',
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <h1 className="font-display text-2xl font-bold text-white tracking-tight">Driver Profile</h1>

      {/* Profile Header */}
      <div className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center overflow-hidden">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-emerald-400">{user?.name?.charAt(0)?.toUpperCase()}</span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 p-1.5 bg-emerald-600 text-white rounded-full cursor-pointer hover:bg-emerald-700 transition">
              <User size={14} />
              <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && imageMutation.mutate(e.target.files[0])} />
            </label>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{user?.name}</h2>
            <p className="text-sm text-gray-400">{user?.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[data.approvalStatus] || 'bg-white/10'}`}>
                {data.approvalStatus || 'Pending'}
              </span>
              {data.isOnline && <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-medium">Online</span>}
            </div>
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

      {/* Vehicle Info Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <Car size={20} className="text-emerald-500" />
            <h3 className="font-semibold text-white">Vehicle Details</h3>
          </div>

          {/* Vehicle Type */}
          {data.vehicleType && (
            <div className="mb-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-1">Vehicle Type</p>
              <p className="text-sm font-semibold text-emerald-400">{data.vehicleType.name || 'N/A'}</p>
              {data.vehicleType.seats && (
                <p className="text-xs text-gray-400 mt-0.5">{data.vehicleType.seats} seats</p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Brand</label>
                <input {...register('vehicleBrand', { required: 'Required' })} className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                <input {...register('vehicleModel', { required: 'Required' })} className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Color</label>
                <input {...register('vehicleColor', { required: 'Required' })} className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                <input type="number" {...register('vehicleYear', { required: 'Required', min: 1990, max: new Date().getFullYear() + 1 })} className="w-full px-4 py-2.5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Vehicle Number</p>
                <p className="font-medium">{data.vehicleNumber || 'N/A'}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-gray-400 text-xs">Seats</p>
                <p className="font-medium">{data.seats || 4}</p>
              </div>
            </div>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Save size={16} /> {updateMutation.isPending ? 'Saving...' : 'Update Vehicle'}
            </button>
          </form>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === 'password' && (
        <div className="bg-white/5 rounded-2xl p-6 shadow-sm border border-white/10">
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
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Lock size={16} /> {passwordMutation.isPending ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </Motion.div>
  );
};

export default DriverProfile;
