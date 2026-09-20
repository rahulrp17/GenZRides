# Graph Report - backend  (2026-09-20)

## Corpus Check
- 140 files · ~66,883 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 820 nodes · 1695 edges · 41 communities (40 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 153 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99edc728`
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
- driverUpload.routes.js
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
- googleMaps.service.js
- payment.service.js
- dispatch.routes.js
- vehicle.routes.js
- dispatch.service.js

## God Nodes (most connected - your core abstractions)
1. `notifyUser()` - 34 edges
2. `authenticate()` - 22 edges
3. `getIO()` - 21 edges
4. `fallbackChat()` - 17 edges
5. `app` - 15 edges
6. `getRedisClient()` - 14 edges
7. `notifyAdminOfBookingEmail()` - 14 edges
8. `authorize()` - 13 edges
9. `validate()` - 13 edges
10. `emitToAdmins()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  src/services/admin.service.js → src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  src/services/driver.service.js → src/services/notification.service.js
- `getCachedUser()` --calls--> `withCache()`  [EXTRACTED]
  src/middleware/auth.middleware.js → src/config/redis.js
- `getDashboardStats()` --calls--> `withCache()`  [EXTRACTED]
  src/services/admin.service.js → src/config/redis.js
- `getVehicles()` --calls--> `withCache()`  [EXTRACTED]
  src/services/admin.service.js → src/config/redis.js

## Import Cycles
- 3-file cycle: `src/services/dispatch.service.js -> src/services/notification.service.js -> src/socket/index.js -> src/services/dispatch.service.js`

## Communities (41 total, 1 thin omitted)

### Community 0 - "common.validator.js"
Cohesion: 0.15
Nodes (12): guestSearchLimiter, estimateFare(), rateDriver(), validate(), validateParams(), router, router, router (+4 more)

### Community 1 - "app.js"
Cohesion: 0.05
Nodes (29): app, configuredOrigins, downloadInvoice(), bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema (+21 more)

### Community 2 - "booking.routes.js"
Cohesion: 0.14
Nodes (30): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+22 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (55): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+47 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors, dotenv (+41 more)

### Community 5 - "index.js"
Cohesion: 0.22
Nodes (9): acceptBooking(), STATUS_TRANSITIONS, TIMESTAMP_FIELD, updateRideStatus(), driverLocationLast, initializeSocket(), addUser(), removeUser() (+1 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (19): invalidateCache(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), reviewSchema, withdrawalRequestSchema (+11 more)

### Community 7 - "favoriteLocation.routes.js"
Cohesion: 0.14
Nodes (11): createLocation(), deleteLocation(), getLocations(), updateLocation(), favoriteLocationSchema, router, createLocation(), toGeoJSON() (+3 more)

### Community 8 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 9 - "driverUpload.routes.js"
Cohesion: 0.26
Nodes (8): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage(), typeParamSchema

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
Nodes (23): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+15 more)

### Community 16 - "email.service.js"
Cohesion: 0.15
Nodes (18): emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients(), getBookingEmailFields(), getConfig() (+10 more)

### Community 17 - "googleMaps.routes.js"
Cohesion: 0.07
Nodes (37): getRedisClient(), isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+29 more)

### Community 18 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 19 - "aiAssistant.service.js"
Cohesion: 0.09
Nodes (33): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+25 more)

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
Cohesion: 0.18
Nodes (11): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), authorize(), validateQuery(), router, router (+3 more)

### Community 25 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 27 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 32 - "auth.middleware.js"
Cohesion: 0.36
Nodes (7): getDriverPerformance(), toggleOnlineStatus(), authenticate(), authenticateOptional(), getCachedUser(), router, verifyToken()

### Community 33 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 34 - "googleMaps.service.js"
Cohesion: 0.33
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 36 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 37 - "vehicle.routes.js"
Cohesion: 0.39
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router, idParamSchema

### Community 38 - "dispatch.service.js"
Cohesion: 0.48
Nodes (6): getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), createNotification(), sendRideRequest()

## Knowledge Gaps
- **109 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `payment.service.js`, `index.js`, `dispatch.service.js`, `admin.service.js`, `driver.service.js`, `googleMaps.routes.js`, `notification.routes.js`, `notification.service.js`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `common.validator.js`, `review.routes.js`, `booking.routes.js`, `admin.routes.js`, `dispatch.routes.js`, `vehicle.routes.js`, `favoriteLocation.routes.js`, `driver.routes.js`, `driverUpload.routes.js`, `payment.routes.js`, `auth.routes.js`, `googleMaps.routes.js`, `notification.routes.js`, `user.routes.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `googleMaps.routes.js` to `server.js`, `admin.service.js`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mockGet`, `mockPost`, `COORDS` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.051228070175438595 - nodes in this community are weakly interconnected._
- **Should `booking.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13903743315508021 - nodes in this community are weakly interconnected._