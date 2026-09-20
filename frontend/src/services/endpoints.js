import api from './api';

// ==================== AUTH ====================
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  registerDriver: (data) => api.post('/auth/register-driver', data),
  login: (data) => api.post('/auth/login', data),
  refreshToken: (data) => api.post('/auth/refresh-token', data),
  logout: (data) => api.post('/auth/logout', data),
  logoutAll: () => api.post('/auth/logout-all'),
  getProfile: () => api.get('/auth/profile'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  verifyOtp: (data) => api.post('/auth/verify-otp', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
};

// ==================== USERS ====================
export const userAPI = {
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/change-password', data),
  getAll: (params) => api.get('/users', { params }),
};

// ==================== GUEST (no JWT) ====================
export const guestAPI = {
  autocomplete: (params) => api.get('/maps/guest/autocomplete', { params }),
  placeDetails: (params) => api.get('/maps/guest/place-details', { params }),
  reverseGeocode: (data) => api.post('/maps/guest/reverse-geocode', data),
  estimateFare: (data) => api.post('/fares/guest/estimate', data),
  create: (data) => api.post('/bookings/guest', data),
  lookup: (data) => api.post('/bookings/guest/lookup', data),
  cancel: (id, data) => api.patch(`/bookings/guest/${id}/cancel`, data),
};

// ==================== BOOKINGS ====================
export const bookingAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: (params) => api.get('/bookings/my-bookings', { params }),
  getAvailable: (params) => api.get('/bookings/available', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id, data) => api.patch(`/bookings/${id}/cancel`, data),
  driverCancel: (id, data) => api.patch(`/bookings/${id}/driver-cancel`, data),
  addTip: (id, data) => api.post(`/bookings/${id}/tip`, data),
  accept: (id) => api.patch(`/bookings/${id}/accept`),
  reject: (id) => api.patch(`/dispatch/${id}/reject`),
  reached: (id) => api.patch(`/bookings/${id}/reached`),
  arrived: (id) => api.patch(`/bookings/${id}/arrived`),
  start: (id) => api.patch(`/bookings/${id}/start`),
  reachDestination: (id) => api.patch(`/bookings/${id}/reach-destination`),
  updatePayment: (id, data) => api.patch(`/bookings/${id}/payment`, data),
  complete: (id) => api.patch(`/bookings/${id}/complete`),
};

// ==================== DISPATCH ====================
export const dispatchAPI = {
  dispatch: (bookingId, data) => api.post(`/dispatch/${bookingId}`, data),
  accept: (bookingId) => api.patch(`/dispatch/${bookingId}/accept`),
  reject: (bookingId) => api.patch(`/dispatch/${bookingId}/reject`),
  sendToNext: (bookingId) => api.patch(`/dispatch/${bookingId}/next`),
  handleTimeout: (bookingId) => api.patch(`/dispatch/${bookingId}/timeout`),
};

// ==================== DRIVER ====================
export const driverAPI = {
  createProfile: (data) => api.post('/drivers/profile', data),
  getProfile: () => api.get('/drivers/profile'),
  updateProfile: (data) => api.put('/drivers/profile', data),
  goOnline: () => api.put('/drivers/online'),
  goOffline: () => api.put('/drivers/offline'),
  updateLocation: (data) => api.put('/drivers/location', data),
  getCurrentBooking: () => api.get('/drivers/current-booking'),
  getHistory: (params) => api.get('/drivers/history', { params }),
  getTodayHistory: (params) => api.get('/drivers/history/today', { params }),
  getUpcoming: () => api.get('/drivers/upcoming'),
  getEarnings: () => api.get('/drivers/earnings'),
  getWallet: () => api.get('/drivers/wallet'),
  getWalletSummary: () => api.get('/drivers/wallet/summary'),
  getWalletHistory: (params) => api.get('/drivers/wallet/history', { params }),
  requestWithdrawal: (data) => api.post('/drivers/wallet/withdrawal', data),
  getDashboard: () => api.get('/drivers/dashboard'),
  getStatistics: () => api.get('/drivers/statistics'),
};

// ==================== DRIVER STATUS ====================
export const driverStatusAPI = {
  toggleOnline: (data) => api.put('/driver-status/online', data),
  getPerformance: () => api.get('/driver-status/performance'),
};

// ==================== DRIVER UPLOADS ====================
export const driverUploadAPI = {
  uploadDocument: (type, file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/driver-uploads/${type}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadVehicleImages: (files) => {
    const formData = new FormData();
    files.forEach((f) => formData.append('images', f));
    return api.post('/driver-uploads/vehicle-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ==================== ADMIN ====================
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getInstantCustomers: (params) => api.get('/admin/instant-customers', { params }),
  getCustomers: (params) => api.get('/admin/customers', { params }),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  blockCustomer: (id) => api.patch(`/admin/customers/${id}/block`),
  unblockCustomer: (id) => api.patch(`/admin/customers/${id}/unblock`),
  deleteCustomer: (id) => api.delete(`/admin/customers/${id}`),
  getDrivers: (params) => api.get('/admin/drivers', { params }),
  getPendingDrivers: () => api.get('/admin/drivers/pending'),
  getApprovedDrivers: () => api.get('/admin/drivers/approved'),
  getRejectedDrivers: () => api.get('/admin/drivers/rejected'),
  getDriver: (id) => api.get(`/admin/drivers/${id}`),
  approveDriver: (id) => api.patch(`/admin/drivers/${id}/approve`),
  rejectDriver: (id, data) => api.patch(`/admin/drivers/${id}/reject`, data),
  blockDriver: (id) => api.patch(`/admin/drivers/${id}/block`),
  unblockDriver: (id) => api.patch(`/admin/drivers/${id}/unblock`),
  deleteDriver: (id) => api.delete(`/admin/drivers/${id}`),
  getVehicles: () => api.get('/admin/vehicles'),
  getVehicle: (id) => api.get(`/admin/vehicles/${id}`),
  uploadVehicleImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/admin/vehicles/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  createVehicle: (data) => api.post('/admin/vehicles', data),
  updateVehicle: (id, data) => api.put(`/admin/vehicles/${id}`, data),
  enableVehicle: (id) => api.patch(`/admin/vehicles/${id}/enable`),
  disableVehicle: (id) => api.patch(`/admin/vehicles/${id}/disable`),
  deleteVehicle: (id) => api.delete(`/admin/vehicles/${id}`),
  getBookings: (params) => api.get('/admin/bookings', { params }),
  getBooking: (id) => api.get(`/admin/bookings/${id}`),
  assignDriver: (id, data) => api.patch(`/admin/bookings/${id}/assign-driver`, data),
  cancelBooking: (id, data) => api.patch(`/admin/bookings/${id}/cancel`, data),
  completeBooking: (id) => api.patch(`/admin/bookings/${id}/complete`),
  getWithdrawals: () => api.get('/admin/withdrawals'),
  approveWithdrawal: (id) => api.patch(`/admin/withdrawals/${id}/approve`),
  rejectWithdrawal: (id, data) => api.patch(`/admin/withdrawals/${id}/reject`, data),
  getReviews: (params) => api.get('/admin/reviews', { params }),
  hideReview: (id) => api.patch(`/admin/reviews/${id}/hide`),
  unhideReview: (id) => api.patch(`/admin/reviews/${id}/unhide`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
};

// ==================== PAYMENTS ====================
export const paymentAPI = {
  createOrder: (data) => api.post('/payments/create-order', data),
  verify: (data) => api.post('/payments/verify', data),
  getHistory: (params) => api.get('/payments/history', { params }),
  getById: (id) => api.get(`/payments/${id}`),
  refund: (id) => api.post(`/payments/refund/${id}`),
};

// ==================== NOTIFICATIONS ====================
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAllRead: () => api.patch('/notifications/read-all'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
  // Browser push (Web Push opt-in for background booking alerts)
  getVapidKey: () => api.get('/notifications/vapid-public-key'),
  savePushSubscription: (data) => api.post('/notifications/push-subscriptions', data),
  removePushSubscription: (data) => api.delete('/notifications/push-subscriptions', { data }),
};

// ==================== FAVORITES ====================
export const favoriteAPI = {
  getAll: () => api.get('/favorites'),
  create: (data) => api.post('/favorites', data),
  update: (id, data) => api.put(`/favorites/${id}`, data),
  delete: (id) => api.delete(`/favorites/${id}`),
};

// ==================== HISTORY ====================
export const historyAPI = {
  getAll: (params) => api.get('/history', { params }),
};

// ==================== REVIEWS ====================
export const reviewAPI = {
  create: (bookingId, data) => api.post(`/reviews/${bookingId}`, data),
  getMyReviews: (params) => api.get('/reviews/my', { params }),
  getDriverReviews: (params) => api.get('/reviews/driver', { params }),
};

// ==================== INVOICE ====================
export const invoiceAPI = {
  download: async (bookingId) => {
    const response = await api.get(`/invoice/${bookingId}`, {
      responseType: 'blob',
    });
    return response;
  },
};

// ==================== MAPS ====================
export const mapsAPI = {
  getRoute: (data) => api.post('/maps/route', data),
  getETA: (data) => api.post('/maps/eta', data),
  reverseGeocode: (data) => api.post('/maps/reverse-geocode', data),
  autocomplete: (params) => api.get('/maps/autocomplete', { params }),
  getPlaceDetails: (params) => api.get('/maps/place-details', { params }),
};

// ==================== FARES ====================
export const fareAPI = {
  estimate: (data) => api.post('/fares/estimate', data),
};

// ==================== VEHICLES ====================
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
};

// ==================== UPLOADS ====================
export const uploadAPI = {
  profileImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/uploads/profile-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// ==================== AI ASSISTANT ====================
export const aiAPI = {
  chat: (message, history = []) => api.post('/ai/chat', { message, history }),
};
