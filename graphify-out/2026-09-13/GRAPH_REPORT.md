# Graph Report - Cab Booking App  (2026-09-12)

## Corpus Check
- 259 files · ~2,402,245 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1313 nodes · 2943 edges · 94 communities (76 shown, 18 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `cba1cc9b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- Reveal.jsx
- review.service.js
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
- endpoints.js
- Info.jsx
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
- auth.middleware.js
- User.js
- dispatch.routes.js
- SEO.jsx
- notification.service.js
- Home.jsx
- invoice.routes.js
- App.jsx
- push.service.js
- scripts
- payment.service.js
- Vehicles.jsx
- moduleFileExtensions
- theme.js
- main.jsx
- BookRide.jsx
- Testiminols.jsx
- api.js
- DriverDashboard.jsx
- common.validator.js
- frontend/package.json
- whatsapp.service.js
- dispatch.service.js
- useAuth
- RouteErrorBoundary
- AdminCharts.jsx
- react-dom
- react-router-dom
- react-hot-toast
- recharts
- @tanstack/react-query
- swiper
- tailwindcss
- TariffChart.jsx
- webhook.controller.js
- AutoPushSync.jsx
- validate.middleware.js
- fare.service.js
- getRedisClient
- vercel.json
- review.routes.js
- react-hook-form

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 37 edges
2. `notifyUser()` - 33 edges
3. `SEO()` - 31 edges
4. `useSocket()` - 29 edges
5. `EmptyState()` - 24 edges
6. `authenticate()` - 22 edges
7. `getIO()` - 21 edges
8. `Reveal()` - 20 edges
9. `Modal()` - 18 edges
10. `ErrorState()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js
- `DriverLogin()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver-auth/DriverLogin.jsx → frontend/src/hooks/useAuth.js
- `DriverDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverDashboard.jsx → frontend/src/hooks/useAuth.js
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/layouts/AdminLayout.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (94 total, 18 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.13
Nodes (20): configuredOrigins, connectDB(), closeRedis(), isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter (+12 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.08
Nodes (31): About, AirportDetail, AirportTransfers, ContactUs, InfoDetail, PopularRoutes, RouteDetail, Services (+23 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (53): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+45 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+41 more)

### Community 5 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (19): invalidateCache(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), withdrawalRequestSchema, cancelBooking() (+11 more)

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, jest (+9 more)

### Community 8 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+11 more)

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
Cohesion: 0.12
Nodes (17): framer-motion, dependencies, axios, framer-motion, lucide-react, react, @react-google-maps/api, react-icons (+9 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.23
Nodes (9): uploadDriverDocumentFile(), uploadVehicleImages(), validateParams(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage() (+1 more)

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.13
Nodes (24): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+16 more)

### Community 16 - "role.middleware.js"
Cohesion: 0.43
Nodes (4): getDriverPerformance(), toggleOnlineStatus(), authorize(), router

### Community 17 - "booking.routes.js"
Cohesion: 0.16
Nodes (26): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+18 more)

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
Cohesion: 0.22
Nodes (9): acceptBooking(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), driverLocationLast, initializeSocket(), addUser(), removeUser() (+1 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.33
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "endpoints.js"
Cohesion: 0.05
Nodes (73): AssignDriverDialog(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), ErrorState(), Modal() (+65 more)

### Community 24 - "Info.jsx"
Cohesion: 0.33
Nodes (4): Info, faqJsonLd, FAQS, SECTIONS

### Community 26 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 28 - "email.service.js"
Cohesion: 0.10
Nodes (26): emailLogSchema, loginUser(), logoutUser(), registerCustomer(), registerDriver(), requestPasswordReset(), rotateRefreshToken(), tokenMatches() (+18 more)

### Community 39 - "driver.service.js"
Cohesion: 0.11
Nodes (4): walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "ConfirmPage.jsx"
Cohesion: 0.10
Nodes (22): CarTypePage, ConfirmPage, GuestBookingPage, WaitingPage, Footer(), Hero(), DASHBOARD_ROUTES, Navbar() (+14 more)

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

### Community 47 - "auth.middleware.js"
Cohesion: 0.27
Nodes (6): rateDriver(), authenticate(), getCachedUser(), router, verifyToken(), rateDriverSchema

### Community 48 - "User.js"
Cohesion: 0.08
Nodes (11): app, bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema, userSchema (+3 more)

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "SEO.jsx"
Cohesion: 0.16
Nodes (12): DriverLogin, ForgotPassword, NotFound, ResetPassword, AUTH_SLIDES, AuthSplit(), getOrigin(), SEO() (+4 more)

### Community 51 - "notification.service.js"
Cohesion: 0.16
Nodes (13): notificationSchema, bookingAccepted(), bookingCancelled(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed(), paymentSuccess() (+5 more)

### Community 52 - "Home.jsx"
Cohesion: 0.09
Nodes (21): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), ROUTES (+13 more)

### Community 53 - "invoice.routes.js"
Cohesion: 0.27
Nodes (7): downloadInvoice(), router, __dirname, __filename, generateInvoice(), LOGO_PATH, bookingIdParamSchema

### Community 54 - "App.jsx"
Cohesion: 0.06
Nodes (31): AdminBookingRequests, AdminDashboard, AdminNotifications, BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerBookings, CustomerDashboard (+23 more)

### Community 55 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 59 - "Vehicles.jsx"
Cohesion: 0.20
Nodes (8): AttachVehicle, imageFor(), VehicleShowcase(), AttachVehicle(), cardVariants, imageForVehicle(), vehicles, vehicleAPI

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "main.jsx"
Cohesion: 0.21
Nodes (8): App(), AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient, authAPI

### Community 63 - "BookRide.jsx"
Cohesion: 0.10
Nodes (27): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+19 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "DriverDashboard.jsx"
Cohesion: 0.18
Nodes (5): DriverDashboard, COLORS, DriverCharts, DriverDashboard(), DriverPie

### Community 67 - "common.validator.js"
Cohesion: 0.18
Nodes (12): estimateFare(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), validate(), router, router (+4 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.26
Nodes (13): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+5 more)

### Community 70 - "dispatch.service.js"
Cohesion: 0.46
Nodes (7): dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), sendRideRequest()

### Community 71 - "useAuth"
Cohesion: 0.12
Nodes (19): DriverContinue, DriverProfilePage, Login, Profile, getAuthErrorMessage(), Login(), ProtectedRoute(), AuthContext (+11 more)

### Community 73 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 82 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 83 - "AutoPushSync.jsx"
Cohesion: 0.47
Nodes (12): AutoPushSync(), PushToggle(), getExistingSubscription(), getPushPermission(), getReadyRegistration(), isPushApiSupported(), isPushSupported(), registerServiceWorker() (+4 more)

### Community 84 - "validate.middleware.js"
Cohesion: 0.47
Nodes (3): getRideHistory(), validateQuery(), router

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

## Knowledge Gaps
- **218 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+213 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `dispatch.service.js`, `admin.service.js`, `driver.service.js`, `webhook.controller.js`, `notification.service.js`, `socket/index.js`, `push.service.js`, `payment.service.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `common.validator.js`, `googleMaps.routes.js`, `review.routes.js`, `auth.routes.js`, `payment.routes.js`, `driver.routes.js`, `user.routes.js`, `driverUpload.routes.js`, `role.middleware.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `validate.middleware.js`, `invoice.routes.js`, `notification.routes.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `withCache()` connect `admin.service.js` to `app.js`, `auth.middleware.js`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _218 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.12923076923076923 - nodes in this community are weakly interconnected._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08235294117647059 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0597567424643046 - nodes in this community are weakly interconnected._