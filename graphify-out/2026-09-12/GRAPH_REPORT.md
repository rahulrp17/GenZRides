# Graph Report - Cab Booking App  (2026-09-06)

## Corpus Check
- 240 files · ~1,585,194 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1181 nodes · 2597 edges · 93 communities (74 shown, 19 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 145 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- app.js
- images/index.js
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
- upload.middleware.js
- favoriteLocation.service.js
- booking.service.js
- auth.middleware.js
- booking.routes.js
- favoriteLocation.routes.js
- DriverDocuments.jsx
- jest
- socket/index.js
- googleMaps.service.js
- EmptyState.jsx
- Reveal
- notification.routes.js
- React + Vite
- useSocket
- AGENTS.md
- driver.service.js
- CarTypePage.jsx
- QueryProvider.jsx
- user.routes.js
- testMatch
- PushListener.jsx
- backend/package.json
- rating.routes.js
- User.js
- dispatch.routes.js
- SEO.jsx
- useAuth
- Home.jsx
- Skeleton.jsx
- App.jsx
- server.js
- scripts
- TariffChart.jsx
- moduleFileExtensions
- theme.js
- main.jsx
- BookRide.jsx
- Testiminols.jsx
- api.js
- DriverCharts.jsx
- common.validator.js
- frontend/package.json
- whatsapp.service.js
- endpoints.js
- useAuth.js
- RouteErrorBoundary
- BookingDetailsPage.jsx
- react-dom
- react-router-dom
- react-hot-toast
- recharts
- @tanstack/react-query
- swiper
- tailwindcss
- DriverRegister.jsx
- webhook.controller.js
- PushToggle.jsx
- DriverContinue.jsx
- About.jsx
- getRedisClient
- Navbar.jsx
- withTransaction
- review.routes.js
- WithdrawalRequest.js
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
- `Profile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/Profile.jsx → frontend/src/hooks/useAuth.js
- `DriverContinue()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver-auth/DriverContinue.jsx → frontend/src/hooks/useAuth.js
- `DriverLogin()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver-auth/DriverLogin.jsx → frontend/src/hooks/useAuth.js
- `DriverProfile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverProfilePage.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (93 total, 19 thin omitted)

### Community 0 - "app.js"
Cohesion: 0.11
Nodes (22): configuredOrigins, isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+14 more)

### Community 1 - "images/index.js"
Cohesion: 0.15
Nodes (14): cardHover, GlowBlobs(), SectionHeading(), PopularRoutes(), ROUTES, SERVICES, imageFor(), VehicleShowcase() (+6 more)

### Community 2 - "DriverProfile.js"
Cohesion: 0.14
Nodes (5): bookingSchema, locationSchema, driverProfileSchema, STATUS_TRANSITIONS, TIMESTAMP_FIELD

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (45): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+37 more)

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
Cohesion: 0.31
Nodes (7): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), createOrderSchema, verifyPaymentSchema

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.12
Nodes (17): framer-motion, dependencies, axios, framer-motion, lucide-react, react, @react-google-maps/api, react-icons (+9 more)

### Community 13 - "upload.middleware.js"
Cohesion: 0.13
Nodes (12): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, router, uploadDriverDocument() (+4 more)

### Community 15 - "booking.service.js"
Cohesion: 0.14
Nodes (21): cancelBooking(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking() (+13 more)

### Community 16 - "auth.middleware.js"
Cohesion: 0.25
Nodes (9): getDriverPerformance(), toggleOnlineStatus(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), authenticate(), authorize() (+1 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.06
Nodes (47): razorpay, acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking() (+39 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.33
Nodes (6): createLocation(), deleteLocation(), getLocations(), updateLocation(), createLocationSchema, updateLocationSchema

### Community 19 - "DriverDocuments.jsx"
Cohesion: 0.33
Nodes (6): DriverDocuments, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 20 - "jest"
Cohesion: 0.15
Nodes (13): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, transform, transformIgnorePatterns, ^.+\\.js$ (+5 more)

### Community 21 - "socket/index.js"
Cohesion: 0.26
Nodes (6): acceptBooking(), updateRideStatus(), initializeSocket(), addUser(), removeUser(), users

### Community 22 - "googleMaps.service.js"
Cohesion: 0.33
Nodes (5): calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 23 - "EmptyState.jsx"
Cohesion: 0.17
Nodes (12): ManageDrivers, AssignDriverDialog(), Badge(), ConfirmDialog(), EmptyState(), Modal(), SearchBar(), TableSkeleton() (+4 more)

### Community 24 - "Reveal"
Cohesion: 0.15
Nodes (11): PageHero(), Reveal(), FAQS, FAQS, SECTIONS, FAQS, ORDER, TITLES (+3 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.43
Nodes (6): deleteNotification(), getNotifications(), getUnreadCount(), markAllAsRead(), markAsRead(), router

### Community 28 - "useSocket"
Cohesion: 0.17
Nodes (15): AdminNotifications, DriverNotifications, Notifications, ListSkeleton(), SocketContext, useSocket(), AdminBookingRequests(), AdminNotifications() (+7 more)

### Community 40 - "CarTypePage.jsx"
Cohesion: 0.20
Nodes (13): Hero(), CarTypePage(), imageFor(), ConfirmPage(), fmtWhen(), GuestBookingForm(), pad(), clearDraft() (+5 more)

### Community 42 - "user.routes.js"
Cohesion: 0.22
Nodes (5): changePassword(), getAllUsers(), updateProfile(), changePasswordSchema, updateProfileSchema

### Community 43 - "testMatch"
Cohesion: 0.67
Nodes (3): testMatch, **/*.test.js, **/__tests__/**/*.test.js

### Community 44 - "PushListener.jsx"
Cohesion: 0.23
Nodes (9): AdminLayout, DriverLayout, bookingIdOf(), detailsUrlFor(), PushListener(), AdminLayout(), navItems, DriverLayout() (+1 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "rating.routes.js"
Cohesion: 0.23
Nodes (6): downloadInvoice(), rateDriver(), validateParams(), generateInvoice(), bookingIdParamSchema, rateDriverSchema

### Community 48 - "User.js"
Cohesion: 0.13
Nodes (7): app, driverWalletSchema, transactionSchema, paymentSchema, userSchema, vehicleSchema, walletTransactionSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.52
Nodes (5): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver()

### Community 50 - "SEO.jsx"
Cohesion: 0.28
Nodes (7): Footer(), Navbar(), getOrigin(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta()

### Community 51 - "useAuth"
Cohesion: 0.20
Nodes (10): CustomerLayout, ProtectedRoute(), useAuth(), CustomerLayout(), navItems, BookingDetailsPage(), formatDateTime(), CustomerDashboard() (+2 more)

### Community 52 - "Home.jsx"
Cohesion: 0.12
Nodes (15): Home, BookingTariff(), tabs, FarePricing(), rows, DriverCTA(), FinalCTA(), TESTIMONIALS (+7 more)

### Community 53 - "Skeleton.jsx"
Cohesion: 0.15
Nodes (13): AdminDashboard, CustomerDashboard, DriverBookingDetail, DriverBookings, DriverDashboard, Earnings, ErrorState(), CardSkeleton() (+5 more)

### Community 54 - "App.jsx"
Cohesion: 0.07
Nodes (25): About, AdminBookingRequests, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage, ContactUs (+17 more)

### Community 55 - "server.js"
Cohesion: 0.24
Nodes (8): connectDB(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io, server

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 59 - "TariffChart.jsx"
Cohesion: 0.18
Nodes (10): imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData, AttachVehicle(), cardVariants, imageForVehicle() (+2 more)

### Community 60 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "main.jsx"
Cohesion: 0.22
Nodes (7): App(), AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient

### Community 63 - "BookRide.jsx"
Cohesion: 0.11
Nodes (21): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+13 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "DriverCharts.jsx"
Cohesion: 0.25
Nodes (3): COLORS, DriverCharts, DriverPie

### Community 67 - "common.validator.js"
Cohesion: 0.17
Nodes (11): guestSearchLimiter, estimateFare(), getRideHistory(), validate(), validateQuery(), router, fareEstimateSchema, idParamSchema (+3 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.26
Nodes (13): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+5 more)

### Community 70 - "endpoints.js"
Cohesion: 0.10
Nodes (18): CustomerReviews, DriverHistory, DriverReviews, Invoices, Payments, RideHistory, WalletPage, Pagination() (+10 more)

### Community 71 - "useAuth.js"
Cohesion: 0.22
Nodes (7): DriverProfilePage, Profile, AuthContext, Profile(), DriverProfile(), uploadAPI, userAPI

### Community 73 - "BookingDetailsPage.jsx"
Cohesion: 0.09
Nodes (23): BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerBookings, CancelReasonDialog(), DEFAULT_REASONS, formatTime(), RideTimeline() (+15 more)

### Community 81 - "DriverRegister.jsx"
Cohesion: 0.17
Nodes (12): DriverLogin, DriverRegister, Login, AUTH_SLIDES, AuthSplit(), getAuthErrorMessage(), Login(), DriverLogin() (+4 more)

### Community 82 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 83 - "PushToggle.jsx"
Cohesion: 0.71
Nodes (5): PushToggle(), getPushPermission(), isPushSupported(), requestPushPermission(), showBrowserNotification()

### Community 84 - "DriverContinue.jsx"
Cohesion: 0.33
Nodes (5): DriverContinue, benefits, DriverContinue(), requirements, steps

### Community 85 - "About.jsx"
Cohesion: 0.33
Nodes (4): features, pillars, stats, values

### Community 88 - "Navbar.jsx"
Cohesion: 0.50
Nodes (3): DASHBOARD_ROUTES, NOTIF_ROUTES, PROFILE_ROUTES

### Community 90 - "review.routes.js"
Cohesion: 0.39
Nodes (4): createReview(), getDriverReviews(), getMyReviews(), createReviewSchema

## Knowledge Gaps
- **196 isolated node(s):** `name`, `version`, `main`, `type`, `test` (+191 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `admin.service.js`, `driver.service.js`, `booking.routes.js`, `webhook.controller.js`, `socket/index.js`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `getRedisClient` to `app.js`, `webhook.controller.js`, `socket/index.js`, `server.js`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `getIO()` connect `booking.routes.js` to `admin.routes.js`, `socket/index.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `name`, `version`, `main` to the rest of the system?**
  _196 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `app.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11333333333333333 - nodes in this community are weakly interconnected._
- **Should `images/index.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14814814814814814 - nodes in this community are weakly interconnected._
- **Should `DriverProfile.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14166666666666666 - nodes in this community are weakly interconnected._