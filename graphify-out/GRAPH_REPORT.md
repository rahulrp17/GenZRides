# Graph Report - Cab Booking App  (2026-09-15)

## Corpus Check
- 283 files · ~3,332,171 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2772 nodes · 9281 edges · 130 communities (107 shown, 23 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 1212 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fd5b587a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- webhook.controller.js
- Reveal.jsx
- defaultSettingsView-Ds6CBOo0.js
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
- i
- booking.routes.js
- favoriteLocation.routes.js
- useAuth
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
- n
- backend/package.json
- common.validator.js
- codeMirrorModule-BbkfBe3n.js
- toString
- endpoints.js
- useSocket
- Home.jsx
- BookingDetailsPage.jsx
- App.jsx
- G
- scripts
- app.js
- Vehicles.jsx
- k
- theme.js
- ic
- SEO.jsx
- Testiminols.jsx
- api.js
- DriverDashboard.jsx
- matches
- frontend/package.json
- whatsapp.service.js
- ec
- email.service.js
- playwright
- ec
- react-router-dom
- ride-flow.spec.js
- react-hot-toast
- sw.bundle.js
- Skeleton.jsx
- swiper
- tailwindcss
- TariffChart.jsx
- live-location.spec.js
- payment.service.js
- n
- so
- socket.io-client
- uiMode.CU5KtEkS.js
- vercel.json
- auth.middleware.js
- constructor
- react-hook-form
- BookRide.jsx
- push.service.js
- parseDocument
- devDependencies
- lucide-react
- Ut
- notification.service.js
- ya
- get
- getEntriesGenerator
- update
- dispatch
- ts
- vn
- constructor
- r
- _absoluteLocation
- generateLocator
- VehicleSelector.jsx
- $e
- RouteServices.jsx
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- _onProject
- _onConfigure
- express
- express-rate-limit
- express-validator
- mongoose
- morgan
- nodemailer
- socket.io
- @socket.io/redis-adapter
- zod

## God Nodes (most connected - your core abstractions)
1. `i()` - 144 edges
2. `n()` - 117 edges
3. `t()` - 96 edges
4. `r()` - 96 edges
5. `a()` - 96 edges
6. `constructor()` - 73 edges
7. `k()` - 70 edges
8. `o()` - 67 edges
9. `get()` - 63 edges
10. `O()` - 60 edges

## Surprising Connections (you probably didn't know these)
- `cancelBooking()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/admin.service.js → backend/src/services/notification.service.js
- `createDriverProfile()` --calls--> `notifyUser()`  [EXTRACTED]
  backend/src/services/driver.service.js → backend/src/services/notification.service.js
- `AdminProfile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/admin/AdminProfile.jsx → frontend/src/hooks/useAuth.js
- `CustomerDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/CustomerDashboard.jsx → frontend/src/hooks/useAuth.js
- `Profile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/Profile.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (130 total, 23 thin omitted)

### Community 0 - "webhook.controller.js"
Cohesion: 0.19
Nodes (9): getRedisClient(), IORedisRateLimitStore, checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature() (+1 more)

### Community 1 - "Reveal.jsx"
Cohesion: 0.09
Nodes (25): About, AirportDetail, AirportTransfers, ContactUs, PopularRoutes, RouteDetail, Services, cardHover (+17 more)

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (156): _activelyFocused(), Al(), appendChild(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure(), ariaSnapshotJSON(), atDocument(), be() (+148 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (47): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+39 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+23 more)

### Community 5 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (18): invalidateCache(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), withdrawalRequestSchema, cancelBooking() (+10 more)

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
Cohesion: 0.13
Nodes (14): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, uploadSingle(), router (+6 more)

### Community 14 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 15 - "booking.service.js"
Cohesion: 0.11
Nodes (22): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+14 more)

### Community 16 - "i"
Cohesion: 0.08
Nodes (96): A(), ae(), at(), b(), c(), g(), o(), s() (+88 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.16
Nodes (26): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+18 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "useAuth"
Cohesion: 0.09
Nodes (40): AdminLayout, App(), CustomerLayout, DriverContinue, DriverLayout, DriverLogin, AutoPushSync(), ProtectedRoute() (+32 more)

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "socket/index.js"
Cohesion: 0.12
Nodes (20): driverProfileSchema, assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout() (+12 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.15
Nodes (14): sendMessage(), buildVehicleContext(), chat(), extractLocations(), fallbackChat(), getMyBookings(), calculateFare(), FARE_CONFIG (+6 more)

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
Cohesion: 0.11
Nodes (4): walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "ConfirmPage.jsx"
Cohesion: 0.12
Nodes (19): CarTypePage, ConfirmPage, GuestBookingPage, WaitingPage, Footer(), Reveal(), Navbar(), CarTypePage() (+11 more)

### Community 42 - "user.routes.js"
Cohesion: 0.12
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.22
Nodes (12): guestSearchLimiter, autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema (+4 more)

### Community 44 - "n"
Cohesion: 0.06
Nodes (91): _activeSelectorForEvent(), add(), addIn(), ap(), as(), b(), Bf(), bl() (+83 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.09
Nodes (23): estimateFare(), downloadInvoice(), rateDriver(), createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), validate() (+15 more)

### Community 48 - "codeMirrorModule-BbkfBe3n.js"
Cohesion: 0.05
Nodes (81): ac(), ar(), Bn(), br(), ca(), cc(), cn(), cr() (+73 more)

### Community 49 - "toString"
Cohesion: 0.06
Nodes (86): ad(), ar(), bd(), cd(), createNode(), createPair(), ct(), Cu() (+78 more)

### Community 50 - "endpoints.js"
Cohesion: 0.08
Nodes (24): DriverDocuments, AUTH_SLIDES, AuthSplit(), getAuthErrorMessage(), Login(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext (+16 more)

### Community 51 - "useSocket"
Cohesion: 0.10
Nodes (19): DriverBookings, DASHBOARD_ROUTES, NOTIF_ROUTES, PROFILE_ROUTES, SocketContext, useSocket(), AdminNotifications(), bookingIdOf() (+11 more)

### Community 52 - "Home.jsx"
Cohesion: 0.09
Nodes (21): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, Hero(), DriverCTA() (+13 more)

### Community 53 - "BookingDetailsPage.jsx"
Cohesion: 0.16
Nodes (15): BookingDetailsPage, DriverBookingDetail, AdminBookingRequests(), BookingDetailsPage(), formatDateTime(), STATUS_COLORS, STATUS_LABELS, STATUS_ORDER (+7 more)

### Community 54 - "App.jsx"
Cohesion: 0.06
Nodes (29): AdminBookingRequests, AdminNotifications, CustomerBookings, CustomerReviews, DriverHistory, DriverNotifications, DriverRegister, DriverReviews (+21 more)

### Community 55 - "G"
Cohesion: 0.05
Nodes (64): addMaskedElements(), addUserOverlay(), ariaSnapshot(), clearHighlight(), _commit(), _commitAssertValue(), _consumeRightButtonEvent(), _createHighlightElement() (+56 more)

### Community 56 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 58 - "app.js"
Cohesion: 0.08
Nodes (26): app, configuredOrigins, connectDB(), fixBookingAlertIndexes(), closeRedis(), isRedisConnected(), authLimiter, createLimiter() (+18 more)

### Community 59 - "Vehicles.jsx"
Cohesion: 0.20
Nodes (8): AttachVehicle, imageFor(), VehicleShowcase(), AttachVehicle(), cardVariants, imageForVehicle(), vehicles, vehicleAPI

### Community 60 - "k"
Cohesion: 0.12
Nodes (59): Ae(), at(), B(), be(), Ce(), ct(), De(), Do() (+51 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "ic"
Cohesion: 0.08
Nodes (59): aa(), an(), ao(), bc(), cc(), ci(), co(), cs() (+51 more)

### Community 63 - "SEO.jsx"
Cohesion: 0.12
Nodes (15): Info, InfoDetail, NotFound, getOrigin(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta() (+7 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "DriverDashboard.jsx"
Cohesion: 0.07
Nodes (18): AdminDashboard, CustomerDashboard, DriverDashboard, Earnings, BAR_COLORS, COLORS, COLORS, DriverCharts (+10 more)

### Community 67 - "matches"
Cohesion: 0.08
Nodes (59): am(), _applyAttribute(), _assert(), atIndentedComment(), begin(), blockMap(), blockScalar(), blockSequence() (+51 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.20
Nodes (9): name, private, scripts, build, dev, lint, preview, type (+1 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "ec"
Cohesion: 0.09
Nodes (55): ai(), as(), bi(), ci(), di(), ds(), ea(), ec() (+47 more)

### Community 71 - "email.service.js"
Cohesion: 0.12
Nodes (20): bookingSchema, locationSchema, emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients() (+12 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "ec"
Cohesion: 0.07
Nodes (53): ac(), ariaSnapshotForRecorder(), bi(), C(), cf(), _createInternalLabelEngine(), _createVisibleEngine(), ea() (+45 more)

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 77 - "sw.bundle.js"
Cohesion: 0.06
Nodes (31): actions(), addFrameSnapshot(), _appendEvent(), appendTrace(), B(), _collectSnapshotPhase(), hasEntry(), _innerAppendEvent() (+23 more)

### Community 78 - "Skeleton.jsx"
Cohesion: 0.11
Nodes (24): ManageBookings, AssignDriverDialog(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), ErrorState() (+16 more)

### Community 81 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 84 - "n"
Cohesion: 0.20
Nodes (50): A(), g(), p(), bt(), C(), i(), r(), u() (+42 more)

### Community 85 - "so"
Cohesion: 0.10
Nodes (40): aa(), an(), ao(), ba(), Bs(), n(), co(), cs() (+32 more)

### Community 87 - "uiMode.CU5KtEkS.js"
Cohesion: 0.06
Nodes (10): m(), ve(), y(), ./assets/xtermModule-DywYcAf8.js, collectTestIds(), fileNames(), flatTreeItems(), L() (+2 more)

### Community 90 - "auth.middleware.js"
Cohesion: 0.12
Nodes (20): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus(), createReview() (+12 more)

### Community 93 - "constructor"
Cohesion: 0.08
Nodes (30): an(), close(), cn(), constructor(), c(), dn(), en(), fromBits() (+22 more)

### Community 95 - "BookRide.jsx"
Cohesion: 0.13
Nodes (22): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+14 more)

### Community 96 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 97 - "parseDocument"
Cohesion: 0.26
Nodes (24): atLineEnd(), charAt(), continueScalar(), getLine(), hasChars(), lex(), parseBlockScalar(), parseBlockScalarHeader() (+16 more)

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

### Community 100 - "Ut"
Cohesion: 0.10
Nodes (22): af(), ariaSnapshotForCall(), bm(), bt(), createRelativeUrl(), eventsForAction(), fn(), Ft() (+14 more)

### Community 101 - "notification.service.js"
Cohesion: 0.15
Nodes (14): notificationSchema, bookingAccepted(), bookingCancelled(), createNotification(), driverArrived(), notifyCustomer(), notifyDriver(), paymentFailed() (+6 more)

### Community 102 - "ya"
Cohesion: 0.11
Nodes (21): v(), _a(), addResource(), ba(), Ca(), closestScreenshot(), ga(), ha() (+13 more)

### Community 103 - "get"
Cohesion: 0.16
Nodes (20): c(), n(), Dr(), t(), g(), n(), e(), get() (+12 more)

### Community 104 - "getEntriesGenerator"
Cohesion: 0.20
Nodes (19): aa(), ea(), getData(), getEntries(), getEntriesGenerator(), gt(), i(), ia() (+11 more)

### Community 105 - "update"
Cohesion: 0.15
Nodes (17): _block(), calculate(), concat(), _crypt(), decrypt(), digest(), encrypt(), _f() (+9 more)

### Community 106 - "dispatch"
Cohesion: 0.13
Nodes (15): _createTestResult(), dispatch(), F(), _handleOnError(), _onAttach(), _onBegin(), _onEnd(), _onError() (+7 more)

### Community 107 - "ts"
Cohesion: 0.22
Nodes (13): ai(), fs(), li(), ls(), ms(), ns(), oi(), rs() (+5 more)

### Community 108 - "vn"
Cohesion: 0.19
Nodes (13): jn(), append(), bn(), gn(), hn(), Jn(), Kn(), _n() (+5 more)

### Community 109 - "constructor"
Cohesion: 0.21
Nodes (13): _addChild(), allTests(), constructor(), _createReporter(), _defaultDescribeItem(), entries(), _fileItem(), filterTree() (+5 more)

### Community 110 - "r"
Cohesion: 0.30
Nodes (12): Ar(), Fr(), init(), Ir(), jr(), kr(), Mr(), Nr() (+4 more)

### Community 111 - "_absoluteLocation"
Cohesion: 0.27
Nodes (10): _absoluteAnnotationLocationsInplace(), _absoluteLocation(), _addSuite(), _addTest(), _mergeSuiteInto(), _mergeTestInto(), _onStepBegin(), _onTestEnd() (+2 more)

### Community 112 - "generateLocator"
Cohesion: 0.67
Nodes (9): generateLocator(), Jt(), quote(), regexToSourceString(), regexToString(), toCallWithExact(), toHasNotText(), toHasText() (+1 more)

### Community 113 - "VehicleSelector.jsx"
Cohesion: 0.32
Nodes (5): cardVariants, containerVariants, formatCurrency(), vehicleImageFor(), VehicleSelector()

### Community 115 - "$e"
Cohesion: 0.29
Nodes (8): $e(), inflate(), inflateEnd(), inflateInit(), ke(), h(), read_byte(), tt()

### Community 116 - "RouteServices.jsx"
Cohesion: 0.33
Nodes (5): PopularRoutes(), ROUTES, SERVICES, FareNotes(), NOTES

### Community 117 - "error-context.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 118 - "feda50cb721f19ae14fb62cd5058fe0647f8a34d.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 119 - "_onProject"
Cohesion: 0.40
Nodes (5): _absolutePath(), N(), _onProject(), _parseProject(), project()

### Community 120 - "_onConfigure"
Cohesion: 0.67
Nodes (3): I(), _onConfigure(), _parseConfig()

## Knowledge Gaps
- **261 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+256 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `update` to `defaultSettingsView-Ds6CBOo0.js`, `sw.bundle.js`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `rn()` connect `constructor` to `Ut`, `ec`, `get`, `getEntriesGenerator`, `vn`, `sw.bundle.js`, `r`, `k`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `constructor()` connect `constructor` to `get`, `getEntriesGenerator`, `update`, `vn`, `sw.bundle.js`, `r`, `codeMirrorModule-BbkfBe3n.js`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `i()` (e.g. with `defaultSettingsView-Ds6CBOo0.js` and `addIn()`) actually correct?**
  _`i()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `n()` (e.g. with `aa()` and `addIn()`) actually correct?**
  _`n()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `t()` (e.g. with `add()` and `ao()`) actually correct?**
  _`t()` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `r()` (e.g. with `A()` and `ac()`) actually correct?**
  _`r()` has 66 INFERRED edges - model-reasoned connections that need verification._