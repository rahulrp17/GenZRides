# Graph Report - Cab Booking App  (2026-09-15)

## Corpus Check
- 283 files · ~3,332,010 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2771 nodes · 9280 edges · 133 communities (109 shown, 24 thin omitted)
- Extraction: 87% EXTRACTED · 13% INFERRED · 0% AMBIGUOUS · INFERRED: 1212 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `65fb736e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- webhook.controller.js
- SEO.jsx
- defaultSettingsView-Ds6CBOo0.js
- admin.routes.js
- dependencies
- i
- admin.service.js
- devDependencies
- devDependencies
- onContextMenu
- payment.routes.js
- driver.routes.js
- dependencies
- driverUpload.routes.js
- favoriteLocation.service.js
- booking.service.js
- a
- booking.routes.js
- favoriteLocation.routes.js
- DriverLayout.jsx
- jest
- socket/index.js
- aiAssistant.service.js
- review.service.js
- useSocket
- notification.routes.js
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- GuestBookingForm.jsx
- QueryProvider.jsx
- user.routes.js
- googleMaps.routes.js
- n
- backend/package.json
- common.validator.js
- codeMirrorModule-BbkfBe3n.js
- bu
- dispatch.service.js
- SocketContext.jsx
- Home.jsx
- G
- App.jsx
- setScreencastAnnotation
- onClick
- app.js
- onMouseMove
- k
- theme.js
- ic
- LocationPicker.jsx
- Testiminols.jsx
- api.js
- endpoints.js
- matches
- frontend/package.json
- whatsapp.service.js
- ec
- email.service.js
- playwright
- AdminCharts.jsx
- react-router-dom
- ride-flow.spec.js
- react-hot-toast
- sw.bundle.js
- Skeleton.jsx
- swiper
- tailwindcss
- vehicle.routes.js
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
- scripts
- wd
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
- _updateVisualPosition
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- _onProject
- _onConfigure
- express
- moduleFileExtensions
- RouteErrorBoundary
- express-validator
- ioredis
- nodemailer
- socket.io
- mongoose
- zod
- morgan
- @socket.io/redis-adapter
- lucide-react

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
- `DriverBookings()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/driver/DriverBookings.jsx → frontend/src/Context/SocketContext.jsx
- `AdminLayout()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/layouts/AdminLayout.jsx → frontend/src/hooks/useAuth.js
- `CustomerLayout()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/layouts/CustomerLayout.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (133 total, 24 thin omitted)

### Community 0 - "webhook.controller.js"
Cohesion: 0.19
Nodes (9): getRedisClient(), IORedisRateLimitStore, checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature() (+1 more)

### Community 1 - "SEO.jsx"
Cohesion: 0.05
Nodes (62): AUTH_SLIDES, AuthSplit(), Footer(), cardHover, PageHero(), GlowBlobs(), Reveal(), SectionHeading() (+54 more)

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (158): _activelyFocused(), Al(), ariaSnapshot(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure(), ariaSnapshotForRecorder(), ariaSnapshotJSON(), atDocument() (+150 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (47): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+39 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+23 more)

### Community 5 - "i"
Cohesion: 0.08
Nodes (66): add(), addIn(), appendChild(), Bf(), bl(), chainLocators(), Cl(), delete() (+58 more)

### Community 6 - "admin.service.js"
Cohesion: 0.06
Nodes (11): invalidateCache(), withdrawalRequestSchema, cancelBooking(), createVehicle(), deleteVehicle(), disableVehicle(), enableVehicle(), updateVehicle() (+3 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "onContextMenu"
Cohesion: 0.18
Nodes (15): _activeSelectorForEvent(), _captureAutoExpectSnapshot(), _computeAutoExpectPrecondition(), firstTooltipBox(), _isEditable(), _modelForElement(), onContextMenu(), onInput() (+7 more)

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
Cohesion: 0.12
Nodes (22): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+14 more)

### Community 16 - "a"
Cohesion: 0.08
Nodes (92): A(), ad(), ae(), ap(), at(), b(), c(), g() (+84 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.16
Nodes (26): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+18 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "DriverLayout.jsx"
Cohesion: 0.15
Nodes (27): AdminLayout, CustomerLayout, DriverLayout, AutoPushSync(), bookingIdOf(), detailsUrlFor(), PushListener(), routeSummary() (+19 more)

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "socket/index.js"
Cohesion: 0.10
Nodes (23): connectDB(), fixBookingAlertIndexes(), closeRedis(), isRedisConnected(), memCache, memCacheExpiry, memGet(), memSet() (+15 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.15
Nodes (14): sendMessage(), buildVehicleContext(), chat(), extractLocations(), fallbackChat(), getMyBookings(), calculateFare(), FARE_CONFIG (+6 more)

### Community 24 - "useSocket"
Cohesion: 0.07
Nodes (42): BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerBookings, DriverBookingDetail, CancelReasonDialog(), DEFAULT_REASONS, formatTime() (+34 more)

### Community 26 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 28 - "auth.routes.js"
Cohesion: 0.09
Nodes (32): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+24 more)

### Community 39 - "driver.service.js"
Cohesion: 0.09
Nodes (6): driverWalletSchema, transactionSchema, walletTransactionSchema, createDriverProfile(), getWalletSummary(), getWalletTransactions()

### Community 40 - "GuestBookingForm.jsx"
Cohesion: 0.14
Nodes (12): Hero(), CarTypePage(), imageFor(), ConfirmPage(), fmtWhen(), formatCurrency(), GuestBookingForm(), pad() (+4 more)

### Community 42 - "user.routes.js"
Cohesion: 0.20
Nodes (6): changePassword(), getAllUsers(), updateProfile(), router, changePasswordSchema, updateProfileSchema

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.22
Nodes (12): guestSearchLimiter, autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), router, autocompleteSchema (+4 more)

### Community 44 - "n"
Cohesion: 0.07
Nodes (62): aa(), ariaSnapshotForCall(), as(), b(), bd(), bm(), Bo(), bs() (+54 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "common.validator.js"
Cohesion: 0.09
Nodes (20): estimateFare(), getRideHistory(), rateDriver(), createReview(), getDriverReviews(), getMyReviews(), validate(), validateQuery() (+12 more)

### Community 48 - "codeMirrorModule-BbkfBe3n.js"
Cohesion: 0.05
Nodes (81): ac(), ar(), Bn(), br(), ca(), cc(), cn(), cr() (+73 more)

### Community 49 - "bu"
Cohesion: 0.09
Nodes (55): Au(), bu(), clone(), createNode(), createPair(), Cu(), dd(), dm() (+47 more)

### Community 50 - "dispatch.service.js"
Cohesion: 0.27
Nodes (10): assignDriver(), getAvailableBookings(), dispatchBooking(), findNearbyDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking(), sendToNextDriver() (+2 more)

### Community 51 - "SocketContext.jsx"
Cohesion: 0.18
Nodes (9): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketContext, SocketProvider() (+1 more)

### Community 52 - "Home.jsx"
Cohesion: 0.08
Nodes (24): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), SERVICES (+16 more)

### Community 53 - "G"
Cohesion: 0.40
Nodes (11): _consumeRightButtonEvent(), G(), _ignoreOverlayEvent(), onDblClick(), onKeyUp(), onMouseDown(), onMouseEnter(), onMouseUp() (+3 more)

### Community 54 - "App.jsx"
Cohesion: 0.04
Nodes (51): About, AdminBookingRequests, AdminNotifications, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage (+43 more)

### Community 55 - "setScreencastAnnotation"
Cohesion: 0.11
Nodes (21): addMaskedElements(), addUserOverlay(), clearHighlight(), _createHighlightElement(), _ensureElementHighlightRaf(), _ensureHighlight(), getUserOverlay(), hideActionCursor() (+13 more)

### Community 56 - "onClick"
Cohesion: 0.29
Nodes (10): _commit(), _commitAssertValue(), firstBox(), flashToolSucceeded(), _generateAction(), onClick(), _renderValue(), _showDialog() (+2 more)

### Community 58 - "app.js"
Cohesion: 0.10
Nodes (18): app, configuredOrigins, authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+10 more)

### Community 59 - "onMouseMove"
Cohesion: 0.27
Nodes (10): _elementHasValue(), generateSelector(), _installObserverIfNeeded(), onFocus(), onMouseLeave(), onMouseMove(), onScroll(), _reset() (+2 more)

### Community 60 - "k"
Cohesion: 0.12
Nodes (59): Ae(), at(), B(), be(), Ce(), ct(), De(), Do() (+51 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "ic"
Cohesion: 0.05
Nodes (92): ac(), af(), an(), ao(), bc(), bn(), C(), cc() (+84 more)

### Community 63 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "endpoints.js"
Cohesion: 0.05
Nodes (43): AdminDashboard, AdminProfile, CustomerDashboard, DriverDashboard, DriverLogin, DriverProfilePage, Earnings, Profile (+35 more)

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
Nodes (54): ai(), as(), bi(), ci(), di(), ds(), ea(), ec() (+46 more)

### Community 71 - "email.service.js"
Cohesion: 0.12
Nodes (20): bookingSchema, locationSchema, emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients() (+12 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 77 - "sw.bundle.js"
Cohesion: 0.06
Nodes (31): actions(), addFrameSnapshot(), _appendEvent(), appendTrace(), B(), _collectSnapshotPhase(), hasEntry(), _innerAppendEvent() (+23 more)

### Community 78 - "Skeleton.jsx"
Cohesion: 0.10
Nodes (31): DriverBookings, AssignDriverDialog(), Badge(), ConfirmDialog(), EmptyState(), ErrorState(), Modal(), Pagination() (+23 more)

### Community 81 - "vehicle.routes.js"
Cohesion: 0.12
Nodes (19): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), downloadInvoice(), createVehicle(), deleteVehicle() (+11 more)

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
Cohesion: 0.29
Nodes (8): getDriverPerformance(), toggleOnlineStatus(), authenticate(), authenticateOptional(), getCachedUser(), router, router, verifyToken()

### Community 93 - "constructor"
Cohesion: 0.08
Nodes (30): an(), close(), cn(), constructor(), c(), dn(), en(), fromBits() (+22 more)

### Community 95 - "BookRide.jsx"
Cohesion: 0.19
Nodes (15): BookRide, CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), BookRide(), getMinDateTime() (+7 more)

### Community 96 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 97 - "parseDocument"
Cohesion: 0.26
Nodes (24): atLineEnd(), charAt(), continueScalar(), getLine(), hasChars(), lex(), parseBlockScalar(), parseBlockScalarHeader() (+16 more)

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

### Community 99 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

### Community 100 - "wd"
Cohesion: 0.10
Nodes (25): ar(), bi(), br(), bt(), createRelativeUrl(), Dr(), fr(), Ft() (+17 more)

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
Cohesion: 0.16
Nodes (18): ai(), ba(), es(), fs(), is(), li(), ls(), ms() (+10 more)

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

### Community 116 - "_updateVisualPosition"
Cohesion: 0.40
Nodes (6): cursor(), _hideOverlay(), setUIState(), _showOverlay(), _switchCurrentTool(), _updateVisualPosition()

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

### Community 122 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

## Knowledge Gaps
- **261 isolated node(s):** `point`, `savedEnv`, `point`, `name`, `version` (+256 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `update` to `defaultSettingsView-Ds6CBOo0.js`, `sw.bundle.js`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Cn()` connect `a` to `defaultSettingsView-Ds6CBOo0.js`, `matches`, `i`, `n`, `so`, `uiMode.CU5KtEkS.js`, `constructor`, `ic`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `endpoints.js` to `useSocket`, `SEO.jsx`, `DriverLayout.jsx`, `SocketContext.jsx`?**
  _High betweenness centrality (0.003) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `i()` (e.g. with `defaultSettingsView-Ds6CBOo0.js` and `addIn()`) actually correct?**
  _`i()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `n()` (e.g. with `aa()` and `addIn()`) actually correct?**
  _`n()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `t()` (e.g. with `add()` and `ao()`) actually correct?**
  _`t()` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `r()` (e.g. with `A()` and `ac()`) actually correct?**
  _`r()` has 66 INFERRED edges - model-reasoned connections that need verification._