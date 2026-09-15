# Graph Report - Cab Booking App  (2026-09-15)

## Corpus Check
- 273 files · ~3,543,213 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1395 nodes · 3156 edges · 96 communities (82 shown, 14 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b641a734`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- webhook.controller.js
- Reveal.jsx
- invoice.service.js
- admin.routes.js
- dependencies
- useAuth
- admin.service.js
- devDependencies
- devDependencies
- moduleFileExtensions
- payment.routes.js
- driver.routes.js
- dependencies
- driverUpload.routes.js
- favoriteLocation.service.js
- booking.service.js
- Pagination.jsx
- booking.routes.js
- favoriteLocation.routes.js
- endpoints.js
- jest
- socket/index.js
- aiAssistant.service.js
- review.service.js
- CurrentRideCustomer.jsx
- notification.routes.js
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- ConfirmPage.jsx
- QueryProvider.jsx
- user.routes.js
- googleMaps.routes.js
- AIAssistant.jsx
- backend/package.json
- common.validator.js
- User.js
- dispatch.routes.js
- SEO.jsx
- useSocket
- Home.jsx
- BookingDetailsPage.jsx
- App.jsx
- auth.middleware.js
- scripts
- app.js
- Vehicles.jsx
- AdminCharts.jsx
- theme.js
- LocationPicker.jsx
- Testiminols.jsx
- api.js
- Skeleton.jsx
- vehicle.routes.js
- frontend/package.json
- whatsapp.service.js
- @react-google-maps/api
- email.service.js
- playwright
- DriverCharts.jsx
- react-router-dom
- ride-flow.spec.js
- react-hot-toast
- VehicleSelector.jsx
- EmptyState.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- socket.io-client
- InfoDetail.jsx
- vercel.json
- review.routes.js
- RouteErrorBoundary
- react-hook-form
- BookRide.jsx
- push.service.js
- collectCoverageFrom
- devDependencies

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 39 edges
2. `ErrorState()` - 35 edges
3. `notifyUser()` - 33 edges
4. `useSocket()` - 33 edges
5. `SEO()` - 33 edges
6. `EmptyState()` - 25 edges
7. `authenticate()` - 22 edges
8. `getIO()` - 21 edges
9. `Reveal()` - 20 edges
10. `Modal()` - 19 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js
- `DriverDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverDashboard.jsx → frontend/src/hooks/useAuth.js
- `getRedisStore()` --calls--> `getRedisClient()`  [EXTRACTED]
  backend/src/config/redisRateLimiter.js → backend/src/config/redis.js
- `getCachedUser()` --calls--> `withCache()`  [EXTRACTED]
  backend/src/middleware/auth.middleware.js → backend/src/config/redis.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (96 total, 14 thin omitted)

### Community 0 - "webhook.controller.js"
Cohesion: 0.19
Nodes (9): getRedisClient(), IORedisRateLimitStore, checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature() (+1 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.09
Nodes (26): About, AirportDetail, AirportTransfers, PopularRoutes, RouteDetail, Services, cardHover, GlowBlobs() (+18 more)

### Community 2 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (53): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+45 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+41 more)

### Community 5 - "useAuth"
Cohesion: 0.05
Nodes (61): AdminLayout, AdminProfile, App(), CustomerLayout, DriverContinue, DriverLayout, DriverProfilePage, Profile (+53 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (11): invalidateCache(), withdrawalRequestSchema, cancelBooking(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle() (+3 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 10 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): framer-motion, dependencies, axios, framer-motion, lucide-react, react, react-dom, react-icons (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.29
Nodes (7): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage()

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.12
Nodes (22): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+14 more)

### Community 16 - "Pagination.jsx"
Cohesion: 0.21
Nodes (5): Pagination(), ListSkeleton(), getInvoiceAmount(), Invoices(), reviewAPI

### Community 17 - "booking.routes.js"
Cohesion: 0.07
Nodes (42): razorpay, guestBookingLimiter, acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+34 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "endpoints.js"
Cohesion: 0.13
Nodes (12): DriverDocuments, STATUS_COLORS, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), dispatchAPI, driverStatusAPI (+4 more)

### Community 20 - "jest"
Cohesion: 0.17
Nodes (12): jest, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns, ^.+\\.js$ (+4 more)

### Community 21 - "socket/index.js"
Cohesion: 0.13
Nodes (19): assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking() (+11 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.15
Nodes (14): sendMessage(), buildVehicleContext(), chat(), extractLocations(), fallbackChat(), getMyBookings(), calculateFare(), FARE_CONFIG (+6 more)

### Community 24 - "CurrentRideCustomer.jsx"
Cohesion: 0.11
Nodes (24): CurrentRideCustomer, CancelReasonDialog(), DEFAULT_REASONS, formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo() (+16 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 28 - "auth.routes.js"
Cohesion: 0.09
Nodes (32): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+24 more)

### Community 39 - "driver.service.js"
Cohesion: 0.11
Nodes (4): walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "ConfirmPage.jsx"
Cohesion: 0.10
Nodes (23): CarTypePage, ConfirmPage, GuestBookingPage, Footer(), Hero(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES (+15 more)

### Community 42 - "user.routes.js"
Cohesion: 0.18
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 44 - "AIAssistant.jsx"
Cohesion: 0.50
Nodes (4): AIAssistant(), formatReply(), SUGGESTED_PROMPTS, aiAPI

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.13
Nodes (14): guestSearchLimiter, estimateFare(), rateDriver(), validate(), validateParams(), router, router, router (+6 more)

### Community 48 - "User.js"
Cohesion: 0.12
Nodes (7): app, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "SEO.jsx"
Cohesion: 0.10
Nodes (22): DriverLogin, DriverRegister, ForgotPassword, Login, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES (+14 more)

### Community 51 - "useSocket"
Cohesion: 0.20
Nodes (13): SocketContext, useSocket(), AdminNotifications(), bookingIdOf(), bookingIdOf(), Notifications(), RideHistory(), DriverBookings() (+5 more)

### Community 52 - "Home.jsx"
Cohesion: 0.10
Nodes (18): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), SERVICES (+10 more)

### Community 53 - "BookingDetailsPage.jsx"
Cohesion: 0.20
Nodes (14): BookingDetailsPage, AdminBookingRequests(), ManageBookings(), BookingDetailsPage(), formatDateTime(), STATUS_COLORS, STATUS_LABELS, STATUS_ORDER (+6 more)

### Community 54 - "App.jsx"
Cohesion: 0.06
Nodes (29): AdminBookingRequests, AdminNotifications, CurrentRide, CustomerBookings, CustomerDashboard, CustomerReviews, DriverBookingDetail, DriverBookings (+21 more)

### Community 55 - "auth.middleware.js"
Cohesion: 0.52
Nodes (5): authenticate(), authenticateOptional(), getCachedUser(), router, verifyToken()

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "app.js"
Cohesion: 0.10
Nodes (27): configuredOrigins, connectDB(), fixBookingAlertIndexes(), closeRedis(), isRedisConnected(), memCache, memCacheExpiry, memGet() (+19 more)

### Community 59 - "Vehicles.jsx"
Cohesion: 0.33
Nodes (5): AttachVehicle, AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 60 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 63 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "Skeleton.jsx"
Cohesion: 0.17
Nodes (8): AdminDashboard, DriverDashboard, ErrorState(), CardSkeleton(), StatsCard(), STATUS_BADGE, DriverDashboard(), driverAPI

### Community 67 - "vehicle.routes.js"
Cohesion: 0.23
Nodes (9): getDriverPerformance(), toggleOnlineStatus(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), authorize(), router (+1 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 71 - "email.service.js"
Cohesion: 0.11
Nodes (20): bookingSchema, locationSchema, emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients() (+12 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverCharts.jsx"
Cohesion: 0.25
Nodes (5): COLORS, DriverCharts, DriverPie, DriverCharts, DriverPie

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 77 - "VehicleSelector.jsx"
Cohesion: 0.32
Nodes (5): cardVariants, containerVariants, formatCurrency(), vehicleImageFor(), VehicleSelector()

### Community 78 - "EmptyState.jsx"
Cohesion: 0.18
Nodes (13): AssignDriverDialog(), Badge(), ConfirmDialog(), EmptyState(), Modal(), SearchBar(), TableSkeleton(), STATUSES (+5 more)

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 87 - "InfoDetail.jsx"
Cohesion: 0.11
Nodes (13): ContactUs, Info, InfoDetail, WaitingPage, PageHero(), FAQS, faqJsonLd, FAQS (+5 more)

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 95 - "BookRide.jsx"
Cohesion: 0.19
Nodes (15): BookRide, CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), BookRide(), getMinDateTime() (+7 more)

### Community 96 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 97 - "collectCoverageFrom"
Cohesion: 0.50
Nodes (4): collectCoverageFrom, !src/config/**, src/**/*.js, !src/seeds/**

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

## Knowledge Gaps
- **247 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+242 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `webhook.controller.js`, `push.service.js`, `admin.service.js`, `driver.service.js`, `booking.routes.js`, `socket/index.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `webhook.controller.js` to `app.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `withCache()` connect `app.js` to `aiAssistant.service.js`, `admin.service.js`, `auth.middleware.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _247 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09407665505226481 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._