# Graph Report - Cab Booking App  (2026-09-01)

## Corpus Check
- 201 files · ~1,542,574 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 939 nodes · 1849 edges · 65 communities (59 shown, 6 thin omitted)
- Extraction: 93% EXTRACTED · 7% INFERRED · 0% AMBIGUOUS · INFERRED: 137 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- App.jsx
- User.js
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
- driverUpload.service.js
- dispatchBooking
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
- AGENTS.md
- DriverDashboard.jsx
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
- auth.service.js
- common.validator.js
- webhook.controller.js
- scripts
- DriverDocuments.jsx
- moduleFileExtensions
- testMatch
- upload.middleware.js
- LocationPicker.jsx
- VehicleSelector.jsx
- FavoriteLocations.jsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 31 edges
2. `notifyUser()` - 24 edges
3. `authenticate()` - 21 edges
4. `EmptyState()` - 20 edges
5. `Pagination()` - 15 edges
6. `TableSkeleton()` - 14 edges
7. `app` - 13 edges
8. `authorize()` - 13 edges
9. `validate()` - 13 edges
10. `validateParams()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/booking.service.js → backend/src/services/notification.service.js
- `reachPickup()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/booking.service.js → backend/src/services/notification.service.js
- `startRide()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/booking.service.js → backend/src/services/notification.service.js
- `getRedisStore()` --calls--> `getRedisClient()`  [EXTRACTED]
  backend/src/config/redisRateLimiter.js → backend/src/config/redis.js
- `handlePaymentCaptured()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/controllers/webhook.controller.js → backend/src/services/notification.service.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (65 total, 6 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.14
Nodes (19): configuredOrigins, connectDB(), closeRedis(), isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter (+11 more)

### Community 1 - "App.jsx"
Cohesion: 0.07
Nodes (24): CustomerReviews, DriverWallet, ManageBookings, ManageCustomers, ManageDrivers, ManageReviews, ManageVehicles, ManageWithdrawals (+16 more)

### Community 2 - "User.js"
Cohesion: 0.13
Nodes (7): app, driverWalletSchema, transactionSchema, paymentSchema, userSchema, vehicleSchema, walletTransactionSchema

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
Cohesion: 0.19
Nodes (13): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver(), router (+5 more)

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.07
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.05
Nodes (37): framer-motion, dependencies, axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, lucide-react, react (+29 more)

### Community 13 - "driverUpload.service.js"
Cohesion: 0.23
Nodes (8): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage(), uploadImage()

### Community 14 - "dispatchBooking"
Cohesion: 0.29
Nodes (5): estimateFare(), createBooking(), dispatchBooking(), findNearbyDrivers(), calculateFare()

### Community 15 - "notifyUser"
Cohesion: 0.36
Nodes (7): addDriverTip(), createNotification(), notifyUser(), approveWithdrawal(), rejectWithdrawalRequest(), requestWithdrawal(), tipDriver()

### Community 16 - "notification.service.js"
Cohesion: 0.16
Nodes (15): notificationSchema, bookingAccepted(), bookingCancelled(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed(), paymentSuccess() (+7 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.17
Nodes (16): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), getAvailableBookings(), getBookingById(), getMyBookings() (+8 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "useAuth"
Cohesion: 0.06
Nodes (37): App(), DriverContinue, DriverLogin, DriverProfilePage, DriverRegister, Profile, Login(), Navbar() (+29 more)

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.20
Nodes (11): acceptBooking(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getETA(), updateRideStatus(), initializeSocket() (+3 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.36
Nodes (4): calculateDistance(), getRoute(), headers(), requestRoute()

### Community 23 - "ManageDrivers.jsx"
Cohesion: 0.17
Nodes (9): DriverHistory, Badge(), ConfirmDialog(), EmptyState(), Modal(), Pagination(), SearchBar(), TableSkeleton() (+1 more)

### Community 24 - "booking.service.js"
Cohesion: 0.14
Nodes (9): supportsTransactions(), withTransaction(), completeBooking(), cancelBooking(), completeRide(), reachPickup(), startRide(), updateDriverStats() (+1 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.43
Nodes (6): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router

### Community 39 - "DriverDashboard.jsx"
Cohesion: 0.15
Nodes (11): AdminDashboard, CurrentRide, CustomerDashboard, DriverDashboard, DriverHome, Earnings, ErrorState(), CardSkeleton() (+3 more)

### Community 40 - "endpoints.js"
Cohesion: 0.10
Nodes (18): BookRide, Invoices, WalletPage, CHENNAI_CENTER, mapContainerStyle, mapOptions, BookRide(), getMinDateTime() (+10 more)

### Community 41 - "Home.jsx"
Cohesion: 0.14
Nodes (9): About(), BookingTariff(), tabs, FarePricing(), Hero(), testimonials, WhyChooseUs(), FloatingIcons() (+1 more)

### Community 42 - "user.routes.js"
Cohesion: 0.31
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 43 - "Skeleton.jsx"
Cohesion: 0.16
Nodes (7): AdminNotifications, DriverNotifications, DriverReviews, Notifications, ListSkeleton(), notificationAPI, reviewAPI

### Community 44 - "DriverProfile.js"
Cohesion: 0.16
Nodes (7): downloadInvoice(), bookingSchema, locationSchema, driverProfileSchema, generateInvoice(), STATUS_TRANSITIONS, TIMESTAMP_FIELD

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 46 - "validate.middleware.js"
Cohesion: 0.23
Nodes (6): rateDriver(), validate(), router, router, fareEstimateSchema, rateDriverSchema

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

### Community 54 - "common.validator.js"
Cohesion: 0.19
Nodes (11): getRideHistory(), authorize(), validateParams(), validateQuery(), router, router, router, bookingIdParamSchema (+3 more)

### Community 55 - "webhook.controller.js"
Cohesion: 0.36
Nodes (8): getRedisClient(), checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 57 - "DriverDocuments.jsx"
Cohesion: 0.33
Nodes (6): DriverDocuments, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 62 - "upload.middleware.js"
Cohesion: 0.25
Nodes (4): allowedMimeTypes, storage, upload, router

### Community 63 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 64 - "VehicleSelector.jsx"
Cohesion: 0.33
Nodes (3): cardVariants, containerVariants, VehicleSelector()

## Knowledge Gaps
- **149 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+144 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authenticate()` connect `auth.middleware.js` to `admin.routes.js`, `googleMaps.routes.js`, `auth.routes.js`, `payment.routes.js`, `driver.routes.js`, `user.routes.js`, `validate.middleware.js`, `review.routes.js`, `booking.routes.js`, `dispatch.routes.js`, `favoriteLocation.routes.js`, `vehicle.routes.js`, `common.validator.js`, `notification.routes.js`, `upload.middleware.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `backend/package.json`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `notifyUser` to `dispatchBooking`, `notification.service.js`, `payment.service.js`, `socket/index.js`, `webhook.controller.js`, `booking.service.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _149 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14153846153846153 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06984126984126984 - nodes in this community are weakly interconnected._