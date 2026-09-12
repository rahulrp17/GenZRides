# Graph Report - Cab Booking App  (2026-08-28)

## Corpus Check
- 146 files · ~1,507,630 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 714 nodes · 1162 edges · 40 communities (36 shown, 4 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 132 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- dispatch.routes.js
- app.js
- App.jsx
- admin.routes.js
- dependencies
- admin.service.js
- googleMaps.routes.js
- backend/package.json
- devDependencies
- driver.routes.js
- dependencies
- auth.middleware.js
- booking.service.js
- payment.routes.js
- driver.service.js
- notification.service.js
- booking.routes.js
- favoriteLocation.routes.js
- auth.routes.js
- socket/index.js
- user.routes.js
- dispatch.service.js
- dependencies
- googleMaps.service.js
- rateLimiter.js
- opencode.json
- graphify.js
- React + Vite
- AGENTS.md

## God Nodes (most connected - your core abstractions)
1. `notifyUser()` - 24 edges
2. `authenticate()` - 21 edges
3. `notifyCustomer()` - 12 edges
4. `authorize()` - 11 edges
5. `validate()` - 11 edges
6. `app` - 9 edges
7. `sendRideRequest()` - 8 edges
8. `initializeSocket()` - 8 edges
9. `handleRazorpayWebhook()` - 7 edges
10. `generateTokenPair()` - 7 edges

## Surprising Connections (you probably didn't know these)
- `acceptBooking()` --calls--> `notifyCustomer()`  [EXTRACTED]
  backend/src/services/assignment.service.js → backend/src/services/notification.service.js
- `handlePaymentCaptured()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/controllers/webhook.controller.js → backend/src/services/notification.service.js
- `assignNearestDriver()` --calls--> `sendRideRequest()`  [EXTRACTED]
  backend/src/services/assignment.service.js → backend/src/services/notification.service.js
- `registerCustomer()` --calls--> `generateTokenPair()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js
- `loginUser()` --calls--> `generateTokenPair()`  [EXTRACTED]
  backend/src/services/auth.service.js → backend/src/services/jwt.service.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (40 total, 4 thin omitted)

### Community 0 - "dispatch.routes.js"
Cohesion: 0.11
Nodes (14): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getRideHistory(), createVehicle(), deleteVehicle() (+6 more)

### Community 1 - "app.js"
Cohesion: 0.07
Nodes (31): allowedOrigins, app, connectDB(), closeRedis(), getRedisClient(), authLimiter, createLimiter(), dispatchLimiter (+23 more)

### Community 2 - "App.jsx"
Cohesion: 0.06
Nodes (27): App(), About(), Booking(), BookingTariff(), tabs, FarePricing(), Footer(), Hero() (+19 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (44): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+36 more)

### Community 4 - "dependencies"
Cohesion: 0.05
Nodes (43): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+35 more)

### Community 6 - "googleMaps.routes.js"
Cohesion: 0.09
Nodes (19): autocomplete(), getETA(), getRoute(), reverseGeocode(), rateDriver(), createReview(), getDriverReviews(), getMyReviews() (+11 more)

### Community 7 - "backend/package.json"
Cohesion: 0.06
Nodes (34): author, description, devDependencies, jest, mongodb-memory-server, nodemon, supertest, jest (+26 more)

### Community 8 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+20 more)

### Community 9 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 10 - "dependencies"
Cohesion: 0.07
Nodes (27): framer-motion, dependencies, axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, lucide-react, react (+19 more)

### Community 11 - "auth.middleware.js"
Cohesion: 0.07
Nodes (26): uploadDriverDocumentFile(), uploadVehicleImages(), estimateFare(), downloadInvoice(), deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead() (+18 more)

### Community 12 - "booking.service.js"
Cohesion: 0.15
Nodes (16): walletTransactionSchema, addDriverTip(), cancelBooking(), completeRide(), createBooking(), reachPickup(), startRide(), updateDriverStats() (+8 more)

### Community 13 - "payment.routes.js"
Cohesion: 0.13
Nodes (10): razorpay, createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), paymentSchema, router (+2 more)

### Community 14 - "driver.service.js"
Cohesion: 0.06
Nodes (5): bookingSchema, locationSchema, driverWalletSchema, transactionSchema, reviewSchema

### Community 15 - "notification.service.js"
Cohesion: 0.17
Nodes (14): notificationSchema, bookingAccepted(), bookingCancelled(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed(), paymentSuccess() (+6 more)

### Community 16 - "booking.routes.js"
Cohesion: 0.17
Nodes (16): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), getAvailableBookings(), getBookingById(), getMyBookings() (+8 more)

### Community 17 - "favoriteLocation.routes.js"
Cohesion: 0.14
Nodes (8): createLocation(), deleteLocation(), getLocations(), updateLocation(), favoriteLocationSchema, router, createLocationSchema, updateLocationSchema

### Community 18 - "auth.routes.js"
Cohesion: 0.12
Nodes (19): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), router, loginUser() (+11 more)

### Community 19 - "socket/index.js"
Cohesion: 0.36
Nodes (6): acceptBooking(), updateRideStatus(), initializeSocket(), addUser(), removeUser(), users

### Community 20 - "user.routes.js"
Cohesion: 0.20
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 21 - "dispatch.service.js"
Cohesion: 0.18
Nodes (9): acceptBooking(), assignNearestDriver(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver() (+1 more)

### Community 22 - "dependencies"
Cohesion: 0.50
Nodes (3): dependencies, razorpay, razorpay

### Community 23 - "googleMaps.service.js"
Cohesion: 0.39
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 24 - "rateLimiter.js"
Cohesion: 0.33
Nodes (5): authLimiter, dispatchLimiter, generalLimiter, paymentLimiter, uploadLimiter

### Community 27 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **118 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `name`, `version`, `main` (+113 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `authenticate()` connect `auth.middleware.js` to `dispatch.routes.js`, `app.js`, `admin.routes.js`, `googleMaps.routes.js`, `driver.routes.js`, `payment.routes.js`, `booking.routes.js`, `favoriteLocation.routes.js`, `auth.routes.js`, `user.routes.js`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `booking.service.js` to `app.js`, `payment.routes.js`, `notification.service.js`, `socket/index.js`, `dispatch.service.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `validate()` connect `googleMaps.routes.js` to `admin.routes.js`, `driver.routes.js`, `payment.routes.js`, `booking.routes.js`, `favoriteLocation.routes.js`, `auth.routes.js`, `user.routes.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `name` to the rest of the system?**
  _118 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `dispatch.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07039187227866474 - nodes in this community are weakly interconnected._