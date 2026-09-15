# Graph Report - Cab Booking App  (2026-09-15)

## Corpus Check
- 269 files · ~3,562,913 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1380 nodes · 3113 edges · 115 communities (88 shown, 27 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `8198a7a4`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- redisRateLimiter.js
- Reveal.jsx
- invoice.service.js
- admin.routes.js
- dependencies
- DriverProfilePage.jsx
- admin.service.js
- devDependencies
- devDependencies
- moduleFileExtensions
- payment.routes.js
- driver.routes.js
- dependencies
- driverUpload.routes.js
- favoriteLocation.service.js
- booking.service.js
- AutoPushSync.jsx
- booking.routes.js
- favoriteLocation.routes.js
- endpoints.js
- jest
- socket/index.js
- googleMaps.service.js
- useAuth
- CurrentRideCustomer.jsx
- notification.routes.js
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- ConfirmPage.jsx
- QueryProvider.jsx
- user.routes.js
- googleMaps.routes.js
- DriverLayout.jsx
- backend/package.json
- common.validator.js
- app.js
- dispatch.routes.js
- DriverRegister.jsx
- Skeleton.jsx
- Home.jsx
- useSocket
- App.jsx
- auth.middleware.js
- scripts
- server.js
- Vehicles.jsx
- AdminCharts.jsx
- theme.js
- main.jsx
- LocationPicker.jsx
- Testiminols.jsx
- api.js
- ErrorState.jsx
- vehicle.routes.js
- frontend/package.json
- whatsapp.service.js
- driverStatus.routes.js
- email.service.js
- playwright
- DriverDashboard.jsx
- validate
- ride-flow.spec.js
- react-hot-toast
- VehicleSelector.jsx
- ManageDrivers.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- webhook.controller.js
- About.jsx
- fare.service.js
- RouteServices.jsx
- socket.io-client
- SEO.jsx
- vercel.json
- validate.middleware.js
- RouteErrorBoundary
- react-hook-form
- RideMap.jsx
- push.service.js
- collectCoverageFrom
- devDependencies
- lucide-react
- axios
- connect-redis
- cookie-parser
- dotenv
- express
- express-validator
- helmet
- ioredis
- mongoose
- morgan
- multer
- razorpay
- zod
- react

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 39 edges
2. `ErrorState()` - 35 edges
3. `notifyUser()` - 33 edges
4. `useSocket()` - 33 edges
5. `SEO()` - 33 edges
6. `EmptyState()` - 25 edges
7. `authenticate()` - 22 edges
8. `getIO()` - 21 edges
9. `Reveal()` - 20 edges
10. `Modal()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js
- `DriverBookings()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverBookings.jsx → frontend/src/Context/SocketContext.jsx
- `AdminProfile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/admin/AdminProfile.jsx → frontend/src/hooks/useAuth.js
- `Profile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/Profile.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (115 total, 27 thin omitted)

### Community 0 - "redisRateLimiter.js"
Cohesion: 0.16
Nodes (11): getRedisClient(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter, IORedisRateLimitStore (+3 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.12
Nodes (20): AirportDetail, AirportTransfers, PopularRoutes, RouteDetail, Services, cardHover, GlowBlobs(), Reveal() (+12 more)

### Community 2 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 3 - "admin.routes.js"
Cohesion: 0.07
Nodes (49): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+41 more)

### Community 4 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, bcryptjs, cloudinary, compression, cors, express-rate-limit, jsonwebtoken, nodemailer (+15 more)

### Community 5 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (19): invalidateCache(), isRedisConnected(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), cancelBooking() (+11 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): framer-motion, dependencies, axios, framer-motion, react-dom, @react-google-maps/api, react-icons, react-router-dom (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.26
Nodes (8): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage(), typeParamSchema

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.13
Nodes (23): supportsTransactions(), withTransaction(), withdrawalRequestSchema, completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking() (+15 more)

### Community 16 - "AutoPushSync.jsx"
Cohesion: 0.43
Nodes (13): AutoPushSync(), PushToggle(), getExistingSubscription(), getPushPermission(), getReadyRegistration(), isPushApiSupported(), isPushSupported(), registerServiceWorker() (+5 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.08
Nodes (40): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+32 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "endpoints.js"
Cohesion: 0.16
Nodes (11): DriverDocuments, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), dispatchAPI, driverAPI, driverStatusAPI (+3 more)

### Community 20 - "jest"
Cohesion: 0.17
Nodes (12): jest, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns, ^.+\\.js$ (+4 more)

### Community 21 - "socket/index.js"
Cohesion: 0.13
Nodes (20): assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking() (+12 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.36
Nodes (4): calculateDistance(), getRoute(), headers(), requestRoute()

### Community 23 - "useAuth"
Cohesion: 0.12
Nodes (17): DriverContinue, DriverLogin, DASHBOARD_ROUTES, NOTIF_ROUTES, PROFILE_ROUTES, ProtectedRoute(), AuthContext, useAuth() (+9 more)

### Community 24 - "CurrentRideCustomer.jsx"
Cohesion: 0.13
Nodes (20): CurrentRide, CurrentRideCustomer, formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo(), toMs() (+12 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 28 - "auth.routes.js"
Cohesion: 0.09
Nodes (32): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+24 more)

### Community 39 - "driver.service.js"
Cohesion: 0.09
Nodes (6): driverWalletSchema, transactionSchema, walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "ConfirmPage.jsx"
Cohesion: 0.13
Nodes (19): CarTypePage, ConfirmPage, GuestBookingPage, WaitingPage, Footer(), PageHero(), Navbar(), CarTypePage() (+11 more)

### Community 42 - "user.routes.js"
Cohesion: 0.20
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 44 - "DriverLayout.jsx"
Cohesion: 0.16
Nodes (13): AdminLayout, CustomerLayout, DriverLayout, bookingIdOf(), detailsUrlFor(), PushListener(), routeSummary(), AdminLayout() (+5 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.32
Nodes (5): guestSearchLimiter, estimateFare(), router, fareEstimateSchema, objectId

### Community 48 - "app.js"
Cohesion: 0.16
Nodes (6): app, configuredOrigins, driverProfileSchema, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "DriverRegister.jsx"
Cohesion: 0.11
Nodes (15): DriverRegister, ForgotPassword, Login, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES, AuthSplit() (+7 more)

### Community 51 - "Skeleton.jsx"
Cohesion: 0.09
Nodes (26): AdminNotifications, CustomerReviews, DriverBookings, DriverHistory, DriverNotifications, DriverReviews, DriverWallet, Notifications (+18 more)

### Community 52 - "Home.jsx"
Cohesion: 0.10
Nodes (17): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, Hero(), DriverCTA() (+9 more)

### Community 53 - "useSocket"
Cohesion: 0.12
Nodes (31): AdminBookingRequests, DriverBookingDetail, AssignDriverDialog(), CancelReasonDialog(), DEFAULT_REASONS, Modal(), SocketContext, useSocket() (+23 more)

### Community 54 - "App.jsx"
Cohesion: 0.14
Nodes (11): BookingDetailsPage, BookRide, CustomerBookings, Invoices, ManageBookings, RideHistory, ScrollProgress(), ScrollToTopHandler() (+3 more)

### Community 55 - "auth.middleware.js"
Cohesion: 0.21
Nodes (8): authenticate(), getCachedUser(), allowedMimeTypes, storage, upload, uploadSingle(), router, verifyToken()

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 59 - "Vehicles.jsx"
Cohesion: 0.29
Nodes (6): AttachVehicle, AttachVehicle(), cardVariants, imageForVehicle(), vehicles, vehicleAPI

### Community 60 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "main.jsx"
Cohesion: 0.22
Nodes (7): App(), AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient

### Community 63 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "ErrorState.jsx"
Cohesion: 0.16
Nodes (10): AdminDashboard, CustomerDashboard, Earnings, ManageWithdrawals, ErrorState(), CardSkeleton(), StatsCard(), STATUS_BADGE (+2 more)

### Community 67 - "vehicle.routes.js"
Cohesion: 0.39
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router, idParamSchema

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "driverStatus.routes.js"
Cohesion: 0.24
Nodes (3): getDriverPerformance(), toggleOnlineStatus(), router

### Community 71 - "email.service.js"
Cohesion: 0.07
Nodes (22): razorpay, bookingSchema, locationSchema, emailLogSchema, reviewSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress() (+14 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverDashboard.jsx"
Cohesion: 0.18
Nodes (7): DriverDashboard, COLORS, DriverCharts, DriverPie, DriverCharts, DriverDashboard(), DriverPie

### Community 74 - "validate"
Cohesion: 0.32
Nodes (4): rateDriver(), validate(), router, rateDriverSchema

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 77 - "VehicleSelector.jsx"
Cohesion: 0.32
Nodes (5): cardVariants, containerVariants, formatCurrency(), vehicleImageFor(), VehicleSelector()

### Community 78 - "ManageDrivers.jsx"
Cohesion: 0.11
Nodes (13): FavoriteLocations, ManageCustomers, ManageDrivers, ManageReviews, ManageVehicles, Badge(), ConfirmDialog(), SearchBar() (+5 more)

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 82 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 83 - "About.jsx"
Cohesion: 0.29
Nodes (5): About, features, pillars, stats, values

### Community 85 - "RouteServices.jsx"
Cohesion: 0.33
Nodes (5): PopularRoutes(), ROUTES, SERVICES, FareNotes(), NOTES

### Community 87 - "SEO.jsx"
Cohesion: 0.10
Nodes (17): ContactUs, Info, InfoDetail, NotFound, getOrigin(), SEO(), upsertJsonLd(), upsertLink() (+9 more)

### Community 90 - "validate.middleware.js"
Cohesion: 0.15
Nodes (13): getRideHistory(), createReview(), getDriverReviews(), getMyReviews(), authorize(), validateParams(), validateQuery(), router (+5 more)

### Community 95 - "RideMap.jsx"
Cohesion: 0.33
Nodes (6): CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), RideMap

### Community 96 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 97 - "collectCoverageFrom"
Cohesion: 0.50
Nodes (4): collectCoverageFrom, !src/config/**, src/**/*.js, !src/seeds/**

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

## Knowledge Gaps
- **246 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+241 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `push.service.js`, `admin.service.js`, `driver.service.js`, `email.service.js`, `booking.routes.js`, `webhook.controller.js`, `socket/index.js`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `redisRateLimiter.js` to `webhook.controller.js`, `server.js`, `admin.service.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `notification.routes.js`, `vehicle.routes.js`, `driverStatus.routes.js`, `payment.routes.js`, `driver.routes.js`, `googleMaps.routes.js`, `driverUpload.routes.js`, `validate`, `common.validator.js`, `user.routes.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `validate.middleware.js`, `auth.routes.js`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _246 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11742424242424243 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07127882599580712 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._