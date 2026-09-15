# Graph Report - Cab Booking App  (2026-09-15)

## Corpus Check
- 274 files · ~3,545,359 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1406 nodes · 3169 edges · 101 communities (86 shown, 15 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 156 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `47c44cbb`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- webhook.controller.js
- Reveal.jsx
- invoice.service.js
- admin.routes.js
- dependencies
- DriverProfilePage.jsx
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
- endpoints.js
- booking.routes.js
- favoriteLocation.routes.js
- DriverLayout.jsx
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
- useAuth
- backend/package.json
- common.validator.js
- Booking.js
- dispatch.routes.js
- DriverRegister.jsx
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
- SEO.jsx
- Testiminols.jsx
- api.js
- Skeleton.jsx
- vehicle.routes.js
- frontend/package.json
- whatsapp.service.js
- PushListener.jsx
- email.service.js
- playwright
- DriverCharts.jsx
- react-router-dom
- ride-flow.spec.js
- react-hot-toast
- useAuth.js
- EmptyState.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- live-location.spec.js
- payment.service.js
- validate
- About.jsx
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
- lucide-react

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
- `RideHistory()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/customer/RideHistory.jsx → frontend/src/Context/SocketContext.jsx
- `DriverLogin()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/driver-auth/DriverLogin.jsx → frontend/src/hooks/useAuth.js
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/layouts/AdminLayout.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (101 total, 15 thin omitted)

### Community 0 - "webhook.controller.js"
Cohesion: 0.19
Nodes (9): getRedisClient(), IORedisRateLimitStore, checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature() (+1 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.11
Nodes (21): AirportDetail, AirportTransfers, PopularRoutes, RouteDetail, Services, cardHover, GlowBlobs(), Reveal() (+13 more)

### Community 2 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (53): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+45 more)

### Community 4 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+41 more)

### Community 5 - "DriverProfilePage.jsx"
Cohesion: 0.18
Nodes (14): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+6 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (16): invalidateCache(), memGet(), memSet(), withCache(), withdrawalRequestSchema, cancelBooking(), createVehicle(), deleteVehicle() (+8 more)

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
Nodes (19): framer-motion, dependencies, axios, framer-motion, react, react-dom, @react-google-maps/api, react-icons (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.29
Nodes (7): uploadDriverDocumentFile(), uploadVehicleImages(), router, uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage()

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.12
Nodes (22): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+14 more)

### Community 16 - "endpoints.js"
Cohesion: 0.08
Nodes (22): CustomerReviews, DriverHistory, DriverReviews, FavoriteLocations, Invoices, Payments, RideHistory, Pagination() (+14 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.08
Nodes (41): guestBookingLimiter, acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking() (+33 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "DriverLayout.jsx"
Cohesion: 0.35
Nodes (14): DriverLayout, AutoPushSync(), PushToggle(), navItems, getExistingSubscription(), getPushPermission(), getReadyRegistration(), isPushApiSupported() (+6 more)

### Community 20 - "jest"
Cohesion: 0.17
Nodes (12): jest, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns, ^.+\\.js$ (+4 more)

### Community 21 - "socket/index.js"
Cohesion: 0.13
Nodes (19): assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking() (+11 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.16
Nodes (13): buildVehicleContext(), chat(), extractLocations(), fallbackChat(), getMyBookings(), calculateFare(), FARE_CONFIG, calculateDistance() (+5 more)

### Community 24 - "CurrentRideCustomer.jsx"
Cohesion: 0.12
Nodes (20): CurrentRide, CurrentRideCustomer, formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo(), toMs() (+12 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 28 - "auth.routes.js"
Cohesion: 0.09
Nodes (32): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+24 more)

### Community 39 - "driver.service.js"
Cohesion: 0.09
Nodes (6): driverWalletSchema, transactionSchema, walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "ConfirmPage.jsx"
Cohesion: 0.10
Nodes (22): CarTypePage, ConfirmPage, GuestBookingPage, WaitingPage, Footer(), Hero(), DASHBOARD_ROUTES, Navbar() (+14 more)

### Community 42 - "user.routes.js"
Cohesion: 0.31
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.24
Nodes (11): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema, getRouteSchema (+3 more)

### Community 44 - "useAuth"
Cohesion: 0.14
Nodes (14): DriverContinue, ProtectedRoute(), useAuth(), DriverLayout(), AdminProfile(), CustomerDashboard(), Profile(), benefits (+6 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.14
Nodes (13): getRideHistory(), rateDriver(), validateParams(), validateQuery(), router, router, router, bookingIdParamSchema (+5 more)

### Community 48 - "Booking.js"
Cohesion: 0.11
Nodes (7): app, bookingSchema, locationSchema, driverProfileSchema, paymentSchema, userSchema, vehicleSchema

### Community 49 - "dispatch.routes.js"
Cohesion: 0.43
Nodes (6): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), router

### Community 50 - "DriverRegister.jsx"
Cohesion: 0.09
Nodes (17): DriverLogin, DriverRegister, ForgotPassword, Login, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES (+9 more)

### Community 51 - "useSocket"
Cohesion: 0.16
Nodes (16): AdminNotifications, DriverBookings, DriverNotifications, Notifications, SocketContext, useSocket(), AdminNotifications(), bookingIdOf() (+8 more)

### Community 52 - "Home.jsx"
Cohesion: 0.08
Nodes (24): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), ROUTES (+16 more)

### Community 53 - "BookingDetailsPage.jsx"
Cohesion: 0.14
Nodes (19): BookingDetailsPage, CustomerBookings, DriverBookingDetail, CancelReasonDialog(), DEFAULT_REASONS, AdminBookingRequests(), ManageBookings(), BookingDetailsPage() (+11 more)

### Community 54 - "App.jsx"
Cohesion: 0.10
Nodes (17): AdminBookingRequests, DriverDocuments, ManageBookings, ManageCustomers, ManageDrivers, ManageReviews, ManageVehicles, ManageWithdrawals (+9 more)

### Community 55 - "auth.middleware.js"
Cohesion: 0.39
Nodes (6): sendMessage(), authenticate(), authenticateOptional(), getCachedUser(), router, verifyToken()

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "app.js"
Cohesion: 0.12
Nodes (22): configuredOrigins, connectDB(), fixBookingAlertIndexes(), closeRedis(), isRedisConnected(), memCache, memCacheExpiry, authLimiter (+14 more)

### Community 59 - "Vehicles.jsx"
Cohesion: 0.33
Nodes (5): AttachVehicle, AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 60 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 63 - "SEO.jsx"
Cohesion: 0.19
Nodes (10): Info, NotFound, getOrigin(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), faqJsonLd (+2 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "Skeleton.jsx"
Cohesion: 0.16
Nodes (10): AdminDashboard, CustomerDashboard, DriverDashboard, DriverWallet, Earnings, ErrorState(), CardSkeleton(), StatsCard() (+2 more)

### Community 67 - "vehicle.routes.js"
Cohesion: 0.23
Nodes (9): getDriverPerformance(), toggleOnlineStatus(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), authorize(), router (+1 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "PushListener.jsx"
Cohesion: 0.21
Nodes (11): AdminLayout, CustomerLayout, bookingIdOf(), detailsUrlFor(), PushListener(), routeSummary(), AdminLayout(), navItems (+3 more)

### Community 71 - "email.service.js"
Cohesion: 0.15
Nodes (18): emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients(), getBookingEmailFields(), getConfig() (+10 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverCharts.jsx"
Cohesion: 0.25
Nodes (5): COLORS, DriverCharts, DriverPie, DriverCharts, DriverPie

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 77 - "useAuth.js"
Cohesion: 0.19
Nodes (8): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient

### Community 78 - "EmptyState.jsx"
Cohesion: 0.18
Nodes (14): AssignDriverDialog(), Badge(), ConfirmDialog(), EmptyState(), Modal(), SearchBar(), TableSkeleton(), STATUSES (+6 more)

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 84 - "validate"
Cohesion: 0.33
Nodes (5): guestSearchLimiter, estimateFare(), validate(), router, fareEstimateSchema

### Community 85 - "About.jsx"
Cohesion: 0.29
Nodes (5): About, features, pillars, stats, values

### Community 87 - "InfoDetail.jsx"
Cohesion: 0.18
Nodes (8): ContactUs, InfoDetail, PageHero(), FAQS, FAQS, ORDER, TITLES, TOPICS

### Community 90 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 95 - "BookRide.jsx"
Cohesion: 0.10
Nodes (26): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+18 more)

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
- **252 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+247 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `notifyUser()` connect `booking.service.js` to `webhook.controller.js`, `push.service.js`, `admin.service.js`, `driver.service.js`, `booking.routes.js`, `payment.service.js`, `socket/index.js`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `getRedisClient()` connect `webhook.controller.js` to `app.js`?**
  _High betweenness centrality (0.008) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `useAuth` to `Skeleton.jsx`, `DriverProfilePage.jsx`, `PushListener.jsx`, `ConfirmPage.jsx`, `useAuth.js`, `DriverRegister.jsx`, `useSocket`, `DriverLayout.jsx`, `BookingDetailsPage.jsx`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `point`, `savedEnv`, `point` to the rest of the system?**
  _252 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Reveal.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1111111111111111 - nodes in this community are weakly interconnected._
- **Should `admin.routes.js` be split into smaller, more focused modules?**
  _Cohesion score 0.060285563194077206 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._