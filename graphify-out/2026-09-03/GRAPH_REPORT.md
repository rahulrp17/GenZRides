# Graph Report - Cab Booking App  (2026-09-03)

## Corpus Check
- 208 files · ~1,552,570 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 933 nodes · 1920 edges · 67 communities (55 shown, 12 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 138 edges (avg confidence: 0.85)
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
- EmptyState.jsx
- notification.service.js
- favoriteLocation.routes.js
- useAuth
- jest
- socket/index.js
- googleMaps.service.js
- App.jsx
- Skeleton.jsx
- common.validator.js
- React + Vite
- validateParams
- AGENTS.md
- Booking.js
- endpoints.js
- QueryProvider.jsx
- validate.middleware.js
- react
- validate
- backend/package.json
- Pagination.jsx
- review.routes.js
- CurrentRideCustomer.jsx
- dispatch.routes.js
- auth.middleware.js
- vehicle.routes.js
- @react-google-maps/api
- payment.service.js
- dispatch.service.js
- DriverDocuments.jsx
- scripts
- frontend/package.json
- moduleFileExtensions
- theme.js
- testMatch
- BookRide.jsx
- lucide-react
- react-dom
- react-icons

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `notifyUser()` - 25 edges
3. `EmptyState()` - 24 edges
4. `authenticate()` - 21 edges
5. `TableSkeleton()` - 17 edges
6. `ErrorState()` - 16 edges
7. `Pagination()` - 16 edges
8. `app` - 13 edges
9. `authorize()` - 13 edges
10. `validate()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `handlePaymentCaptured()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/controllers/webhook.controller.js → backend/src/services/notification.service.js
- `completeBooking()` --calls--> `creditWallet()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/wallet.service.js
- `rotateRefreshToken()` --calls--> `verifyRefreshToken()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js
- `logoutUser()` --calls--> `hashToken()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js
- `createBooking()` --calls--> `getRoute()`  [EXTRACTED]
  backend/src/services/booking.service.js → backend/src/services/googleMaps.service.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (67 total, 12 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.10
Nodes (28): app, configuredOrigins, connectDB(), closeRedis(), getRedisClient(), isRedisConnected(), authLimiter, createLimiter() (+20 more)

### Community 1 - "Home.jsx"
Cohesion: 0.14
Nodes (9): About(), BookingTariff(), tabs, FarePricing(), Hero(), testimonials, WhyChooseUs(), FloatingIcons() (+1 more)

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
Cohesion: 0.11
Nodes (19): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+11 more)

### Community 9 - "auth.routes.js"
Cohesion: 0.12
Nodes (24): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver(), router (+16 more)

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.12
Nodes (17): framer-motion, dependencies, axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, react-router-dom, react-toastify (+9 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.12
Nodes (14): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, router (+6 more)

### Community 15 - "booking.service.js"
Cohesion: 0.14
Nodes (19): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), markArrived() (+11 more)

### Community 16 - "EmptyState.jsx"
Cohesion: 0.31
Nodes (9): Badge(), ConfirmDialog(), EmptyState(), Modal(), SearchBar(), TableSkeleton(), CustomerBookings(), STATUS_COLORS (+1 more)

### Community 17 - "notification.service.js"
Cohesion: 0.09
Nodes (31): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), getAvailableBookings(), getBookingById(), getMyBookings() (+23 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "useAuth"
Cohesion: 0.06
Nodes (36): App(), Login(), DASHBOARD_ROUTES, Navbar(), ProtectedRoute(), AuthContext, AuthProvider(), AppContext (+28 more)

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.20
Nodes (9): acceptBooking(), rejectBooking(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), initializeSocket(), addUser(), removeUser() (+1 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.25
Nodes (6): estimateFare(), calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "App.jsx"
Cohesion: 0.07
Nodes (27): Footer(), ScrollProgress(), ScrollToTopHandler(), About(), features, AdminBookingRequests(), AdminDashboard(), ManageBookings() (+19 more)

### Community 24 - "Skeleton.jsx"
Cohesion: 0.20
Nodes (10): ErrorState(), CardSkeleton(), StatsCard(), CurrentRide(), decodePolyline(), mapContainerStyle, mapOptions, STATUS_FLOW (+2 more)

### Community 26 - "common.validator.js"
Cohesion: 0.22
Nodes (10): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router, router, fareEstimateSchema (+2 more)

### Community 28 - "validateParams"
Cohesion: 0.36
Nodes (5): downloadInvoice(), validateParams(), router, generateInvoice(), bookingIdParamSchema

### Community 39 - "Booking.js"
Cohesion: 0.09
Nodes (8): bookingSchema, locationSchema, driverWalletSchema, transactionSchema, paymentSchema, userSchema, vehicleSchema, walletTransactionSchema

### Community 40 - "endpoints.js"
Cohesion: 0.14
Nodes (13): Booking(), getInvoiceAmount(), Invoices(), Payments(), api, failedQueue, bookingAPI, dispatchAPI (+5 more)

### Community 42 - "validate.middleware.js"
Cohesion: 0.18
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 44 - "validate"
Cohesion: 0.32
Nodes (4): rateDriver(), validate(), router, rateDriverSchema

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 46 - "Pagination.jsx"
Cohesion: 0.20
Nodes (10): Pagination(), ListSkeleton(), AdminNotifications(), Notifications(), DriverHistory(), DriverNotifications(), DriverReviews(), DriverWallet() (+2 more)

### Community 47 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 48 - "CurrentRideCustomer.jsx"
Cohesion: 0.27
Nodes (8): formatTime(), RideTimeline(), STAGES, CurrentRideCustomer(), decodePolyline(), mapContainerStyle, mapOptions, STATUS_FLOW

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "auth.middleware.js"
Cohesion: 0.39
Nodes (5): getDriverPerformance(), toggleOnlineStatus(), authenticate(), router, verifyToken()

### Community 51 - "vehicle.routes.js"
Cohesion: 0.36
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), authorize(), router

### Community 54 - "dispatch.service.js"
Cohesion: 0.52
Nodes (6): dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), sendToNextDriver(), sendRideRequest()

### Community 55 - "DriverDocuments.jsx"
Cohesion: 0.40
Nodes (5): ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 59 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 63 - "BookRide.jsx"
Cohesion: 0.11
Nodes (20): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces(), CHENNAI_CENTER (+12 more)

## Knowledge Gaps
- **158 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+153 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `googleMaps.routes.js`, `auth.routes.js`, `validate.middleware.js`, `driver.routes.js`, `payment.routes.js`, `driverUpload.routes.js`, `validate`, `review.routes.js`, `notification.service.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `vehicle.routes.js`, `common.validator.js`, `validateParams`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `backend/package.json`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `booking.service.js` to `app.js`, `notification.service.js`, `payment.service.js`, `socket/index.js`, `dispatch.service.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _158 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09634146341463415 - nodes in this community are weakly interconnected._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._