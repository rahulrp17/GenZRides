# Graph Report - Cab Booking App  (2026-09-02)

## Corpus Check
- 204 files · ~1,545,659 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 908 nodes · 1845 edges · 60 communities (51 shown, 9 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 137 edges (avg confidence: 0.85)
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
- notification.service.js
- webhook.controller.js
- booking.routes.js
- favoriteLocation.routes.js
- useAuth
- jest
- socket/index.js
- googleMaps.service.js
- App.jsx
- common.validator.js
- notification.routes.js
- React + Vite
- invoice.routes.js
- AGENTS.md
- User.js
- QueryProvider.jsx
- user.routes.js
- react
- validate.middleware.js
- backend/package.json
- review.routes.js
- dispatch.routes.js
- auth.middleware.js
- vehicle.routes.js
- @react-google-maps/api
- auth.service.js
- scripts
- frontend/package.json
- moduleFileExtensions
- BookRide.jsx
- lucide-react
- react-dom
- react-icons

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 29 edges
2. `notifyUser()` - 24 edges
3. `EmptyState()` - 22 edges
4. `authenticate()` - 21 edges
5. `TableSkeleton()` - 16 edges
6. `Pagination()` - 15 edges
7. `app` - 13 edges
8. `authorize()` - 13 edges
9. `validate()` - 13 edges
10. `ErrorState()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `completeBooking()` --calls--> `creditWallet()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/wallet.service.js
- `checkIdempotency()` --calls--> `getRedisClient()`  [EXTRACTED]
  backend/src/controllers/webhook.controller.js → backend/src/config/redis.js
- `handlePaymentCaptured()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/controllers/webhook.controller.js → backend/src/services/notification.service.js
- `rotateRefreshToken()` --calls--> `verifyRefreshToken()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js
- `logoutUser()` --calls--> `hashToken()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (60 total, 9 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.15
Nodes (19): configuredOrigins, connectDB(), closeRedis(), getRedisClient(), isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter (+11 more)

### Community 1 - "Home.jsx"
Cohesion: 0.14
Nodes (9): About(), BookingTariff(), tabs, FarePricing(), Hero(), testimonials, WhyChooseUs(), FloatingIcons() (+1 more)

### Community 2 - "DriverProfile.js"
Cohesion: 0.12
Nodes (5): bookingSchema, locationSchema, driverProfileSchema, paymentSchema, vehicleSchema

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (45): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+37 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (45): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+37 more)

### Community 5 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (3): reviewSchema, withdrawalRequestSchema, completeBooking()

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, jest (+9 more)

### Community 8 - "devDependencies"
Cohesion: 0.11
Nodes (19): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+11 more)

### Community 9 - "auth.routes.js"
Cohesion: 0.19
Nodes (13): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver(), router (+5 more)

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
Cohesion: 0.13
Nodes (13): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, router (+5 more)

### Community 15 - "notification.service.js"
Cohesion: 0.06
Nodes (39): razorpay, supportsTransactions(), withTransaction(), notificationSchema, addDriverTip(), cancelBooking(), completeRide(), createBooking() (+31 more)

### Community 16 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 17 - "booking.routes.js"
Cohesion: 0.17
Nodes (16): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), getAvailableBookings(), getBookingById(), getMyBookings() (+8 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "useAuth"
Cohesion: 0.06
Nodes (36): App(), Login(), DASHBOARD_ROUTES, Navbar(), ProtectedRoute(), AuthContext, AuthProvider(), AppContext (+28 more)

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "socket/index.js"
Cohesion: 0.21
Nodes (8): acceptBooking(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), initializeSocket(), addUser(), removeUser(), users

### Community 22 - "googleMaps.service.js"
Cohesion: 0.33
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "App.jsx"
Cohesion: 0.06
Nodes (67): Booking(), Footer(), ScrollProgress(), ScrollToTopHandler(), Badge(), ConfirmDialog(), EmptyState(), ErrorState() (+59 more)

### Community 24 - "common.validator.js"
Cohesion: 0.32
Nodes (5): estimateFare(), router, fareEstimateSchema, objectId, typeParamSchema

### Community 26 - "notification.routes.js"
Cohesion: 0.43
Nodes (6): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router

### Community 28 - "invoice.routes.js"
Cohesion: 0.43
Nodes (4): downloadInvoice(), router, generateInvoice(), bookingIdParamSchema

### Community 39 - "User.js"
Cohesion: 0.13
Nodes (5): app, driverWalletSchema, transactionSchema, userSchema, walletTransactionSchema

### Community 42 - "user.routes.js"
Cohesion: 0.18
Nodes (11): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), authorize(), validateQuery(), router, router (+3 more)

### Community 44 - "validate.middleware.js"
Cohesion: 0.29
Nodes (5): rateDriver(), validate(), validateParams(), router, rateDriverSchema

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "auth.middleware.js"
Cohesion: 0.39
Nodes (5): getDriverPerformance(), toggleOnlineStatus(), authenticate(), router, verifyToken()

### Community 51 - "vehicle.routes.js"
Cohesion: 0.39
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router, idParamSchema

### Community 53 - "auth.service.js"
Cohesion: 0.30
Nodes (11): loginUser(), logoutUser(), registerCustomer(), registerDriver(), rotateRefreshToken(), tokenMatches(), generateRefreshToken(), generateToken() (+3 more)

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 59 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 63 - "BookRide.jsx"
Cohesion: 0.11
Nodes (20): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces(), CHENNAI_CENTER (+12 more)

## Knowledge Gaps
- **148 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+143 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `googleMaps.routes.js`, `auth.routes.js`, `user.routes.js`, `driver.routes.js`, `payment.routes.js`, `driverUpload.routes.js`, `validate.middleware.js`, `review.routes.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `vehicle.routes.js`, `common.validator.js`, `notification.routes.js`, `invoice.routes.js`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `backend/package.json`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `notification.service.js` to `webhook.controller.js`, `socket/index.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _148 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14035087719298245 - nodes in this community are weakly interconnected._
- **Should `DriverProfile.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11688311688311688 - nodes in this community are weakly interconnected._