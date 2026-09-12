# Graph Report - Cab Booking App  (2026-09-06)

## Corpus Check
- 239 files · ~1,584,171 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1178 nodes · 2589 edges · 84 communities (68 shown, 16 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 145 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- Reveal.jsx
- Booking.js
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
- CurrentRide.jsx
- booking.routes.js
- favoriteLocation.routes.js
- endpoints.js
- jest
- socket/index.js
- googleMaps.service.js
- Skeleton.jsx
- InfoDetail.jsx
- notification.routes.js
- React + Vite
- useSocket
- AGENTS.md
- driver.service.js
- CarTypePage.jsx
- QueryProvider.jsx
- user.routes.js
- testMatch
- backend/package.json
- common.validator.js
- User.js
- dispatch.routes.js
- images/index.js
- Home.jsx
- ErrorState.jsx
- App.jsx
- scripts
- SEO.jsx
- moduleFileExtensions
- theme.js
- BookRide.jsx
- Testiminols.jsx
- api.js
- DriverCharts.jsx
- auth.middleware.js
- frontend/package.json
- whatsapp.service.js
- ManageBookings.jsx
- TariffChart.jsx
- RouteErrorBoundary
- BookingDetailsPage.jsx
- react-dom
- react-router-dom
- react-hot-toast
- recharts
- @tanstack/react-query
- swiper
- tailwindcss
- useAuth
- webhook.controller.js
- payment.service.js
- review.routes.js
- dispatch.service.js
- react-hook-form

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 35 edges
2. `notifyUser()` - 33 edges
3. `SEO()` - 28 edges
4. `useSocket()` - 27 edges
5. `EmptyState()` - 24 edges
6. `authenticate()` - 21 edges
7. `Reveal()` - 20 edges
8. `getIO()` - 18 edges
9. `ErrorState()` - 17 edges
10. `TableSkeleton()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js
- `CustomerDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/CustomerDashboard.jsx → frontend/src/hooks/useAuth.js
- `Profile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/Profile.jsx → frontend/src/hooks/useAuth.js
- `DriverDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverDashboard.jsx → frontend/src/hooks/useAuth.js
- `DriverHome()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverHome.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (84 total, 16 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.18
Nodes (15): configuredOrigins, isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+7 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.14
Nodes (15): PageHero(), GlowBlobs(), Reveal(), SectionHeading(), AIRPORTS, PERKS, AIRPORTS, PERKS (+7 more)

### Community 2 - "Booking.js"
Cohesion: 0.13
Nodes (5): downloadInvoice(), bookingSchema, locationSchema, reviewSchema, generateInvoice()

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
Nodes (17): framer-motion, dependencies, axios, framer-motion, lucide-react, react, @react-google-maps/api, react-icons (+9 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.12
Nodes (14): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, router (+6 more)

### Community 15 - "booking.service.js"
Cohesion: 0.11
Nodes (24): supportsTransactions(), withTransaction(), walletTransactionSchema, cancelBooking(), completeBooking(), addDriverTip(), cancelBooking(), completeRide() (+16 more)

### Community 16 - "CurrentRide.jsx"
Cohesion: 0.33
Nodes (6): CurrentRide, CurrentRide(), decodePolyline(), mapContainerStyle, mapOptions, STATUS_FLOW

### Community 17 - "booking.routes.js"
Cohesion: 0.08
Nodes (39): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+31 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "endpoints.js"
Cohesion: 0.10
Nodes (17): DriverDocuments, DriverReviews, Profile, ListSkeleton(), Profile(), ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments() (+9 more)

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.14
Nodes (14): connectDB(), closeRedis(), gracefulShutdown(), io, server, acceptBooking(), rejectBooking(), STATUS_TRANSITIONS (+6 more)

### Community 22 - "googleMaps.service.js"
Cohesion: 0.33
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "Skeleton.jsx"
Cohesion: 0.16
Nodes (10): DriverHistory, ManageDrivers, Badge(), ConfirmDialog(), EmptyState(), SearchBar(), TableSkeleton(), ManageDrivers() (+2 more)

### Community 24 - "InfoDetail.jsx"
Cohesion: 0.33
Nodes (4): FAQS, ORDER, TITLES, TOPICS

### Community 26 - "notification.routes.js"
Cohesion: 0.43
Nodes (6): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router

### Community 28 - "useSocket"
Cohesion: 0.14
Nodes (17): AdminNotifications, DriverBookings, DriverNotifications, Notifications, SocketContext, useSocket(), AdminBookingRequests(), AdminNotifications() (+9 more)

### Community 39 - "driver.service.js"
Cohesion: 0.10
Nodes (3): driverWalletSchema, transactionSchema, createDriverProfile()

### Community 40 - "CarTypePage.jsx"
Cohesion: 0.19
Nodes (14): Hero(), CarTypePage(), imageFor(), ConfirmPage(), fmtWhen(), GuestBookingForm(), pad(), clearDraft() (+6 more)

### Community 42 - "user.routes.js"
Cohesion: 0.14
Nodes (14): getDriverPerformance(), toggleOnlineStatus(), getRideHistory(), changePassword(), getAllUsers(), updateProfile(), authorize(), validateQuery() (+6 more)

### Community 43 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.15
Nodes (14): rateDriver(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), validate(), validateParams(), router (+6 more)

### Community 48 - "User.js"
Cohesion: 0.16
Nodes (5): app, driverProfileSchema, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "images/index.js"
Cohesion: 0.27
Nodes (5): Footer(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES

### Community 52 - "Home.jsx"
Cohesion: 0.10
Nodes (21): Home, BookingTariff(), tabs, FarePricing(), rows, cardHover, PopularRoutes(), ROUTES (+13 more)

### Community 53 - "ErrorState.jsx"
Cohesion: 0.14
Nodes (13): AdminDashboard, CustomerDashboard, DriverBookingDetail, DriverDashboard, Earnings, ErrorState(), CardSkeleton(), StatsCard() (+5 more)

### Community 54 - "App.jsx"
Cohesion: 0.06
Nodes (29): About, AdminBookingRequests, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage, ContactUs (+21 more)

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 59 - "SEO.jsx"
Cohesion: 0.16
Nodes (13): getOrigin(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), features, pillars, stats (+5 more)

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 63 - "BookRide.jsx"
Cohesion: 0.11
Nodes (21): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+13 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "DriverCharts.jsx"
Cohesion: 0.25
Nodes (3): COLORS, DriverCharts, DriverPie

### Community 67 - "auth.middleware.js"
Cohesion: 0.31
Nodes (6): guestSearchLimiter, estimateFare(), authenticate(), router, verifyToken(), fareEstimateSchema

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.26
Nodes (13): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+5 more)

### Community 70 - "ManageBookings.jsx"
Cohesion: 0.16
Nodes (12): Invoices, Payments, CancelReasonDialog(), DEFAULT_REASONS, Modal(), Pagination(), STATUS_COLORS, getInvoiceAmount() (+4 more)

### Community 71 - "TariffChart.jsx"
Cohesion: 0.40
Nodes (5): imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 73 - "BookingDetailsPage.jsx"
Cohesion: 0.14
Nodes (15): BookingDetailsPage, CurrentRideCustomer, formatTime(), RideTimeline(), STAGES, BookingDetailsPage(), formatDateTime(), STATUS_COLORS (+7 more)

### Community 81 - "useAuth"
Cohesion: 0.06
Nodes (46): AdminLayout, App(), CustomerLayout, DriverContinue, DriverLayout, DriverLogin, DriverProfilePage, DriverRegister (+38 more)

### Community 87 - "webhook.controller.js"
Cohesion: 0.19
Nodes (9): getRedisClient(), IORedisRateLimitStore, checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature() (+1 more)

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 91 - "dispatch.service.js"
Cohesion: 0.52
Nodes (6): dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), sendToNextDriver(), sendRideRequest()

## Knowledge Gaps
- **195 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+190 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `admin.service.js`, `driver.service.js`, `booking.routes.js`, `socket/index.js`, `webhook.controller.js`, `payment.service.js`, `dispatch.service.js`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `webhook.controller.js` to `app.js`, `socket/index.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `getIO()` connect `booking.routes.js` to `dispatch.service.js`, `admin.routes.js`, `socket/index.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _195 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14022988505747128 - nodes in this community are weakly interconnected._
- **Should `Booking.js` be split into smaller, more focused modules?**
  _Cohesion score 0.1323529411764706 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.08233117483811286 - nodes in this community are weakly interconnected._