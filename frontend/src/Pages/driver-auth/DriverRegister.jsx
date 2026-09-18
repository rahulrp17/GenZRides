import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion as Motion } from 'framer-motion';
import { Loader2, Eye, EyeOff, Car, ChevronLeft, Upload, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../../hooks/useAuth';
import SEO from '../../components/SEO';
import AuthSplit from '../../Component/Auth/AuthSplit';
import { authAPI, driverAPI, vehicleAPI, driverUploadAPI } from '../../services/endpoints';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const validateFile = (file) => {
  if (!file) return null;
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return 'Invalid file type. Use JPG, PNG, or WEBP.';
  if (file.size > MAX_FILE_SIZE) return 'File too large. Max size is 5MB.';
  return null;
};

const DriverRegister = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const { user, loading: authLoading, login } = useAuth();
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const [files, setFiles] = useState({
    aadhaarPhoto: null,
    aadhaarBackPhoto: null,
    drivingLicensePhoto: null,
    rcBookPhoto: null,
    pollutionCertificatePhoto: null,
    vehiclePhotos: [],
    profilePhotoFile: null,
    insuranceFile: null,
  });
  const [fileErrors, setFileErrors] = useState({});

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setError,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  // Map backend uniqueness/validation failures onto the exact form field
  // and jump back to the step that owns it — backend messages already use
  // the exact wording ("... already exists" / "... already registered.").
  const mapFieldError = (message = '') => {
    if (/email already exists/i.test(message)) {
      setError('email', { type: 'server', message: 'Email already exists' });
      setStep(1);
      return true;
    }
    if (/phone number already exists/i.test(message)) {
      setError('phone', { type: 'server', message: 'Phone number already exists' });
      setStep(1);
      return true;
    }
    if (/aadhaar number already/i.test(message)) {
      setError('aadhaarNumber', { type: 'server', message: 'Aadhaar number already exists' });
      setStep(2);
      return true;
    }
    if (/license number already/i.test(message)) {
      setError('licenseNumber', { type: 'server', message: 'License number already exists' });
      setStep(2);
      return true;
    }
    if (/vehicle number already/i.test(message)) {
      setError('vehicleNumber', { type: 'server', message: 'Vehicle number already exists' });
      setStep(2);
      return true;
    }
    return false;
  };

  const watchAll = watch();

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await vehicleAPI.getAll();
        const all = res.data?.vehicles || res.data?.data || (Array.isArray(res.data) ? res.data : []);
        setVehicles(all.filter((v) => v.isActive !== false));
      } catch {
        toast.error('Failed to load vehicle types');
      }
    };
    fetchVehicles();
  }, []);

  if (!authLoading && user) {
    if (user.role === 'driver') return <Navigate to="/driver/home" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/customer" replace />;
  }

  const validateStep = async () => {
    if (step === 1) {
      return await trigger(['name', 'email', 'phone', 'password']);
    }
    if (step === 2) {
      return await trigger([
        'aadhaarNumber', 'licenseNumber', 'vehicleType', 'vehicleBrand',
        'vehicleModel', 'vehicleColor', 'vehicleYear', 'vehicleNumber', 'seats',
      ]);
    }
    if (step === 3) {
      const newErrors = {};
      if (!files.aadhaarPhoto) newErrors.aadhaarPhoto = 'Aadhaar front photo is required';
      if (!files.aadhaarBackPhoto) newErrors.aadhaarBackPhoto = 'Aadhaar back photo is required';
      if (!files.drivingLicensePhoto) newErrors.drivingLicensePhoto = 'Driving license photo is required';
      if (!files.rcBookPhoto) newErrors.rcBookPhoto = 'RC book photo is required';
      if (!files.pollutionCertificatePhoto) newErrors.pollutionCertificatePhoto = 'Pollution certificate photo is required';
      if (files.vehiclePhotos.length === 0) newErrors.vehiclePhotos = 'At least one vehicle photo is required';
      setFileErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }
    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep();
    if (valid) setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => s - 1);

  const handleFileChange = (key, fileList) => {
    const file = fileList?.[0] || null;
    if (file) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        setFileErrors((prev) => ({ ...prev, [key]: error }));
        return;
      }
      setFileErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
    if (key === 'vehiclePhotos') {
      const validFiles = Array.from(fileList || []).filter((f) => {
        const err = validateFile(f);
        if (err) toast.error(err);
        return !err;
      });
      setFiles((prev) => ({ ...prev, vehiclePhotos: validFiles }));
      setFileErrors((prev) => {
        const next = { ...prev };
        delete next.vehiclePhotos;
        return next;
      });
    } else {
      setFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const uploadDocuments = async () => {
    const uploadPromises = [];

    if (files.aadhaarPhoto) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('aadhaarFront', files.aadhaarPhoto).then(() => {
          toast.success('Aadhaar front uploaded');
        }).catch((err) => {
          toast.error('Aadhaar front upload failed');
          throw err;
        })
      );
    }

    if (files.aadhaarBackPhoto) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('aadhaarBack', files.aadhaarBackPhoto).then(() => {
          toast.success('Aadhaar back uploaded');
        }).catch((err) => {
          toast.error('Aadhaar back upload failed');
          throw err;
        })
      );
    }

    if (files.drivingLicensePhoto) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('drivingLicense', files.drivingLicensePhoto).then(() => {
          toast.success('Driving license uploaded');
        }).catch((err) => {
          toast.error('Driving license upload failed');
          throw err;
        })
      );
    }

    if (files.rcBookPhoto) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('rcBook', files.rcBookPhoto).then(() => {
          toast.success('RC book uploaded');
        }).catch((err) => {
          toast.error('RC book upload failed');
          throw err;
        })
      );
    }

    if (files.pollutionCertificatePhoto) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('pollutionCertificate', files.pollutionCertificatePhoto).then(() => {
          toast.success('Pollution certificate uploaded');
        }).catch((err) => {
          toast.error('Pollution certificate upload failed');
          throw err;
        })
      );
    }

    if (files.vehiclePhotos.length > 0) {
      uploadPromises.push(
        driverUploadAPI.uploadVehicleImages(files.vehiclePhotos).then(() => {
          toast.success('Vehicle photos uploaded');
        }).catch((err) => {
          toast.error('Vehicle photo upload failed');
          throw err;
        })
      );
    }

    if (files.profilePhotoFile) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('profilePhoto', files.profilePhotoFile).then(() => {
          toast.success('Profile photo uploaded');
        }).catch((err) => {
          toast.error('Profile photo upload failed');
          throw err;
        })
      );
    }

    if (files.insuranceFile) {
      uploadPromises.push(
        driverUploadAPI.uploadDocument('insurance', files.insuranceFile).then(() => {
          toast.success('Insurance uploaded');
        }).catch((err) => {
          toast.error('Insurance upload failed');
          throw err;
        })
      );
    }

    await Promise.all(uploadPromises);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Step 1 — create the auth account. If the email/phone already exists
      // from an interrupted earlier attempt, recover by logging in with the
      // same credentials instead of failing with a false duplicate error.
      let authed = !!localStorage.getItem('accessToken');
      try {
        const authRes = await authAPI.registerDriver({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        });

        if (authRes.data?.accessToken) {
          localStorage.setItem('accessToken', authRes.data.accessToken);
          localStorage.setItem('refreshToken', authRes.data.refreshToken);
          authed = true;
        }
      } catch (regErr) {
        const regMsg = regErr?.response?.data?.message || regErr?.message || '';
        if (/email already exists|phone number already exists/i.test(regMsg)) {
          try {
            await login({ email: data.email, password: data.password });
            authed = true;
            toast.success('Account found. Continuing your registration...');
          } catch {
            mapFieldError(regMsg);
            throw regErr;
          }
        } else {
          throw regErr;
        }
      }

      if (!authed) {
        throw new Error('Registration failed. Please try again.');
      }

      await driverAPI.createProfile({
        aadhaarNumber: data.aadhaarNumber,
        licenseNumber: data.licenseNumber,
        vehicleType: data.vehicleType,
        vehicleBrand: data.vehicleBrand,
        vehicleModel: data.vehicleModel,
        vehicleColor: data.vehicleColor,
        vehicleYear: parseInt(data.vehicleYear),
        vehicleNumber: data.vehicleNumber,
        seats: parseInt(data.seats) || 4,
      });

      await uploadDocuments();

      toast.success('Registration successful! Your account will be reviewed shortly.');
      navigate('/driver/login');
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || 'Registration failed';
      if (error?.response?.status === 401) {
        toast.error('Session expired. Please login and continue.');
        navigate('/driver/login');
        return;
      }
      mapFieldError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = (field) =>
    `w-full px-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500/40 focus:border-green-500/50 outline-none transition-all [color-scheme:dark] ${
      errors[field] ? 'border-red-500' : 'border-white/10'
    }`;

  const labelClass = 'text-sm font-medium text-slate-300 mb-1.5 block';

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-3 mb-8">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              step === s
                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-[0_0_18px_rgba(34,197,94,0.5)]'
                : step > s
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'bg-white/5 text-gray-500 border border-white/10'
            }`}
          >
            {step > s ? '✓' : s}
          </div>
          {s < 4 && (
            <div className={`w-8 sm:w-12 h-0.5 ${step > s ? 'bg-green-500' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderAccountStep = () => (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Full Name</label>
        <input
          type="text"
          placeholder="John Doe"
          className={inputClass('name')}
          {...register('name', {
            required: 'Name is required',
            minLength: { value: 2, message: 'Name must be at least 2 characters' },
            maxLength: { value: 50, message: 'Name must be less than 50 characters' },
          })}
        />
        {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          className={inputClass('email')}
          {...register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Enter a valid email address',
            },
          })}
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          type="tel"
          placeholder="9876543210"
          className={inputClass('phone')}
          {...register('phone', {
            required: 'Phone number is required',
            pattern: {
              value: /^[6-9]\d{9}$/,
              message: 'Enter a valid 10-digit Indian phone number',
            },
          })}
        />
        {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className={`${inputClass('password')} pr-10`}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Password must be at least 8 characters' },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message: 'Must contain uppercase, lowercase, and a digit',
              },
            })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>
    </div>
  );

  const renderVehicleStep = () => (
    <div className="space-y-5">
      <div>
        <label className={labelClass}>Aadhaar Number</label>
        <input
          type="text"
          placeholder="123456789012"
          maxLength={12}
          className={inputClass('aadhaarNumber')}
          {...register('aadhaarNumber', {
            required: 'Aadhaar number is required',
            pattern: {
              value: /^\d{12}$/,
              message: 'Must be exactly 12 digits',
            },
          })}
        />
        {errors.aadhaarNumber && <p className="text-red-400 text-xs mt-1">{errors.aadhaarNumber.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Driving License Number</label>
        <input
          type="text"
          placeholder="TN38 20190001234"
          className={inputClass('licenseNumber')}
          {...register('licenseNumber', {
            required: 'License number is required',
            pattern: {
              // Indian driving licence: 2-letter state code, optional
              // 2-digit RTO code, 4-digit year, 7-digit serial —
              // separators (space/hyphen) optional.
              value: /^[A-Z]{2}[-\s]?(?:\d{2}[-\s]?)?\d{4}[-\s]?\d{7}$/i,
              message: 'Invalid format (e.g. TN38 20190001234)',
            },
          })}
        />
        {errors.licenseNumber && <p className="text-red-400 text-xs mt-1">{errors.licenseNumber.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Vehicle Type</label>
        <select
          className={inputClass('vehicleType')}
          {...register('vehicleType', { required: 'Select a vehicle type' })}
        >
          <option value="" className="bg-gray-900 text-white">Select vehicle type</option>
          {vehicles.map((v) => (
            <option key={v._id} value={v._id} className="bg-gray-900 text-white">
              {v.name || v.type} — ₹{v.oneWayPerKm ?? '—'}/km
            </option>
          ))}
        </select>
        {errors.vehicleType && <p className="text-red-400 text-xs mt-1">{errors.vehicleType.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Brand</label>
          <input
            type="text"
            placeholder="Maruti"
            className={inputClass('vehicleBrand')}
            {...register('vehicleBrand', { required: 'Brand is required' })}
          />
          {errors.vehicleBrand && <p className="text-red-400 text-xs mt-1">{errors.vehicleBrand.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Model</label>
          <input
            type="text"
            placeholder="Swift"
            className={inputClass('vehicleModel')}
            {...register('vehicleModel', { required: 'Model is required' })}
          />
          {errors.vehicleModel && <p className="text-red-400 text-xs mt-1">{errors.vehicleModel.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Color</label>
          <input
            type="text"
            placeholder="White"
            className={inputClass('vehicleColor')}
            {...register('vehicleColor', { required: 'Color is required' })}
          />
          {errors.vehicleColor && <p className="text-red-400 text-xs mt-1">{errors.vehicleColor.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Year</label>
          <input
            type="number"
            placeholder="2022"
            className={inputClass('vehicleYear')}
            {...register('vehicleYear', {
              required: 'Year is required',
              min: { value: 1990, message: 'Year must be 1990 or later' },
              max: { value: currentYear + 1, message: `Year must be ${currentYear + 1} or earlier` },
            })}
          />
          {errors.vehicleYear && <p className="text-red-400 text-xs mt-1">{errors.vehicleYear.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Vehicle Number</label>
          <input
            type="text"
            placeholder="TN01AB1234"
            className={inputClass('vehicleNumber')}
            {...register('vehicleNumber', {
              required: 'Vehicle number is required',
              // Backend accepts the same Indian format (uppercase, optional
              // single spaces); normalize here so the payload always passes.
              setValueAs: (v) => String(v || '').toUpperCase().replace(/\s+/g, ''),
              pattern: {
                value: /^[A-Z]{2}\s?\d{1,2}\s?[A-Z]{1,2}\s?\d{4}$/i,
                message: 'Invalid format (e.g. TN01AB1234)',
              },
            })}
          />
          {errors.vehicleNumber && <p className="text-red-400 text-xs mt-1">{errors.vehicleNumber.message}</p>}
        </div>
        <div>
          <label className={labelClass}>Seats</label>
          <input
            type="number"
            placeholder="4"
            className={inputClass('seats')}
            {...register('seats', {
              required: 'Seats is required',
              min: { value: 1, message: 'Minimum 1 seat' },
              max: { value: 10, message: 'Maximum 10 seats' },
            })}
          />
          {errors.seats && <p className="text-red-400 text-xs mt-1">{errors.seats.message}</p>}
        </div>
      </div>
    </div>
  );

  const renderDocumentUploadStep = () => (
    <div className="space-y-6">
      <p className="text-sm text-slate-400">Upload clear photos of your documents and vehicle.</p>

      <div>
        <p className={labelClass}>Aadhaar Front Photo</p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.aadhaarPhoto ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.aadhaarPhoto)} alt="Aadhaar front" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.aadhaarPhoto.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload Aadhaar front</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('aadhaarPhoto', e.target.files)} />
        </label>
        {(fileErrors.aadhaarPhoto || errors.aadhaarPhoto) && <p className="text-red-400 text-xs mt-1">{fileErrors.aadhaarPhoto || errors.aadhaarPhoto}</p>}
      </div>

      <div>
        <p className={labelClass}>Aadhaar Back Photo</p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.aadhaarBackPhoto ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.aadhaarBackPhoto)} alt="Aadhaar back" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.aadhaarBackPhoto.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload Aadhaar back</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('aadhaarBackPhoto', e.target.files)} />
        </label>
        {(fileErrors.aadhaarBackPhoto || errors.aadhaarBackPhoto) && <p className="text-red-400 text-xs mt-1">{fileErrors.aadhaarBackPhoto || errors.aadhaarBackPhoto}</p>}
      </div>

      <div>
        <p className={labelClass}>Driving License Photo</p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.drivingLicensePhoto ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.drivingLicensePhoto)} alt="License" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.drivingLicensePhoto.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload driving license</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('drivingLicensePhoto', e.target.files)} />
        </label>
        {(fileErrors.drivingLicensePhoto || errors.drivingLicensePhoto) && <p className="text-red-400 text-xs mt-1">{fileErrors.drivingLicensePhoto || errors.drivingLicensePhoto}</p>}
      </div>

      <div>
        <p className={labelClass}>RC Book Photo</p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.rcBookPhoto ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.rcBookPhoto)} alt="RC book" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.rcBookPhoto.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload RC book</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('rcBookPhoto', e.target.files)} />
        </label>
        {(fileErrors.rcBookPhoto || errors.rcBookPhoto) && <p className="text-red-400 text-xs mt-1">{fileErrors.rcBookPhoto || errors.rcBookPhoto}</p>}
      </div>

      <div>
        <p className={labelClass}>Pollution Certificate Photo</p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.pollutionCertificatePhoto ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.pollutionCertificatePhoto)} alt="Pollution certificate" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.pollutionCertificatePhoto.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload pollution certificate</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('pollutionCertificatePhoto', e.target.files)} />
        </label>
        {(fileErrors.pollutionCertificatePhoto || errors.pollutionCertificatePhoto) && <p className="text-red-400 text-xs mt-1">{fileErrors.pollutionCertificatePhoto || errors.pollutionCertificatePhoto}</p>}
      </div>

      <div>
        <p className={labelClass}>Vehicle Photos</p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.vehiclePhotos.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 justify-center">
                {files.vehiclePhotos.map((f, i) => (
                  <div key={i} className="relative">
                    <img src={URL.createObjectURL(f)} alt={`Vehicle ${i + 1}`} className="w-20 h-20 object-cover rounded-lg" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-emerald-400">✓ {files.vehiclePhotos.length} photo(s) selected</p>
            </div>
          ) : (
            <>
              <ImageIcon size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload vehicle photos</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB each)</p>
            </>
          )}
          <input type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => handleFileChange('vehiclePhotos', e.target.files)} />
        </label>
        {fileErrors.vehiclePhotos && <p className="text-red-400 text-xs mt-1">{fileErrors.vehiclePhotos}</p>}
      </div>

      <div>
        <p className={labelClass}>Profile Photo <span className="text-slate-500 hidden">(optional)</span></p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.profilePhotoFile ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.profilePhotoFile)} alt="Profile photo" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.profilePhotoFile.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload profile photo</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('profilePhotoFile', e.target.files)} />
        </label>
      </div>

      <div>
        <p className={labelClass}>Insurance <span className="text-slate-500 hidden">(optional)</span></p>
        <label className="block border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-green-500/60 transition cursor-pointer">
          {files.insuranceFile ? (
            <div className="space-y-2">
              <img src={URL.createObjectURL(files.insuranceFile)} alt="Insurance" className="w-full h-32 object-cover rounded-lg mx-auto" />
              <p className="text-xs text-emerald-400">✓ {files.insuranceFile.name}</p>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-slate-500 mb-2" />
              <p className="text-sm text-slate-400">Click to upload insurance</p>
              <p className="text-xs text-slate-500 mt-1">JPG, PNG, WEBP (max 5MB)</p>
            </>
          )}
          <input type="file" accept="image/*" className="hidden"
            onChange={(e) => handleFileChange('insuranceFile', e.target.files)} />
        </label>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    const selectedVehicle = vehicles.find((v) => v._id === watchAll.vehicleType);
    const rows = [
      ['Name', watchAll.name],
      ['Email', watchAll.email],
      ['Phone', watchAll.phone],
      ['Aadhaar', watchAll.aadhaarNumber ? `****${watchAll.aadhaarNumber.slice(-4)}` : '—'],
      ['License', watchAll.licenseNumber],
      ['Vehicle Type', selectedVehicle?.name || selectedVehicle?.type || '—'],
      ['Brand', watchAll.vehicleBrand],
      ['Model', watchAll.vehicleModel],
      ['Color', watchAll.vehicleColor],
      ['Year', watchAll.vehicleYear],
      ['Number', watchAll.vehicleNumber?.toUpperCase()],
      ['Seats', watchAll.seats],
      ['Aadhaar Front Photo', files.aadhaarPhoto ? files.aadhaarPhoto.name : '—'],
      ['Aadhaar Back Photo', files.aadhaarBackPhoto ? files.aadhaarBackPhoto.name : '—'],
      ['Driving License Photo', files.drivingLicensePhoto ? files.drivingLicensePhoto.name : '—'],
      ['RC Book Photo', files.rcBookPhoto ? files.rcBookPhoto.name : '—'],
      ['Pollution Certificate Photo', files.pollutionCertificatePhoto ? files.pollutionCertificatePhoto.name : '—'],
      ['Vehicle Photos', files.vehiclePhotos.length > 0 ? `${files.vehiclePhotos.length} photo(s)` : '—'],
      ['Profile Photo', files.profilePhotoFile ? files.profilePhotoFile.name : '—'],
      ['Insurance', files.insuranceFile ? files.insuranceFile.name : '—'],
    ];

    return (
      <div className="space-y-4">
        <h3 className="text-white font-semibold text-lg mb-4">Review everything before submitting</h3>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {rows.map(([label, value], i) => (
            <div key={label} className={`flex justify-between px-4 py-3 ${i < rows.length - 1 ? 'border-b border-white/5' : ''}`}>
              <span className="text-slate-400 text-sm">{label}</span>
              <span className="text-white text-sm font-medium">{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AuthSplit eyebrow="Driver Onboarding">
      <SEO title="Driver Registration" description="Register as a GenZRides driver: flexible hours, fair commission, weekly payouts." path="/driver/register" noindex />
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        <Link to="/driver/continue" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-green-400 mb-6 transition-colors">
          <ChevronLeft size={16} /> Back
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[30px] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              <Car size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-white tracking-tight">Driver Registration</h1>
              <p className="text-green-400 text-xs font-semibold uppercase tracking-[0.18em]">Step {step} of 4</p>
            </div>
          </div>
          <p className="text-gray-400 text-sm mt-1 mb-6">
            {step === 1 && 'Create your account to get started'}
            {step === 2 && 'Enter your vehicle and document details'}
            {step === 3 && 'Upload your photos'}
            {step === 4 && 'Review everything before submitting'}
          </p>

          {renderStepIndicator()}

          <form onSubmit={handleSubmit(onSubmit)}>
            {step === 1 && renderAccountStep()}
            {step === 2 && renderVehicleStep()}
            {step === 3 && renderDocumentUploadStep()}
            {step === 4 && renderReviewStep()}

            <div className="flex items-center gap-3 mt-8">
              {step > 1 && (
                <button type="button" onClick={handleBack} className="flex-1 border border-white/10 text-gray-300 py-3 rounded-2xl font-semibold hover:bg-white/5 transition-all">
                  Previous
                </button>
              )}

              {step < 4 ? (
                <button type="button" onClick={handleNext} className={`flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all ${step === 1 ? 'w-full' : ''}`}>
                  Next
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-2xl font-semibold hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                  {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                </button>
              )}
            </div>
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">After registration, your account will be reviewed by our team.</p>
      </Motion.div>
    </AuthSplit>
  );
};

export default DriverRegister;