import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { MapPin, Home, Briefcase, Plus, Pencil, Trash2 } from 'lucide-react';
import { favoriteAPI } from '../../services/endpoints';
import { ListSkeleton } from '../../components/shared/Skeleton';
import ErrorState from '../../components/shared/ErrorState';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion as Motion } from 'framer-motion';

const FavoriteLocations = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  const { data: favorites, isLoading, isError, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data } = await favoriteAPI.getAll();
      return data;
    },
    staleTime: 60_000,
  });

  if (isError) return <ErrorState message={error?.message || 'Failed to load locations'} onRetry={() => queryClient.invalidateQueries({ queryKey: ['favorites'] })} />;

  const createMutation = useMutation({
    mutationFn: (data) => favoriteAPI.create(data),
    onSuccess: () => {
      toast.success('Location saved');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setShowModal(false);
      reset();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => favoriteAPI.update(id, data),
    onSuccess: () => {
      toast.success('Location updated');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setShowModal(false);
      reset();
      setEditing(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => favoriteAPI.delete(id),
    onSuccess: () => {
      toast.success('Location deleted');
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      setDeleteId(null);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete'),
  });

  const onSubmit = (data) => {
    const lat = parseFloat(data.latitude);
    const lng = parseFloat(data.longitude);
    const payload = {
      label: data.label,
      address: data.address,
      nickname: data.nickname || '',
      // Preserve existing coords on edit when fields are left blank;
      // fall back to 0 only when nothing is known.
      latitude: Number.isFinite(lat) ? lat : (editing?.latitude ?? 0),
      longitude: Number.isFinite(lng) ? lng : (editing?.longitude ?? 0),
    };
    if (editing) {
      updateMutation.mutate({ id: editing._id, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openEdit = (fav) => {
    setEditing(fav);
    setValue('label', fav.label);
    setValue('address', fav.address);
    setValue('nickname', fav.nickname || '');
    setValue('latitude', fav.latitude || '');
    setValue('longitude', fav.longitude || '');
    setShowModal(true);
  };

  const icons = { Home, Work: Briefcase, Other: MapPin };
  const colors = { Home: 'bg-emerald-500/20 text-emerald-400', Work: 'bg-blue-500/20 text-blue-400', Other: 'bg-amber-500/20 text-amber-400' };

  const locations = favorites?.locations || [];

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-white tracking-tight">Favorite Locations</h1>
        <button
          onClick={() => { setEditing(null); reset(); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-sm font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      {isLoading ? (
        <ListSkeleton count={3} />
      ) : locations.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved locations"
          description="Save your frequent places for quick booking."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {locations.map((fav) => {
            const Icon = icons[fav.label] || MapPin;
            return (
              <div key={fav._id} className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 shadow-sm border border-white/10 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[fav.label] || 'bg-white/10'}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(fav)} className="p-2 hover:bg-white/10 rounded-lg transition">
                      <Pencil size={14} className="text-gray-500" />
                    </button>
                    <button onClick={() => setDeleteId(fav._id)} className="p-2 hover:bg-red-500/10 rounded-lg transition">
                      <Trash2 size={14} className="text-gray-500 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-white">{fav.nickname || fav.label}</h3>
                <p className="text-sm text-gray-400 mt-1 truncate">{fav.address}</p>
                {!fav.latitude && !fav.longitude && (
                  <p className="text-[11px] text-amber-400/80 mt-1">No coordinates — edit to add for quick booking</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditing(null); reset(); }}
        title={editing ? 'Edit Location' : 'Add Location'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Label</label>
            <select
              {...register('label', { required: 'Required' })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none [color-scheme:dark]"
            >
              <option value="Home" className="bg-gray-900 text-white">Home</option>
              <option value="Work" className="bg-gray-900 text-white">Work</option>
              <option value="Other" className="bg-gray-900 text-white">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
            <input
              {...register('address', { required: 'Address is required' })}
              placeholder="Enter address"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none [color-scheme:dark]"
            />
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Nickname (optional)</label>
            <input
              {...register('nickname')}
              placeholder="e.g., Mom's house"
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none [color-scheme:dark]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Latitude (optional)</label>
              <input
                type="number"
                step="any"
                {...register('latitude')}
                placeholder="e.g. 13.0827"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Longitude (optional)</label>
              <input
                type="number"
                step="any"
                {...register('longitude')}
                placeholder="e.g. 80.2707"
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-green-500/30 focus:border-green-500 outline-none [color-scheme:dark]"
              />
            </div>
          </div>
          <p className="text-[11px] text-gray-500">Coordinates power quick booking &amp; fare estimates. Long-press any spot in Google Maps to copy them.</p>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50"
          >
            {editing ? 'Update' : 'Save'} Location
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        title="Delete Location"
        message="Are you sure you want to remove this saved location?"
        confirmText="Delete"
        variant="danger"
      />
    </Motion.div>
  );
};

export default FavoriteLocations;
