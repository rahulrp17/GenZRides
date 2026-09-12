# Graph Report - Cab Booking App  (2026-09-04)

## Corpus Check
- 218 files · ~1,562,289 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 995 nodes · 2094 edges · 65 communities (58 shown, 7 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 139 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- Home.jsx
- DriverProfile.js
- admin.routes.js
- dependencies
- googleMaps.routes.js
- devDependencies
- devDependencies
- auth.routes.js
- payment.routes.js
- driver.routes.js
- dependencies
- driverUpload.routes.js
- favoriteLocation.service.js
- booking.service.js
- server.js
- booking.routes.js
- favoriteLocation.routes.js
- useAuth
- jest
- socket/index.js
- googleMaps.service.js
- App.jsx
- RideMap.jsx
- common.validator.js
- React + Vite
- validateParams
- AGENTS.md
- wallet.service.js
- QueryProvider.jsx
- validate.middleware.js
- testMatch
- validate
- backend/package.json
- review.routes.js
- User.js
- dispatch.routes.js
- auth.middleware.js
- vehicle.routes.js
- BookingTariff.jsx
- Booking.js
- dispatch.service.js
- webhook.controller.js
- scripts
- moduleFileExtensions
- theme.js
- VehicleSelector.jsx
- LocationPicker.jsx
- Testiminols.jsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 31 edges
2. `notifyUser()` - 28 edges
3. `EmptyState()` - 24 edges
4. `authenticate()` - 21 edges
5. `TableSkeleton()` - 17 edges
6. `getIO()` - 16 edges
7. `ErrorState()` - 16 edges
8. `Pagination()` - 16 edges
9. `Modal()` - 14 edges
10. `app` - 13 edges

## Surprising Connections (you probably didn't know these)
- `approveWithdrawal()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/wallet.service.js → backend/src/services/notification.service.js
- `rejectWithdrawalRequest()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/wallet.service.js → backend/src/services/notification.service.js
- `requestWithdrawal()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/wallet.service.js → backend/src/services/notification.service.js
- `getRedisStore()` --calls--> `getRedisClient()`  [EXTRACTED]
  backend/src/config/redisRateLimiter.js → backend/src/config/redis.js
- `redisAvailable()` --calls--> `isRedisConnected()`  [EXTRACTED]
  backend/src/config/redisRateLimiter.js → backend/src/config/redis.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (65 total, 7 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.19
Nodes (13): configuredOrigins, authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), paymentLimiter, redisAvailable() (+5 more)

### Community 1 - "Home.jsx"
Cohesion: 0.06
Nodes (45): Booking(), Hero(), cardHover, PageHero(), GlowBlobs(), Reveal(), SectionHeading(), PopularRoutes() (+37 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (44): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+36 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (45): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+37 more)

### Community 5 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, jest (+9 more)

### Community 8 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+20 more)

### Community 9 - "auth.routes.js"
Cohesion: 0.12
Nodes (24): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver(), router (+16 more)

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.07
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.05
Nodes (39): framer-motion, dependencies, axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, lucide-react, react (+31 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.12
Nodes (14): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, router (+6 more)

### Community 15 - "booking.service.js"
Cohesion: 0.20
Nodes (13): supportsTransactions(), withTransaction(), cancelBooking(), addDriverTip(), cancelBooking(), completeRide(), driverCancelBooking(), markArrived() (+5 more)

### Community 16 - "server.js"
Cohesion: 0.33
Nodes (6): connectDB(), closeRedis(), isRedisConnected(), gracefulShutdown(), io, server

### Community 17 - "booking.routes.js"
Cohesion: 0.08
Nodes (34): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), driverCancelBooking(), getAvailableBookings(), getBookingById() (+26 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "useAuth"
Cohesion: 0.06
Nodes (39): App(), AUTH_SLIDES, AuthSplit(), Login(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES (+31 more)

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.20
Nodes (9): acceptBooking(), getETA(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), initializeSocket(), addUser(), removeUser() (+1 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.21
Nodes (7): estimateFare(), createBooking(), calculateFare(), calculateDistance(), getRoute(), headers(), requestRoute()

### Community 23 - "App.jsx"
Cohesion: 0.06
Nodes (75): Footer(), ScrollProgress(), ScrollToTopHandler(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState() (+67 more)

### Community 24 - "RideMap.jsx"
Cohesion: 0.40
Nodes (5): CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap()

### Community 26 - "common.validator.js"
Cohesion: 0.22
Nodes (10): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router, router, fareEstimateSchema (+2 more)

### Community 28 - "validateParams"
Cohesion: 0.36
Nodes (5): downloadInvoice(), validateParams(), router, generateInvoice(), bookingIdParamSchema

### Community 39 - "wallet.service.js"
Cohesion: 0.15
Nodes (9): driverWalletSchema, transactionSchema, walletTransactionSchema, withdrawalRequestSchema, completeBooking(), approveWithdrawal(), creditWallet(), rejectWithdrawalRequest() (+1 more)

### Community 42 - "validate.middleware.js"
Cohesion: 0.18
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 43 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 44 - "validate"
Cohesion: 0.32
Nodes (4): rateDriver(), validate(), router, rateDriverSchema

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 48 - "User.js"
Cohesion: 0.18
Nodes (4): app, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "auth.middleware.js"
Cohesion: 0.39
Nodes (5): getDriverPerformance(), toggleOnlineStatus(), authenticate(), router, verifyToken()

### Community 51 - "vehicle.routes.js"
Cohesion: 0.36
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), authorize(), router

### Community 53 - "Booking.js"
Cohesion: 0.17
Nodes (3): razorpay, bookingSchema, locationSchema

### Community 54 - "dispatch.service.js"
Cohesion: 0.46
Nodes (7): dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), sendRideRequest()

### Community 55 - "webhook.controller.js"
Cohesion: 0.36
Nodes (8): getRedisClient(), checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "VehicleSelector.jsx"
Cohesion: 0.33
Nodes (3): cardVariants, containerVariants, VehicleSelector()

### Community 63 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

## Knowledge Gaps
- **178 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `admin.service.js`, `wallet.service.js`, `booking.routes.js`, `socket/index.js`, `dispatch.service.js`, `googleMaps.service.js`, `webhook.controller.js`, `Booking.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `googleMaps.routes.js`, `auth.routes.js`, `validate.middleware.js`, `driver.routes.js`, `payment.routes.js`, `driverUpload.routes.js`, `validate`, `review.routes.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `vehicle.routes.js`, `common.validator.js`, `validateParams`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `backend/package.json`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.0642243328810493 - nodes in this community are weakly interconnected._
- **Should `DriverProfile.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._