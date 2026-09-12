import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Car, Plus, Pencil, Trash2, CheckCircle, XCircle, ImagePlus, X, Loader2, Users, Luggage, Gauge, Snowflake, Moon, Clock } from 'lucide-react';
import { adminAPI } from '../../services/endpoints';
import { TableSkeleton } from '../../components/shared/Skeleton';
import EmptyState from '../../components/shared/EmptyState';
import Modal from '../../components/shared/Modal';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { motion as Motion } from 'framer-motion';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const ManageVehicles = () => {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [imageRemoved, setImageRemoved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const blobUrlRef = useRef(null);
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const revokeBlobPreview = () => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const setBlobPreview = (url) => {
    revokeBlobPreview();
    blobUrlRef.current = url;
    setImagePreview(url);
  };

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const resetImageState = (existingUrl = '') => {
    revokeBlobPreview();
    setImageFile(null);
    setImagePreview(existingUrl || '');
    setImageRemoved(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditing(null);
    reset();
    resetImageState();
  };

  const { data: vehicles, isLoading } = useQuery({
    queryKey: ['adminVehicles'],
    queryFn: async () => {
      const { data } = await adminAPI.getVehicles();
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminAPI.createVehicle(data),
    onSuccess: () => { toast.success('Vehicle created'); queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => adminAPI.updateVehicle(id, data),
    onSuccess: () => { toast.success('Vehicle updated'); queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }); closeModal(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const enableMutation = useMutation({
    mutationFn: (id) => adminAPI.enableVehicle(id),
    onSuccess: () => { toast.success('Vehicle enabled'); queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }); },
  });

  const disableMutation = useMutation({
    mutationFn: (id) => adminAPI.disableVehicle(id),
    onSuccess: () => { toast.success('Vehicle disabled'); queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminAPI.deleteVehicle(id),
    onSuccess: () => { toast.success('Vehicle deleted'); queryClient.invalidateQueries({ queryKey: ['adminVehicles'] }); },
  });

  const onSubmit = async (data) => {
    const parsedLuggage = parseInt(data.luggage, 10);
    const payload = {
      name: data.name,
      seats: parseInt(data.seats, 10),
      luggage: Number.isNaN(parsedLuggage) ? 2 : parsedLuggage,
      oneWayBaseFare: parseFloat(data.oneWayBaseFare),
      roundTripBaseFare: parseFloat(data.roundTripBaseFare),
      oneWayBaseKm: parseFloat(data.oneWayBaseKm) || 0,
      roundTripBaseKm: parseFloat(data.roundTripBaseKm) || 0,
      oneWayPerKm: parseFloat(data.oneWayPerKm),
      roundTripPerKm: parseFloat(data.roundTripPerKm),
      waitingChargePerMinute: parseFloat(data.waitingChargePerMinute) || 0,
      driverAllowance: parseFloat(data.driverAllowance) || 0,
      nightCharge: parseFloat(data.nightCharge) || 0,
      isAC: data.isAC !== false,
    };

    const rawBata = data.driverBataHighDistance;
    if (rawBata !== '' && rawBata != null) {
      payload.driverBataHighDistance = parseFloat(rawBata);
    } else if (editing && editing.driverBataHighDistance != null) {
      payload.driverBataHighDistance = null;
    }

    try {
      if (imageFile) {
        setUploading(true);
        const { data: uploadRes } = await adminAPI.uploadVehicleImage(imageFile);
        const url = uploadRes?.url;
        if (!url) throw new Error('Image upload failed.');
        payload.image = url;
      } else if (editing && imageRemoved) {
        payload.image = '';
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Image upload failed.');
      setUploading(false);
      return;
    }
    setUploading(false);

    if (editing) updateMutation.mutate({ id: editing._id, ...payload });
    else createMutation.mutate(payload);
  };

  const handleImagePick = (fileList) => {
    const file = fileList?.[0] || null;
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error('Only JPG, PNG or WEBP images are allowed.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      toast.error('Image too large. Max size is 5MB.');
      return;
    }
    setImageFile(file);
    setImageRemoved(false);
    setBlobPreview(URL.createObjectURL(file));
  };

  const handleImageRemove = () => {
    if (imageFile) {
      setImageFile(null);
      revokeBlobPreview();
      setImagePreview(editing?.image || '');
    } else {
      setImageRemoved(true);
      setImagePreview('');
    }
  };

  const openEdit = (v) => {
    setEditing(v);
    reset({
      name: v.name, seats: v.seats, luggage: v.luggage,
      oneWayBaseFare: v.oneWayBaseFare ?? '',
      roundTripBaseFare: v.roundTripBaseFare ?? '',
      oneWayBaseKm: v.oneWayBaseKm ?? '',
      roundTripBaseKm: v.roundTripBaseKm ?? '',
      oneWayPerKm: v.oneWayPerKm ?? '',
      roundTripPerKm: v.roundTripPerKm ?? '',
      waitingChargePerMinute: v.waitingChargePerMinute,
      driverAllowance: v.driverAllowance, nightCharge: v.nightCharge,
      driverBataHighDistance: v.driverBataHighDistance ?? '',
      isAC: v.isAC,
    });
    resetImageState(v.image);
    setShowModal(true);
  };

  const vehicleList = vehicles?.vehicles || [];

  const VehicleCard = ({ v }) => (
    <Motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/[0.04] backdrop-blur-xl rounded-[28px] border border-white/[0.08] overflow-hidden hover:border-green-500/25 hover:shadow-[0_8px_40px_rgba(34,197,94,0.08)] transition-all duration-300"
    >
      {/* Image section */}
      <div className="relative h-44 sm:h-48 overflow-hidden">
        {v.image ? (
          <img src={v.image} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center">
            <Car size={48} className="text-white/10" />
          </div>
        )}
        {/* Status badge */}
        <div className="absolute top-3 left-3">
          <span className={`px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide backdrop-blur-md ${v.isActive ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/30' : 'bg-red-500/25 text-red-300 border border-red-400/30'}`}>
            {v.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>
        {/* AC badge */}
        {v.isAC && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-500/20 text-blue-300 border border-blue-400/25 backdrop-blur-md flex items-center gap-1">
              <Snowflake size={11} /> AC
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="text-lg font-bold text-white leading-tight">{v.name}</h3>
          {v.driverBataHighDistance != null && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/20 shrink-0" title="Custom high-distance driver bata">
              ₹{v.driverBataHighDistance}/day
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Users size={13} className="text-green-400/70" />
            <span>{v.seats} seats</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Luggage size={13} className="text-green-400/70" />
            <span>{v.luggage} bags</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-white/[0.03] rounded-2xl p-3.5 mb-4 border border-white/[0.05]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">One-Way Base</span>
            <span className="text-sm font-bold text-white">₹{v.oneWayBaseFare?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">One-Way /km</span>
            <span className="text-sm font-semibold text-green-400">₹{v.oneWayPerKm ?? '—'}</span>
          </div>
          {v.oneWayBaseKm > 0 && (
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-500 uppercase tracking-wider">One-Way Base KM</span>
              <span className="text-sm font-semibold text-emerald-400">{v.oneWayBaseKm} km</span>
            </div>
          )}
          <div className="border-t border-white/[0.05] my-2" />
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Round-Trip Base</span>
            <span className="text-sm font-bold text-white">₹{v.roundTripBaseFare?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Round-Trip /km</span>
            <span className="text-sm font-semibold text-emerald-400">₹{v.roundTripPerKm ?? '—'}</span>
          </div>
          {v.roundTripBaseKm > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Round-Trip Base KM</span>
              <span className="text-sm font-semibold text-emerald-400">{v.roundTripBaseKm} km</span>
            </div>
          )}
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {v.nightCharge > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/15 text-purple-300 border border-purple-500/20">
              <Moon size={10} /> ₹{v.nightCharge} night
            </span>
          )}
          {v.waitingChargePerMinute > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/20">
              <Clock size={10} /> ₹{v.waitingChargePerMinute}/min wait
            </span>
          )}
          {v.driverAllowance > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              <Gauge size={10} /> ₹{v.driverAllowance} bata
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEdit(v)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-xs font-medium hover:bg-white/10 hover:text-white transition"
          >
            <Pencil size={13} /> Edit
          </button>
          <button
            onClick={() => v.isActive ? disableMutation.mutate(v._id) : enableMutation.mutate(v._id)}
            className={`flex-1 py-2.5 text-xs font-medium rounded-xl border transition ${v.isActive ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
          >
            {v.isActive ? <XCircle size={13} className="inline mr-1" /> : <CheckCircle size={13} className="inline mr-1" />}
            {v.isActive ? 'Disable' : 'Enable'}
          </button>
          <button
            onClick={() => setDeleteId(v._id)}
            className="py-2.5 px-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </Motion.div>
  );

  return (
    <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white tracking-tight">Manage Vehicles</h1>
          <p className="text-sm text-gray-400 mt-1">{vehicleList.length} vehicle{vehicleList.length !== 1 ? 's' : ''} in your fleet</p>
        </div>
        <button
          onClick={() => { setEditing(null); reset(); resetImageState(); setShowModal(true); }}
          className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl text-sm font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3].map((i) => (
            <div key={i} className="bg-white/5 backdrop-blur-lg rounded-[28px] border border-white/10 overflow-hidden">
              <div className="h-44 bg-white/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-white/10 rounded-lg w-2/3 animate-pulse" />
                <div className="h-3 bg-white/5 rounded-lg w-1/2 animate-pulse" />
                <div className="h-20 bg-white/5 rounded-2xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : vehicleList.length === 0 ? (
        <EmptyState icon={Car} title="No vehicles yet" description="Add your first vehicle to start managing your fleet." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicleList.map((v) => (
            <VehicleCard key={v._id} v={v} />
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={closeModal} title={editing ? 'Edit Vehicle' : 'Add Vehicle'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Vehicle Image</label>
            {imagePreview ? (
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                <img src={imagePreview} alt="Vehicle preview" className="w-full h-40 object-cover" />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  title={imageFile ? 'Cancel new image' : 'Remove image'}
                  aria-label={imageFile ? 'Cancel new image' : 'Remove image'}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 border border-white/15 text-gray-300 hover:text-red-400 hover:border-red-500/50 flex items-center justify-center transition"
                >
                  <X size={15} />
                </button>
                <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[11px] text-gray-300">
                  {imageFile ? 'New image — applies on save' : 'Current image'}
                </span>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-2 w-full px-4 py-6 bg-white/5 border border-dashed border-white/15 rounded-2xl text-sm text-gray-400 hover:border-emerald-500/50 hover:text-emerald-300 cursor-pointer transition">
                <ImagePlus size={18} />
                {imageRemoved && editing ? 'Image removed — pick a replacement or save' : 'Click to upload an image'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImagePick(e.target.files)}
                />
              </label>
            )}
            {imagePreview && !imageFile && (
              <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-300 cursor-pointer transition">
                <ImagePlus size={13} /> Replace image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleImagePick(e.target.files)}
                />
              </label>
            )}
            <p className="text-[11px] text-gray-500 mt-1.5">JPG, PNG or WEBP up to 5MB.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input {...register('name', { required: 'Required' })} placeholder="e.g. Sedan" className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Seats</label>
              <input type="number" min="1" max="20" {...register('seats', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Luggage</label>
              <input type="number" min="0" {...register('luggage')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">One-Way Base Fare (₹)</label>
              <input type="number" step="0.01" min="0" {...register('oneWayBaseFare', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">One-Way per Km (₹)</label>
              <input type="number" step="0.01" min="0" {...register('oneWayPerKm', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">One-Way Base KM</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0 = full distance is charged"
              {...register('oneWayBaseKm', { min: { value: 0, message: 'Must be 0 or more' } })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">Kilometers covered by the one-way base fare. Distance beyond this is charged at the per-km rate.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Round-Trip Base Fare (₹)</label>
              <input type="number" step="0.01" min="0" {...register('roundTripBaseFare', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Round-Trip per Km (₹)</label>
              <input type="number" step="0.01" min="0" {...register('roundTripPerKm', { required: 'Required' })} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Round-Trip Base KM</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="0 = full distance is charged"
              {...register('roundTripBaseKm', { min: { value: 0, message: 'Must be 0 or more' } })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]"
            />
            <p className="text-[11px] text-gray-500 mt-1.5">Kilometers covered by the round-trip base fare. Distance beyond this is charged at the per-km rate.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Waiting/min (₹)</label>
              <input type="number" step="0.01" min="0" {...register('waitingChargePerMinute')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Driver Allowance (₹)</label>
              <input type="number" step="0.01" min="0" {...register('driverAllowance')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Night Charge (₹)</label>
              <input type="number" step="0.01" min="0" {...register('nightCharge')} className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Driver Bata — Above 400km (₹/day)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Leave blank to use policy default (₹600/day)"
              {...register('driverBataHighDistance', { min: { value: 0, message: 'Must be 0 or more' } })}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/30 rounded-xl outline-none [color-scheme:dark]"
            />
            {errors.driverBataHighDistance && <p className="text-red-400 text-xs mt-1">{errors.driverBataHighDistance.message}</p>}
            <p className="text-[11px] text-gray-500 mt-1.5">Only applies to trips exceeding the high-distance threshold. Leave empty to use the platform default.</p>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isAC" {...register('isAC')} defaultChecked className="rounded bg-white/5 border-white/10 text-white [color-scheme:dark]" />
            <label htmlFor="isAC" className="text-sm text-gray-400">AC Vehicle</label>
          </div>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending || uploading} className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? (<><Loader2 size={16} className="animate-spin" /> Uploading image…</>) : (<>{editing ? 'Update' : 'Create'} Vehicle</>)}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteMutation.mutate(deleteId)} title="Delete Vehicle" message="This action cannot be undone." confirmText="Delete" variant="danger" />
    </Motion.div>
  );
};

export default ManageVehicles;
