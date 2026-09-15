# Graph Report - Cab Booking App  (2026-09-15)

## Corpus Check
- 265 files · ~3,260,170 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1363 nodes · 3094 edges · 100 communities (84 shown, 16 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f41ab27c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- googleMaps.routes.js
- Reveal.jsx
- Booking.js
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
- EmptyState.jsx
- CurrentRideCustomer.jsx
- notification.routes.js
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- ConfirmPage.jsx
- QueryProvider.jsx
- validate.middleware.js
- testMatch
- useAuth
- backend/package.json
- common.validator.js
- app.js
- dispatch.routes.js
- SEO.jsx
- useSocket
- Home.jsx
- BookingDetailsPage.jsx
- App.jsx
- scripts
- server.js
- Vehicles.jsx
- AdminCharts.jsx
- theme.js
- Login.jsx
- BookRide.jsx
- Testiminols.jsx
- api.js
- Skeleton.jsx
- vehicle.routes.js
- frontend/package.json
- whatsapp.service.js
- auth.middleware.js
- email.service.js
- playwright
- DriverDashboard.jsx
- rating.routes.js
- react-router-dom
- react-hot-toast
- ManageDrivers.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- webhook.controller.js
- payment.service.js
- fare.service.js
- notification.service.js
- socket.io-client
- Info.jsx
- vercel.json
- review.routes.js
- RouteErrorBoundary
- react-hook-form
- invalidateCache
- push.service.js
- dispatch.service.js
- review.service.js
- lucide-react

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
- `getDashboardStats()` --calls--> `withCache()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/config/redis.js
- `getVehicles()` --calls--> `withCache()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/config/redis.js
- `getVehicles()` --calls--> `withCache()`  [EXTRACTED]
  backend/src/services/vehicle.service.js → backend/src/config/redis.js
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (100 total, 16 thin omitted)

### Community 0 - "googleMaps.routes.js"
Cohesion: 0.09
Nodes (23): getRedisClient(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter, guestSearchLimiter (+15 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.08
Nodes (33): About, AirportDetail, AirportTransfers, ContactUs, InfoDetail, PopularRoutes, RouteDetail, Services (+25 more)

### Community 2 - "Booking.js"
Cohesion: 0.14
Nodes (7): bookingSchema, locationSchema, assignDriver(), __dirname, __filename, LOGO_PATH, point

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (54): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+46 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+41 more)

### Community 5 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (4): withdrawalRequestSchema, cancelBooking(), getDashboardStats(), getVehicles()

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, jest (+9 more)

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
Nodes (19): framer-motion, dependencies, axios, framer-motion, react, react-dom, @react-google-maps/api, react-icons (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.26
Nodes (8): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage(), typeParamSchema

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.14
Nodes (23): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+15 more)

### Community 16 - "AutoPushSync.jsx"
Cohesion: 0.43
Nodes (13): AutoPushSync(), PushToggle(), getExistingSubscription(), getPushPermission(), getReadyRegistration(), isPushApiSupported(), isPushSupported(), registerServiceWorker() (+5 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.16
Nodes (26): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+18 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "endpoints.js"
Cohesion: 0.14
Nodes (15): DriverDocuments, getInvoiceAmount(), Invoices(), PAY_TABS, SORTS, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments() (+7 more)

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.22
Nodes (9): acceptBooking(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), driverLocationLast, initializeSocket(), addUser(), removeUser() (+1 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.33
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "EmptyState.jsx"
Cohesion: 0.16
Nodes (13): AssignDriverDialog(), CancelReasonDialog(), DEFAULT_REASONS, EmptyState(), Modal(), TableSkeleton(), STATUSES, ACCEPTED_IMAGE_TYPES (+5 more)

### Community 24 - "CurrentRideCustomer.jsx"
Cohesion: 0.15
Nodes (17): formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo(), toMs(), useRideTime(), CurrentRideCustomer() (+9 more)

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
Cohesion: 0.10
Nodes (22): CarTypePage, ConfirmPage, GuestBookingPage, WaitingPage, Footer(), Hero(), DASHBOARD_ROUTES, Navbar() (+14 more)

### Community 42 - "validate.middleware.js"
Cohesion: 0.17
Nodes (12): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), authorize(), validate(), validateQuery(), router (+4 more)

### Community 43 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 44 - "useAuth"
Cohesion: 0.11
Nodes (23): AdminLayout, CustomerLayout, DriverContinue, DriverLayout, ProtectedRoute(), bookingIdOf(), detailsUrlFor(), PushListener() (+15 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.22
Nodes (8): estimateFare(), downloadInvoice(), router, router, generateInvoice(), bookingIdParamSchema, fareEstimateSchema, objectId

### Community 48 - "app.js"
Cohesion: 0.16
Nodes (6): app, configuredOrigins, driverProfileSchema, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "SEO.jsx"
Cohesion: 0.10
Nodes (19): DriverLogin, DriverRegister, ForgotPassword, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES, AuthSplit() (+11 more)

### Community 51 - "useSocket"
Cohesion: 0.18
Nodes (14): Pagination(), SocketContext, useSocket(), AdminNotifications(), bookingIdOf(), bookingIdOf(), Notifications(), RideHistory() (+6 more)

### Community 52 - "Home.jsx"
Cohesion: 0.09
Nodes (21): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), ROUTES (+13 more)

### Community 53 - "BookingDetailsPage.jsx"
Cohesion: 0.22
Nodes (13): AdminBookingRequests(), ManageBookings(), BookingDetailsPage(), formatDateTime(), STATUS_COLORS, STATUS_LABELS, STATUS_ORDER, CustomerBookings() (+5 more)

### Community 54 - "App.jsx"
Cohesion: 0.06
Nodes (32): AdminBookingRequests, AdminDashboard, AdminNotifications, BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerBookings, CustomerDashboard (+24 more)

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 59 - "Vehicles.jsx"
Cohesion: 0.33
Nodes (5): AttachVehicle, AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 60 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "Login.jsx"
Cohesion: 0.16
Nodes (11): App(), Login, getAuthErrorMessage(), Login(), AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext (+3 more)

### Community 63 - "BookRide.jsx"
Cohesion: 0.10
Nodes (27): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+19 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "Skeleton.jsx"
Cohesion: 0.16
Nodes (7): ErrorState(), CardSkeleton(), ListSkeleton(), StatsCard(), STATUS_BADGE, favoriteAPI, reviewAPI

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
Cohesion: 0.21
Nodes (12): isRedisConnected(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), getDriverPerformance(), toggleOnlineStatus() (+4 more)

### Community 71 - "email.service.js"
Cohesion: 0.15
Nodes (18): emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients(), getBookingEmailFields(), getConfig() (+10 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverDashboard.jsx"
Cohesion: 0.18
Nodes (7): DriverDashboard, COLORS, DriverCharts, DriverPie, DriverCharts, DriverDashboard(), DriverPie

### Community 74 - "rating.routes.js"
Cohesion: 0.32
Nodes (4): rateDriver(), validateParams(), router, rateDriverSchema

### Community 78 - "ManageDrivers.jsx"
Cohesion: 0.26
Nodes (5): Badge(), ConfirmDialog(), SearchBar(), ManageDrivers(), normalizeDriver()

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 82 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 85 - "notification.service.js"
Cohesion: 0.15
Nodes (14): notificationSchema, bookingAccepted(), bookingCancelled(), createNotification(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed() (+6 more)

### Community 87 - "Info.jsx"
Cohesion: 0.33
Nodes (4): Info, faqJsonLd, FAQS, SECTIONS

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 95 - "invalidateCache"
Cohesion: 0.21
Nodes (10): invalidateCache(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle(), createVehicle(), deleteVehicle() (+2 more)

### Community 96 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 97 - "dispatch.service.js"
Cohesion: 0.46
Nodes (7): dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), sendRideRequest()

## Knowledge Gaps
- **240 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `push.service.js`, `dispatch.service.js`, `admin.service.js`, `driver.service.js`, `webhook.controller.js`, `payment.service.js`, `socket/index.js`, `notification.service.js`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `googleMaps.routes.js`, `admin.routes.js`, `vehicle.routes.js`, `review.routes.js`, `validate.middleware.js`, `driver.routes.js`, `payment.routes.js`, `driverUpload.routes.js`, `rating.routes.js`, `common.validator.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `notification.routes.js`, `auth.routes.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `getIO()` connect `booking.routes.js` to `dispatch.service.js`, `socket/index.js`, `admin.routes.js`, `notification.service.js`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `googleMaps.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09206349206349207 - nodes in this community are weakly interconnected._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07896575821104122 - nodes in this community are weakly interconnected._
- **Should `Booking.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._