# Graph Report - backend  (2026-09-23)

## Corpus Check
- 142 files · ~71,428 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 854 nodes · 1785 edges · 51 communities (45 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 163 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e26ce1d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- common.validator.js
- app.js
- booking.routes.js
- admin.routes.js
- dependencies
- index.js
- admin.service.js
- favoriteLocation.routes.js
- driver.routes.js
- driverUpload.service.js
- payment.routes.js
- driver.service.js
- devDependencies
- auth.routes.js
- whatsapp.service.js
- booking.service.js
- email.service.js
- googleMaps.routes.js
- jest
- aiAssistant.service.js
- package.json
- notification.routes.js
- notification.service.js
- scripts
- user.routes.js
- moduleFileExtensions
- server.js
- auth.middleware.js
- review.routes.js
- invalidateCache
- payment.service.js
- dispatch.routes.js
- vehicle.routes.js
- dispatch.service.js
- favoriteLocation.service.js
- redis.js
- rating.routes.js
- completeRide
- invoice.service.js
- approveBooking
- fare.service.js
- Visitor.js
- Review.js
- WithdrawalRequest.js

## God Nodes (most connected - your core abstractions)
1. `notifyUser()` - 37 edges
2. `getIO()` - 24 edges
3. `authenticate()` - 22 edges
4. `emitToAdmins()` - 22 edges
5. `fallbackChat()` - 17 edges
6. `app` - 16 edges
7. `invalidateCache()` - 15 edges
8. `getRedisClient()` - 14 edges
9. `notifyAdminOfBookingEmail()` - 14 edges
10. `authorize()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  src/services/admin.service.js → src/services/notification.service.js
- `getVisitors()` --calls--> `sweepExpiredVisitors()`  [EXTRACTED]
  src/services/admin.service.js → src/services/booking.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  src/services/driver.service.js → src/services/notification.service.js
- `getRedisStore()` --calls--> `getRedisClient()`  [EXTRACTED]
  src/config/redisRateLimiter.js → src/config/redis.js
- `redisAvailable()` --calls--> `isRedisConnected()`  [EXTRACTED]
  src/config/redisRateLimiter.js → src/config/redis.js

## Import Cycles
- 3-file cycle: `src/services/dispatch.service.js -> src/services/notification.service.js -> src/socket/index.js -> src/services/dispatch.service.js`

## Communities (51 total, 6 thin omitted)

### Community 0 - "common.validator.js"
Cohesion: 0.18
Nodes (10): estimateFare(), getRideHistory(), validate(), validateQuery(), router, router, fareEstimateSchema, idParamSchema (+2 more)

### Community 1 - "app.js"
Cohesion: 0.05
Nodes (32): app, configuredOrigins, authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+24 more)

### Community 2 - "booking.routes.js"
Cohesion: 0.10
Nodes (41): approveBooking(), assignDriver(), cancelBooking(), completeBooking(), rejectInstantBooking(), verifyInstantBooking(), acceptBooking(), addDriverTip() (+33 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (56): approveDriver(), approveWithdrawal(), blockCustomer(), blockDriver(), createVehicle(), deleteCustomer(), deleteDriver(), deleteReview() (+48 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors, dotenv (+41 more)

### Community 5 - "index.js"
Cohesion: 0.22
Nodes (9): rejectBooking(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), driverLocationLast, initializeSocket(), addUser(), removeUser() (+1 more)

### Community 7 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 8 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 9 - "driverUpload.service.js"
Cohesion: 0.33
Nodes (6): uploadDriverDocumentFile(), uploadVehicleImages(), uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage()

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.service.js"
Cohesion: 0.10
Nodes (11): walletTransactionSchema, createDriverProfile(), getDriverDashboard(), getDriverEarnings(), getDriverStatistics(), getWalletSummary(), getWalletTransactions(), getDriverPeriodEarnings() (+3 more)

### Community 12 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, cross-env, jest, mongodb-memory-server, nodemon, devDependencies (+11 more)

### Community 13 - "auth.routes.js"
Cohesion: 0.09
Nodes (37): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+29 more)

### Community 14 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 15 - "booking.service.js"
Cohesion: 0.14
Nodes (21): addDriverTip(), cancelBooking(), confirmVisit(), createBooking(), createGuestBooking(), createVisit(), driverCancelBooking(), guestCancelBooking() (+13 more)

### Community 16 - "email.service.js"
Cohesion: 0.15
Nodes (18): emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients(), getBookingEmailFields(), getConfig() (+10 more)

### Community 17 - "googleMaps.routes.js"
Cohesion: 0.08
Nodes (28): getRedisClient(), isRedisConnected(), IORedisRateLimitStore, autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode() (+20 more)

### Community 18 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 19 - "aiAssistant.service.js"
Cohesion: 0.08
Nodes (36): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+28 more)

### Community 20 - "package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 21 - "notification.routes.js"
Cohesion: 0.15
Nodes (14): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+6 more)

### Community 22 - "notification.service.js"
Cohesion: 0.16
Nodes (13): notificationSchema, bookingAccepted(), bookingCancelled(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed(), paymentSuccess() (+5 more)

### Community 23 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 24 - "user.routes.js"
Cohesion: 0.31
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 25 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 27 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 32 - "auth.middleware.js"
Cohesion: 0.21
Nodes (12): getDriverPerformance(), toggleOnlineStatus(), authenticate(), authenticateOptional(), getCachedUser(), authorize(), validateParams(), router (+4 more)

### Community 33 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 34 - "invalidateCache"
Cohesion: 0.24
Nodes (9): invalidateCache(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle(), createVehicle(), deleteVehicle() (+1 more)

### Community 36 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 37 - "vehicle.routes.js"
Cohesion: 0.48
Nodes (5): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router

### Community 38 - "dispatch.service.js"
Cohesion: 0.22
Nodes (11): assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findEligibleDrivers(), getCurrentDriver(), handleDriverTimeout(), sendToNextDriver() (+3 more)

### Community 41 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 42 - "redis.js"
Cohesion: 0.32
Nodes (7): memCache, memCacheExpiry, memGet(), memSet(), withCache(), getDashboardStats(), getVehicles()

### Community 43 - "rating.routes.js"
Cohesion: 0.32
Nodes (4): rateDriver(), router, bookingIdParamSchema, rateDriverSchema

### Community 44 - "completeRide"
Cohesion: 0.38
Nodes (6): supportsTransactions(), withTransaction(), completeBooking(), completeRide(), updateDriverStats(), creditWallet()

### Community 45 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 46 - "approveBooking"
Cohesion: 0.33
Nodes (6): approveBooking(), getInstantBookingRequests(), getInstantBookings(), populateAdminBooking(), rejectInstantBooking(), verifyInstantBooking()

## Knowledge Gaps
- **111 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `payment.service.js`, `index.js`, `admin.service.js`, `dispatch.service.js`, `driver.service.js`, `completeRide`, `approveBooking`, `googleMaps.routes.js`, `notification.routes.js`, `notification.service.js`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `common.validator.js`, `review.routes.js`, `booking.routes.js`, `admin.routes.js`, `dispatch.routes.js`, `vehicle.routes.js`, `favoriteLocation.routes.js`, `driver.routes.js`, `payment.routes.js`, `rating.routes.js`, `auth.routes.js`, `googleMaps.routes.js`, `notification.routes.js`, `user.routes.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `googleMaps.routes.js` to `app.js`, `redis.js`, `server.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mockGet`, `mockPost`, `COORDS` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05028305028305028 - nodes in this community are weakly interconnected._
- **Should `booking.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10303030303030303 - nodes in this community are weakly interconnected._