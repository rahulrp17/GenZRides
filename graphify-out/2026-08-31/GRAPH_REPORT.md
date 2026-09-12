# Graph Report - Cab Booking App  (2026-08-31)

## Corpus Check
- 194 files · ~1,533,006 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 890 nodes · 1749 edges · 59 communities (53 shown, 6 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auth.service.js
- App.jsx
- app.js
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
- notifyUser
- notification.service.js
- booking.routes.js
- favoriteLocation.routes.js
- useAuth
- jest
- socket/index.js
- googleMaps.service.js
- ManageDrivers.jsx
- booking.service.js
- notification.routes.js
- React + Vite
- dispatch.service.js
- AGENTS.md
- CustomerDashboard.jsx
- endpoints.js
- Home.jsx
- user.routes.js
- Skeleton.jsx
- DriverProfile.js
- backend/package.json
- validate.middleware.js
- review.routes.js
- payment.service.js
- dispatch.routes.js
- auth.middleware.js
- vehicle.routes.js
- favoriteLocation.service.js
- common.validator.js
- invoice.routes.js
- DriverHistory.jsx
- scripts
- moduleFileExtensions
- Payments.jsx

## God Nodes (most connected - your core abstractions)
1. `notifyUser()` - 24 edges
2. `useAuth()` - 23 edges
3. `authenticate()` - 21 edges
4. `EmptyState()` - 20 edges
5. `Pagination()` - 15 edges
6. `TableSkeleton()` - 14 edges
7. `app` - 13 edges
8. `authorize()` - 13 edges
9. `validate()` - 13 edges
10. `validateParams()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `completeBooking()` --calls--> `creditWallet()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/wallet.service.js
- `DriverDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverDashboard.jsx → frontend/src/hooks/useAuth.js
- `handlePaymentCaptured()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/controllers/webhook.controller.js → backend/src/services/notification.service.js
- `rotateRefreshToken()` --calls--> `verifyRefreshToken()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js
- `logoutUser()` --calls--> `hashToken()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (59 total, 6 thin omitted)

### Community 0 - "auth.service.js"
Cohesion: 0.32
Nodes (10): loginUser(), logoutUser(), registerCustomer(), rotateRefreshToken(), tokenMatches(), generateRefreshToken(), generateToken(), generateTokenPair() (+2 more)

### Community 1 - "App.jsx"
Cohesion: 0.07
Nodes (24): AdminNotifications, DriverNotifications, DriverReviews, FavoriteLocations, ManageBookings, ManageCustomers, ManageReviews, ManageVehicles (+16 more)

### Community 2 - "app.js"
Cohesion: 0.06
Nodes (32): app, configuredOrigins, connectDB(), closeRedis(), getRedisClient(), isRedisConnected(), authLimiter, createLimiter() (+24 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (44): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+36 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (45): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+37 more)

### Community 5 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (9): autocomplete(), getETA(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema, latLngSchema (+1 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (3): reviewSchema, withdrawalRequestSchema, completeBooking()

### Community 7 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, jest (+9 more)

### Community 8 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+20 more)

### Community 9 - "auth.routes.js"
Cohesion: 0.20
Nodes (12): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), router, changePasswordSchema (+4 more)

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.06
Nodes (35): framer-motion, dependencies, axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, lucide-react, react (+27 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.12
Nodes (14): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, router (+6 more)

### Community 14 - "notifyUser"
Cohesion: 0.18
Nodes (12): driverWalletSchema, transactionSchema, addDriverTip(), cancelBooking(), reachPickup(), startRide(), createNotification(), notifyUser() (+4 more)

### Community 16 - "notification.service.js"
Cohesion: 0.17
Nodes (14): notificationSchema, bookingAccepted(), bookingCancelled(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed(), paymentSuccess() (+6 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.17
Nodes (16): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), getAvailableBookings(), getBookingById(), getMyBookings() (+8 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "useAuth"
Cohesion: 0.08
Nodes (25): App(), DriverProfilePage, Profile, Login(), Navbar(), ProtectedRoute(), AuthContext, AuthProvider() (+17 more)

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "socket/index.js"
Cohesion: 0.27
Nodes (6): acceptBooking(), updateRideStatus(), initializeSocket(), addUser(), removeUser(), users

### Community 22 - "googleMaps.service.js"
Cohesion: 0.39
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "ManageDrivers.jsx"
Cohesion: 0.19
Nodes (8): ManageDrivers, Badge(), ConfirmDialog(), EmptyState(), Modal(), SearchBar(), TableSkeleton(), adminAPI

### Community 24 - "booking.service.js"
Cohesion: 0.15
Nodes (7): supportsTransactions(), withTransaction(), completeRide(), createBooking(), updateDriverStats(), calculateFare(), creditWallet()

### Community 26 - "notification.routes.js"
Cohesion: 0.43
Nodes (6): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router

### Community 28 - "dispatch.service.js"
Cohesion: 0.46
Nodes (7): dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), sendRideRequest()

### Community 39 - "CustomerDashboard.jsx"
Cohesion: 0.13
Nodes (13): AdminDashboard, CurrentRide, CustomerDashboard, DriverDashboard, DriverDocuments, Earnings, ErrorState(), CardSkeleton() (+5 more)

### Community 40 - "endpoints.js"
Cohesion: 0.12
Nodes (14): BookRide, CustomerReviews, Invoices, api, failedQueue, bookingAPI, driverStatusAPI, fareAPI (+6 more)

### Community 41 - "Home.jsx"
Cohesion: 0.14
Nodes (9): About(), BookingTariff(), tabs, FarePricing(), Hero(), testimonials, WhyChooseUs(), FloatingIcons() (+1 more)

### Community 42 - "user.routes.js"
Cohesion: 0.18
Nodes (11): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), authorize(), validateQuery(), router, router (+3 more)

### Community 43 - "Skeleton.jsx"
Cohesion: 0.23
Nodes (4): DriverWallet, Pagination(), ListSkeleton(), notificationAPI

### Community 44 - "DriverProfile.js"
Cohesion: 0.14
Nodes (5): bookingSchema, locationSchema, driverProfileSchema, STATUS_TRANSITIONS, TIMESTAMP_FIELD

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 46 - "validate.middleware.js"
Cohesion: 0.29
Nodes (5): rateDriver(), validate(), validateParams(), router, rateDriverSchema

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

### Community 53 - "common.validator.js"
Cohesion: 0.38
Nodes (4): estimateFare(), router, fareEstimateSchema, objectId

### Community 54 - "invoice.routes.js"
Cohesion: 0.43
Nodes (4): downloadInvoice(), router, generateInvoice(), bookingIdParamSchema

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 57 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

## Knowledge Gaps
- **137 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+132 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `googleMaps.routes.js`, `auth.routes.js`, `user.routes.js`, `driver.routes.js`, `payment.routes.js`, `driverUpload.routes.js`, `validate.middleware.js`, `review.routes.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `vehicle.routes.js`, `common.validator.js`, `invoice.routes.js`, `notification.routes.js`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `backend/package.json`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `notifyUser` to `app.js`, `notification.service.js`, `payment.service.js`, `socket/index.js`, `booking.service.js`, `dispatch.service.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _137 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07058823529411765 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.055944055944055944 - nodes in this community are weakly interconnected._