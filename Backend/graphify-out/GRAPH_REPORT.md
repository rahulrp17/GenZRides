# Graph Report - backend  (2026-09-05)

## Corpus Check
- 120 files · ~36,779 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 644 nodes · 1237 edges · 32 communities (31 shown, 1 thin omitted)
- Extraction: 89% EXTRACTED · 11% INFERRED · 0% AMBIGUOUS · INFERRED: 137 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- auth.middleware.js
- app.js
- booking.routes.js
- admin.routes.js
- dependencies
- index.js
- favoriteLocation.routes.js
- driver.routes.js
- upload.middleware.js
- payment.routes.js
- devDependencies
- auth.routes.js
- whatsapp.service.js
- notifyUser
- auth.service.js
- googleMaps.routes.js
- jest
- booking.service.js
- package.json
- driverStatus.service.js
- scripts
- collectCoverageFrom
- moduleFileExtensions
- DriverWallet.js

## God Nodes (most connected - your core abstractions)
1. `notifyUser()` - 28 edges
2. `authenticate()` - 21 edges
3. `getIO()` - 16 edges
4. `app` - 13 edges
5. `authorize()` - 13 edges
6. `validate()` - 13 edges
7. `validateParams()` - 12 edges
8. `notifyAdminOfBooking()` - 12 edges
9. `notifyCustomer()` - 10 edges
10. `initializeSocket()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `reachPickup()` --calls--> `notifyUser()`  [EXTRACTED]
  src/services/booking.service.js → src/services/notification.service.js
- `getRedisStore()` --calls--> `getRedisClient()`  [EXTRACTED]
  src/config/redisRateLimiter.js → src/config/redis.js
- `redisAvailable()` --calls--> `isRedisConnected()`  [EXTRACTED]
  src/config/redisRateLimiter.js → src/config/redis.js
- `completeRide()` --calls--> `withTransaction()`  [EXTRACTED]
  src/services/booking.service.js → src/config/transaction.js
- `cancelBooking()` --calls--> `getIO()`  [EXTRACTED]
  src/controllers/admin.controller.js → src/socket/index.js

## Import Cycles
- 3-file cycle: `src/services/dispatch.service.js -> src/services/notification.service.js -> src/socket/index.js -> src/services/dispatch.service.js`

## Communities (32 total, 1 thin omitted)

### Community 0 - "auth.middleware.js"
Cohesion: 0.06
Nodes (45): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus(), estimateFare() (+37 more)

### Community 1 - "app.js"
Cohesion: 0.05
Nodes (25): app, configuredOrigins, authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+17 more)

### Community 2 - "booking.routes.js"
Cohesion: 0.07
Nodes (43): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+35 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (45): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+37 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (45): axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors, dotenv (+37 more)

### Community 5 - "index.js"
Cohesion: 0.08
Nodes (27): connectDB(), closeRedis(), getRedisClient(), isRedisConnected(), checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook() (+19 more)

### Community 7 - "favoriteLocation.routes.js"
Cohesion: 0.10
Nodes (15): createLocation(), deleteLocation(), getLocations(), updateLocation(), deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead() (+7 more)

### Community 8 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 9 - "upload.middleware.js"
Cohesion: 0.13
Nodes (12): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, uploadDriverDocument() (+4 more)

### Community 10 - "payment.routes.js"
Cohesion: 0.14
Nodes (9): razorpay, createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema (+1 more)

### Community 12 - "devDependencies"
Cohesion: 0.12
Nodes (17): @babel/core, babel-jest, @babel/preset-env, jest, mongodb-memory-server, nodemon, devDependencies, @babel/core (+9 more)

### Community 13 - "auth.routes.js"
Cohesion: 0.19
Nodes (13): getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver(), router (+5 more)

### Community 14 - "whatsapp.service.js"
Cohesion: 0.26
Nodes (13): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+5 more)

### Community 15 - "notifyUser"
Cohesion: 0.18
Nodes (12): withdrawalRequestSchema, cancelBooking(), addDriverTip(), cancelBooking(), driverCancelBooking(), markArrived(), startRide(), notifyUser() (+4 more)

### Community 16 - "auth.service.js"
Cohesion: 0.30
Nodes (11): loginUser(), logoutUser(), registerCustomer(), registerDriver(), rotateRefreshToken(), tokenMatches(), generateRefreshToken(), generateToken() (+3 more)

### Community 17 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 18 - "jest"
Cohesion: 0.17
Nodes (12): jest, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns, ^.+\\.js$ (+4 more)

### Community 19 - "booking.service.js"
Cohesion: 0.24
Nodes (6): supportsTransactions(), withTransaction(), createBooking(), createGuestBooking(), reachPickup(), calculateFare()

### Community 20 - "package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 21 - "driverStatus.service.js"
Cohesion: 0.22
Nodes (4): completeBooking(), completeRide(), updateDriverStats(), creditWallet()

### Community 23 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 24 - "collectCoverageFrom"
Cohesion: 0.50
Nodes (4): collectCoverageFrom, !src/config/**, src/**/*.js, !src/seeds/**

### Community 25 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

## Knowledge Gaps
- **85 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `notifyUser` to `booking.routes.js`, `index.js`, `admin.service.js`, `payment.routes.js`, `booking.service.js`, `driverStatus.service.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `booking.routes.js`, `admin.routes.js`, `favoriteLocation.routes.js`, `driver.routes.js`, `upload.middleware.js`, `payment.routes.js`, `auth.routes.js`, `googleMaps.routes.js`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `auth.middleware.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06050228310502283 - nodes in this community are weakly interconnected._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.052884615384615384 - nodes in this community are weakly interconnected._