# Graph Report - Cab Booking App  (2026-09-13)

## Corpus Check
- 260 files · ~2,784,872 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1327 nodes · 2985 edges · 93 communities (81 shown, 12 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `17ceda16`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- redisRateLimiter.js
- Reveal.jsx
- Booking.js
- admin.routes.js
- dependencies
- googleMaps.routes.js
- admin.service.js
- devDependencies
- devDependencies
- auth.routes.js
- payment.routes.js
- driver.routes.js
- dependencies
- driverUpload.routes.js
- favoriteLocation.service.js
- booking.service.js
- role.middleware.js
- booking.routes.js
- favoriteLocation.routes.js
- DriverRegister.jsx
- jest
- socket/index.js
- googleMaps.service.js
- EmptyState.jsx
- CurrentRideCustomer.jsx
- notification.routes.js
- React + Vite
- email.service.js
- AGENTS.md
- driver.service.js
- ConfirmPage.jsx
- QueryProvider.jsx
- user.routes.js
- testMatch
- DriverLayout.jsx
- backend/package.json
- common.validator.js
- app.js
- dispatch.routes.js
- Login.jsx
- useSocket
- Home.jsx
- BookingDetailsPage.jsx
- App.jsx
- push.service.js
- scripts
- server.js
- SEO.jsx
- moduleFileExtensions
- theme.js
- main.jsx
- endpoints.js
- Testiminols.jsx
- api.js
- Skeleton.jsx
- vehicle.routes.js
- frontend/package.json
- whatsapp.service.js
- auth.middleware.js
- useAuth
- LocationPicker.jsx
- AdminCharts.jsx
- VehicleSelector.jsx
- react-router-dom
- react-hot-toast
- RouteServices.jsx
- RideMap.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- webhook.controller.js
- AutoPushSync.jsx
- lucide-react
- socket.io-client
- vercel.json
- review.routes.js
- react-hook-form

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 39 edges
2. `notifyUser()` - 33 edges
3. `useSocket()` - 33 edges
4. `SEO()` - 31 edges
5. `EmptyState()` - 24 edges
6. `authenticate()` - 22 edges
7. `getIO()` - 21 edges
8. `Reveal()` - 20 edges
9. `Modal()` - 18 edges
10. `ErrorState()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `getVehicles()` --calls--> `withCache()`  [EXTRACTED]
  backend/src/services/vehicle.service.js → backend/src/config/redis.js
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js
- `RideHistory()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/customer/RideHistory.jsx → frontend/src/Context/SocketContext.jsx
- `DriverBookings()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverBookings.jsx → frontend/src/Context/SocketContext.jsx

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (93 total, 12 thin omitted)

### Community 0 - "redisRateLimiter.js"
Cohesion: 0.14
Nodes (13): getRedisClient(), isRedisConnected(), memCache, memCacheExpiry, authLimiter, createLimiter(), dispatchLimiter, generalLimiter (+5 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.11
Nodes (23): cardHover, PageHero(), GlowBlobs(), Reveal(), SectionHeading(), features, pillars, stats (+15 more)

### Community 2 - "Booking.js"
Cohesion: 0.12
Nodes (6): bookingSchema, locationSchema, reviewSchema, __dirname, __filename, LOGO_PATH

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (53): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+45 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+41 more)

### Community 5 - "googleMaps.routes.js"
Cohesion: 0.22
Nodes (12): guestSearchLimiter, autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema (+4 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (12): invalidateCache(), withdrawalRequestSchema, cancelBooking(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle() (+4 more)

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, jest (+9 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "auth.routes.js"
Cohesion: 0.15
Nodes (19): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+11 more)

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): framer-motion, dependencies, axios, framer-motion, react, react-dom, @react-google-maps/api, react-icons (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.26
Nodes (8): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage(), typeParamSchema

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.11
Nodes (22): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+14 more)

### Community 16 - "role.middleware.js"
Cohesion: 0.22
Nodes (8): getDriverPerformance(), toggleOnlineStatus(), getRideHistory(), authorize(), validateQuery(), router, router, paginationQuerySchema

### Community 17 - "booking.routes.js"
Cohesion: 0.07
Nodes (42): razorpay, guestBookingLimiter, acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+34 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "DriverRegister.jsx"
Cohesion: 0.20
Nodes (10): DriverDocuments, DriverRegister, ACCEPTED_IMAGE_TYPES, DriverRegister(), validateFile(), ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments() (+2 more)

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.13
Nodes (19): assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking() (+11 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.16
Nodes (8): estimateFare(), calculateFare(), FARE_CONFIG, calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "EmptyState.jsx"
Cohesion: 0.12
Nodes (19): CustomerReviews, DriverHistory, DriverReviews, Payments, AssignDriverDialog(), Badge(), ConfirmDialog(), EmptyState() (+11 more)

### Community 24 - "CurrentRideCustomer.jsx"
Cohesion: 0.13
Nodes (19): CurrentRide, CurrentRideCustomer, formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo(), toMs() (+11 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 28 - "email.service.js"
Cohesion: 0.09
Nodes (30): emailLogSchema, loginUser(), logoutUser(), registerCustomer(), registerDriver(), requestPasswordReset(), rotateRefreshToken(), tokenMatches() (+22 more)

### Community 39 - "driver.service.js"
Cohesion: 0.09
Nodes (6): driverWalletSchema, transactionSchema, walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "ConfirmPage.jsx"
Cohesion: 0.14
Nodes (17): Footer(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES, CarTypePage(), imageFor(), ConfirmPage() (+9 more)

### Community 42 - "user.routes.js"
Cohesion: 0.31
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 43 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 44 - "DriverLayout.jsx"
Cohesion: 0.16
Nodes (14): AdminLayout, CustomerLayout, DriverLayout, bookingIdOf(), detailsUrlFor(), PushListener(), routeSummary(), AdminLayout() (+6 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.16
Nodes (12): downloadInvoice(), rateDriver(), validate(), validateParams(), router, router, router, generateInvoice() (+4 more)

### Community 48 - "app.js"
Cohesion: 0.15
Nodes (7): app, configuredOrigins, driverProfileSchema, paymentSchema, userSchema, vehicleSchema, router

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "Login.jsx"
Cohesion: 0.15
Nodes (9): DriverLogin, ForgotPassword, Login, ResetPassword, AUTH_SLIDES, AuthSplit(), getAuthErrorMessage(), Login() (+1 more)

### Community 51 - "useSocket"
Cohesion: 0.15
Nodes (16): AdminNotifications, DriverNotifications, FavoriteLocations, Notifications, ListSkeleton(), SocketContext, useSocket(), AdminNotifications() (+8 more)

### Community 52 - "Home.jsx"
Cohesion: 0.10
Nodes (17): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, Hero(), DriverCTA() (+9 more)

### Community 53 - "BookingDetailsPage.jsx"
Cohesion: 0.18
Nodes (15): BookingDetailsPage, CustomerBookings, AdminBookingRequests(), BookingDetailsPage(), formatDateTime(), STATUS_COLORS, STATUS_LABELS, STATUS_ORDER (+7 more)

### Community 54 - "App.jsx"
Cohesion: 0.05
Nodes (33): About, AdminBookingRequests, AdminDashboard, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage (+25 more)

### Community 55 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 59 - "SEO.jsx"
Cohesion: 0.14
Nodes (13): NotFound, getOrigin(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), faqJsonLd, FAQS (+5 more)

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "main.jsx"
Cohesion: 0.21
Nodes (8): App(), AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient, authAPI

### Community 63 - "endpoints.js"
Cohesion: 0.12
Nodes (21): BookRide, Invoices, RideHistory, CancelReasonDialog(), DEFAULT_REASONS, BookRide(), getMinDateTime(), getInvoiceAmount() (+13 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "Skeleton.jsx"
Cohesion: 0.12
Nodes (12): DriverBookings, COLORS, ErrorState(), CardSkeleton(), StatsCard(), DriverBookings(), PAY_TABS, SORTS (+4 more)

### Community 67 - "vehicle.routes.js"
Cohesion: 0.39
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router, idParamSchema

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "auth.middleware.js"
Cohesion: 0.31
Nodes (8): memGet(), memSet(), withCache(), authenticate(), getCachedUser(), getDashboardStats(), getVehicles(), verifyToken()

### Community 71 - "useAuth"
Cohesion: 0.13
Nodes (18): AdminProfile, DriverContinue, DriverProfilePage, Profile, ProtectedRoute(), AuthContext, useAuth(), AdminProfile() (+10 more)

### Community 72 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 73 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 74 - "VehicleSelector.jsx"
Cohesion: 0.32
Nodes (5): cardVariants, containerVariants, formatCurrency(), vehicleImageFor(), VehicleSelector()

### Community 77 - "RouteServices.jsx"
Cohesion: 0.33
Nodes (5): PopularRoutes(), ROUTES, SERVICES, FareNotes(), NOTES

### Community 78 - "RideMap.jsx"
Cohesion: 0.33
Nodes (6): CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), RideMap

### Community 81 - "TariffChart.jsx"
Cohesion: 0.22
Nodes (8): imageFor(), VehicleShowcase(), imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData, vehicleAPI

### Community 82 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 83 - "AutoPushSync.jsx"
Cohesion: 0.47
Nodes (12): AutoPushSync(), PushToggle(), getExistingSubscription(), getPushPermission(), getReadyRegistration(), isPushApiSupported(), isPushSupported(), registerServiceWorker() (+4 more)

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

## Knowledge Gaps
- **219 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+214 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `admin.service.js`, `driver.service.js`, `booking.routes.js`, `webhook.controller.js`, `socket/index.js`, `push.service.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `vehicle.routes.js`, `googleMaps.routes.js`, `review.routes.js`, `auth.routes.js`, `payment.routes.js`, `driver.routes.js`, `user.routes.js`, `driverUpload.routes.js`, `common.validator.js`, `role.middleware.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `notification.routes.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _219 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `redisRateLimiter.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10975609756097561 - nodes in this community are weakly interconnected._
- **Should `Booking.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._