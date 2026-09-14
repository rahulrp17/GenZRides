# Graph Report - Cab Booking App  (2026-09-14)

## Corpus Check
- 265 files · ~3,248,393 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1364 nodes · 3090 edges · 96 communities (78 shown, 18 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 154 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `aa47fa91`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- googleMaps.routes.js
- Reveal.jsx
- review.service.js
- admin.routes.js
- dependencies
- endpoints.js
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
- validate.middleware.js
- booking.routes.js
- favoriteLocation.routes.js
- DriverDocuments.jsx
- jest
- Booking.js
- googleMaps.service.js
- Skeleton.jsx
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
- push.service.js
- scripts
- server.js
- Vehicles.jsx
- moduleFileExtensions
- theme.js
- main.jsx
- BookRide.jsx
- Testiminols.jsx
- api.js
- ErrorState.jsx
- vehicle.routes.js
- frontend/package.json
- whatsapp.service.js
- auth.middleware.js
- invalidateCache
- playwright
- AdminCharts.jsx
- validateParams
- react-router-dom
- react-hot-toast
- DriverProfile.js
- ManageDrivers.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- webhook.controller.js
- payment.service.js
- fare.service.js
- lucide-react
- socket.io-client
- Info.jsx
- vercel.json
- review.routes.js
- RouteErrorBoundary
- WithdrawalRequest.js
- @react-google-maps/api

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

## Communities (96 total, 18 thin omitted)

### Community 0 - "googleMaps.routes.js"
Cohesion: 0.09
Nodes (23): getRedisClient(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter, guestSearchLimiter (+15 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.08
Nodes (34): About, AirportDetail, AirportTransfers, ContactUs, InfoDetail, PopularRoutes, RouteDetail, Services (+26 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (54): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+46 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+41 more)

### Community 5 - "endpoints.js"
Cohesion: 0.13
Nodes (9): AdminDashboard, ConfirmDialog(), ListSkeleton(), ACCEPTED_IMAGE_TYPES, VehicleCard, adminAPI, dispatchAPI, driverStatusAPI (+1 more)

### Community 6 - "admin.service.js"
Cohesion: 0.07
Nodes (4): assignDriver(), cancelBooking(), getDashboardStats(), getVehicles()

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
Nodes (19): framer-motion, dependencies, axios, framer-motion, react, react-dom, react-hook-form, react-icons (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.26
Nodes (8): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage(), typeParamSchema

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.14
Nodes (22): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+14 more)

### Community 16 - "validate.middleware.js"
Cohesion: 0.32
Nodes (3): getRideHistory(), validateQuery(), router

### Community 17 - "booking.routes.js"
Cohesion: 0.08
Nodes (40): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+32 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "DriverDocuments.jsx"
Cohesion: 0.33
Nodes (6): DriverDocuments, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "Booking.js"
Cohesion: 0.12
Nodes (21): bookingSchema, locationSchema, getAvailableBookings(), acceptBooking(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout() (+13 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.36
Nodes (4): calculateDistance(), getRoute(), headers(), requestRoute()

### Community 23 - "Skeleton.jsx"
Cohesion: 0.15
Nodes (10): EmptyState(), Pagination(), TableSkeleton(), getInvoiceAmount(), Invoices(), STATUS_COLORS, driverAPI, invoiceAPI (+2 more)

### Community 24 - "CurrentRideCustomer.jsx"
Cohesion: 0.15
Nodes (17): formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo(), toMs(), useRideTime(), CurrentRideCustomer() (+9 more)

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
Cohesion: 0.09
Nodes (24): CarTypePage, ConfirmPage, GuestBookingPage, WaitingPage, Footer(), Hero(), DASHBOARD_ROUTES, Navbar() (+16 more)

### Community 42 - "user.routes.js"
Cohesion: 0.18
Nodes (7): changePassword(), getAllUsers(), updateProfile(), router, paginationQuerySchema, changePasswordSchema, updateProfileSchema

### Community 43 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 44 - "useAuth"
Cohesion: 0.07
Nodes (49): AdminLayout, AdminProfile, CustomerLayout, DriverLayout, DriverProfilePage, Profile, AutoPushSync(), ACCENT_BTN (+41 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.17
Nodes (9): estimateFare(), rateDriver(), validate(), router, router, bookingIdParamSchema, fareEstimateSchema, objectId (+1 more)

### Community 48 - "app.js"
Cohesion: 0.18
Nodes (5): app, configuredOrigins, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "SEO.jsx"
Cohesion: 0.10
Nodes (19): DriverContinue, AUTH_SLIDES, AuthSplit(), getAuthErrorMessage(), Login(), getOrigin(), SEO(), upsertJsonLd() (+11 more)

### Community 51 - "useSocket"
Cohesion: 0.15
Nodes (16): SocketContext, useSocket(), AdminNotifications(), bookingIdOf(), ManageBookings(), bookingIdOf(), Notifications(), RideHistory() (+8 more)

### Community 52 - "Home.jsx"
Cohesion: 0.11
Nodes (16): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), SERVICES (+8 more)

### Community 53 - "BookingDetailsPage.jsx"
Cohesion: 0.17
Nodes (19): AssignDriverDialog(), CancelReasonDialog(), DEFAULT_REASONS, Modal(), AdminBookingRequests(), STATUSES, BookingDetailsPage(), formatDateTime() (+11 more)

### Community 54 - "App.jsx"
Cohesion: 0.05
Nodes (38): AdminBookingRequests, AdminNotifications, BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerBookings, CustomerDashboard, CustomerReviews (+30 more)

### Community 55 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

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
Cohesion: 0.20
Nodes (8): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient

### Community 63 - "BookRide.jsx"
Cohesion: 0.10
Nodes (27): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+19 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "ErrorState.jsx"
Cohesion: 0.32
Nodes (5): DriverDashboard, ErrorState(), CardSkeleton(), StatsCard(), STATUS_BADGE

### Community 67 - "vehicle.routes.js"
Cohesion: 0.21
Nodes (10): getDriverPerformance(), toggleOnlineStatus(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), authorize(), router (+2 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "auth.middleware.js"
Cohesion: 0.31
Nodes (9): isRedisConnected(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), authenticate(), getCachedUser() (+1 more)

### Community 71 - "invalidateCache"
Cohesion: 0.21
Nodes (10): invalidateCache(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle(), createVehicle(), deleteVehicle() (+2 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "AdminCharts.jsx"
Cohesion: 0.12
Nodes (8): BAR_COLORS, COLORS, COLORS, DriverCharts, DriverPie, AdminCharts, DriverCharts, DriverPie

### Community 74 - "validateParams"
Cohesion: 0.27
Nodes (7): downloadInvoice(), validateParams(), router, __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 78 - "ManageDrivers.jsx"
Cohesion: 0.33
Nodes (4): Badge(), SearchBar(), ManageDrivers(), normalizeDriver()

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 82 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 87 - "Info.jsx"
Cohesion: 0.33
Nodes (4): Info, faqJsonLd, FAQS, SECTIONS

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

## Knowledge Gaps
- **240 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+235 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **18 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `admin.service.js`, `driver.service.js`, `booking.routes.js`, `webhook.controller.js`, `payment.service.js`, `Booking.js`, `push.service.js`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `googleMaps.routes.js`, `admin.routes.js`, `vehicle.routes.js`, `review.routes.js`, `auth.routes.js`, `validateParams`, `driver.routes.js`, `payment.routes.js`, `driverUpload.routes.js`, `user.routes.js`, `common.validator.js`, `validate.middleware.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `notification.routes.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `useAuth` to `ErrorState.jsx`, `ConfirmPage.jsx`, `SEO.jsx`, `useSocket`, `BookingDetailsPage.jsx`, `main.jsx`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `googleMaps.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09206349206349207 - nodes in this community are weakly interconnected._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07896575821104122 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05888376856118792 - nodes in this community are weakly interconnected._