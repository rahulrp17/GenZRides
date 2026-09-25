# Graph Report - backend  (2026-09-25)

## Corpus Check
- 147 files · ~76,272 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 881 nodes · 1864 edges · 53 communities (47 shown, 6 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 164 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f8dc67d0`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- server.js
- User.js
- booking.routes.js
- admin.routes.js
- dependencies
- app.js
- admin.service.js
- favoriteLocation.routes.js
- driver.routes.js
- driverUpload.service.js
- payment.routes.js
- booking.service.js
- devDependencies
- auth.routes.js
- whatsapp.service.js
- redis.js
- email.service.js
- googleMaps.routes.js
- jest
- aiAssistant.service.js
- package.json
- notification.routes.js
- notification.service.js
- scripts
- validate.middleware.js
- moduleFileExtensions
- DriverProfile.js
- auth.middleware.js
- review.routes.js
- invalidateCache
- payment.service.js
- dispatch.routes.js
- vehicle.routes.js
- Booking.js
- favoriteLocation.service.js
- Vehicle.js
- common.validator.js
- approveBooking
- ridePayment.test.js
- guestVisitConfirm.test.js
- Visitor.js
- Review.js
- WithdrawalRequest.js
- aiFare.test.js
- driverReject.test.js

## God Nodes (most connected - your core abstractions)
1. `notifyUser()` - 37 edges
2. `getIO()` - 25 edges
3. `emitToAdmins()` - 23 edges
4. `authenticate()` - 22 edges
5. `app` - 21 edges
6. `fallbackChat()` - 17 edges
7. `invalidateCache()` - 16 edges
8. `getRedisClient()` - 14 edges
9. `notifyAdminOfBookingEmail()` - 14 edges
10. `notifyCustomerOfAssignment()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  src/services/admin.service.js → src/services/notification.service.js
- `getVisitors()` --calls--> `sweepExpiredVisitors()`  [EXTRACTED]
  src/services/admin.service.js → src/services/booking.service.js
- `getRedisStore()` --calls--> `getRedisClient()`  [EXTRACTED]
  src/config/redisRateLimiter.js → src/config/redis.js
- `redisAvailable()` --calls--> `isRedisConnected()`  [EXTRACTED]
  src/config/redisRateLimiter.js → src/config/redis.js
- `getCachedUser()` --calls--> `withCache()`  [EXTRACTED]
  src/middleware/auth.middleware.js → src/config/redis.js

## Import Cycles
- 3-file cycle: `src/services/dispatch.service.js -> src/services/notification.service.js -> src/socket/index.js -> src/services/dispatch.service.js`

## Communities (53 total, 6 thin omitted)

### Community 0 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 1 - "User.js"
Cohesion: 0.16
Nodes (3): app, paymentSchema, userSchema

### Community 2 - "booking.routes.js"
Cohesion: 0.10
Nodes (42): approveBooking(), assignDriver(), cancelBooking(), completeBooking(), deleteVisitor(), rejectInstantBooking(), verifyInstantBooking(), acceptBooking() (+34 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (56): approveDriver(), approveWithdrawal(), blockCustomer(), blockDriver(), createVehicle(), deleteCustomer(), deleteDriver(), deleteReview() (+48 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors, dotenv (+41 more)

### Community 5 - "app.js"
Cohesion: 0.23
Nodes (11): configuredOrigins, authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter, guestSearchLimiter (+3 more)

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

### Community 11 - "booking.service.js"
Cohesion: 0.06
Nodes (38): supportsTransactions(), withTransaction(), walletTransactionSchema, completeBooking(), addDriverTip(), cancelBooking(), completeRide(), confirmVisit() (+30 more)

### Community 12 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, cross-env, jest, mongodb-memory-server, nodemon, devDependencies (+11 more)

### Community 13 - "auth.routes.js"
Cohesion: 0.09
Nodes (37): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+29 more)

### Community 14 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 15 - "redis.js"
Cohesion: 0.32
Nodes (7): memCache, memCacheExpiry, memGet(), memSet(), withCache(), getDashboardStats(), getVehicles()

### Community 16 - "email.service.js"
Cohesion: 0.10
Nodes (26): emailLogSchema, buildAssignmentEmailHtml(), buildAssignmentEmailText(), buildAssignmentEmailView(), buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), escapeHtml() (+18 more)

### Community 17 - "googleMaps.routes.js"
Cohesion: 0.08
Nodes (28): getRedisClient(), isRedisConnected(), IORedisRateLimitStore, autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode() (+20 more)

### Community 18 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 19 - "aiAssistant.service.js"
Cohesion: 0.07
Nodes (38): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+30 more)

### Community 20 - "package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 21 - "notification.routes.js"
Cohesion: 0.15
Nodes (14): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+6 more)

### Community 22 - "notification.service.js"
Cohesion: 0.07
Nodes (33): notificationSchema, assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findEligibleDrivers(), getCurrentDriver(), handleDriverTimeout() (+25 more)

### Community 23 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 24 - "validate.middleware.js"
Cohesion: 0.18
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 25 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 27 - "DriverProfile.js"
Cohesion: 0.15
Nodes (5): driverProfileSchema, createReview(), NOTE: the file-level beforeEach wipe demonstrably leaves bookings, NOTE: same pattern as the bookings search describe — bookings from other, bookings

### Community 32 - "auth.middleware.js"
Cohesion: 0.23
Nodes (10): getDriverPerformance(), toggleOnlineStatus(), downloadInvoice(), authenticate(), authenticateOptional(), getCachedUser(), router, router (+2 more)

### Community 33 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 34 - "invalidateCache"
Cohesion: 0.24
Nodes (9): invalidateCache(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle(), createVehicle(), deleteVehicle() (+1 more)

### Community 36 - "dispatch.routes.js"
Cohesion: 0.23
Nodes (10): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), authorize(), validateParams(), router (+2 more)

### Community 37 - "vehicle.routes.js"
Cohesion: 0.39
Nodes (6): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router, idParamSchema

### Community 38 - "Booking.js"
Cohesion: 0.18
Nodes (7): bookingSchema, locationSchema, __dirname, __filename, LOGO_PATH, createGuestBooking(), guestPayload()

### Community 41 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 42 - "Vehicle.js"
Cohesion: 0.20
Nodes (3): driverWalletSchema, transactionSchema, vehicleSchema

### Community 43 - "common.validator.js"
Cohesion: 0.17
Nodes (9): estimateFare(), rateDriver(), validate(), router, router, bookingIdParamSchema, fareEstimateSchema, objectId (+1 more)

### Community 44 - "approveBooking"
Cohesion: 0.33
Nodes (6): approveBooking(), getInstantBookingRequests(), getInstantBookings(), populateAdminBooking(), rejectInstantBooking(), verifyInstantBooking()

### Community 45 - "ridePayment.test.js"
Cohesion: 0.70
Nodes (4): authCust(), authDriver(), rideToReached(), tripPayload()

### Community 46 - "guestVisitConfirm.test.js"
Cohesion: 0.47
Nodes (3): guest(), trip(), visitAndConfirm()

### Community 51 - "aiFare.test.js"
Cohesion: 0.40
Nodes (3): COORDS, mockGet, mockPost

## Knowledge Gaps
- **113 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+108 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `payment.service.js`, `admin.service.js`, `approveBooking`, `googleMaps.routes.js`, `notification.routes.js`, `notification.service.js`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `authenticate()` connect `auth.middleware.js` to `review.routes.js`, `booking.routes.js`, `admin.routes.js`, `dispatch.routes.js`, `vehicle.routes.js`, `favoriteLocation.routes.js`, `driver.routes.js`, `payment.routes.js`, `common.validator.js`, `auth.routes.js`, `googleMaps.routes.js`, `notification.routes.js`, `validate.middleware.js`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `googleMaps.routes.js` to `server.js`, `app.js`, `redis.js`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Are the 19 inferred relationships involving `authenticate()` (e.g. with `admin.routes.js` and `auth.routes.js`) actually correct?**
  _`authenticate()` has 19 INFERRED edges - model-reasoned connections that need verification._
- **What connects `mockGet`, `mockPost`, `COORDS` to the rest of the system?**
  _113 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `booking.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10048309178743961 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05721153846153846 - nodes in this community are weakly interconnected._