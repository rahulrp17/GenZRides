# Graph Report - Cab Booking App  (2026-09-21)

## Corpus Check
- 314 files · ~3,331,839 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2961 nodes · 9844 edges · 135 communities (105 shown, 30 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 1216 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e583458e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AutoPushSync.jsx
- driverUpload.routes.js
- defaultSettingsView-Ds6CBOo0.js
- admin.routes.js
- dependencies
- email.service.js
- admin.service.js
- devDependencies
- devDependencies
- favoriteLocation.routes.js
- codeMirrorModule-BbkfBe3n.js
- driver.routes.js
- dependencies
- googleMaps.routes.js
- LocationPicker.jsx
- analytics.js
- a
- booking.routes.js
- notification.service.js
- DriverProfilePage.jsx
- jest
- matches
- aiAssistant.service.js
- bu
- AdminCharts.jsx
- ya
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- favoriteLocation.service.js
- QueryProvider.jsx
- payment.routes.js
- redisRateLimiter.js
- server.js
- backend/package.json
- common.validator.js
- so
- BookRide.jsx
- _onConfigure
- useAuth
- update
- G
- endpoints.js
- c
- useSocket
- app.js
- en
- k
- theme.js
- i
- push.service.js
- Testiminols.jsx
- api.js
- review.routes.js
- pop
- frontend/package.json
- whatsapp.service.js
- us
- axios
- playwright
- DriverCharts.jsx
- GuestBookingLookup.jsx
- ride-flow.spec.js
- SEO.jsx
- sw.bundle.js
- App.jsx
- auth.middleware.js
- tailwindcss
- validate.middleware.js
- live-location.spec.js
- express-rate-limit
- n
- refresh-sitemap.mjs
- StickyMobileCTA.jsx
- uiMode.CU5KtEkS.js
- vercel.json
- lucide-react
- constructor
- payment.service.js
- VehicleSelector.jsx
- RouteErrorBoundary
- parseDocument
- devDependencies
- LoadingPage.jsx
- notification.routes.js
- booking.service.js
- render
- get
- getEntriesGenerator
- bcryptjs
- dispatch
- dotenv
- rn
- constructor
- init
- _absoluteLocation
- generateLocator
- _onProject
- multer
- pdfkit
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- framer-motion
- ec
- express
- react-dom
- nodemailer
- socket.io
- zod
- NotFound.jsx
- @react-google-maps/api
- react
- react-icons
- recharts
- @tanstack/react-query
- nl
- n
- @mantine/dates

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
- `AdminDashboard()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/admin/AdminDashboard.jsx → frontend/src/Context/SocketContext.jsx
- `AdminProfile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/admin/AdminProfile.jsx → frontend/src/hooks/useAuth.js
- `Profile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/customer/Profile.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (135 total, 30 thin omitted)

### Community 0 - "AutoPushSync.jsx"
Cohesion: 0.30
Nodes (16): AutoPushSync(), PushToggle(), playBookingAlert(), warmAudio(), bookingAlert(), getExistingSubscription(), getPushPermission(), getReadyRegistration() (+8 more)

### Community 1 - "driverUpload.routes.js"
Cohesion: 0.11
Nodes (16): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, uploadSingle(), validateParams() (+8 more)

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (153): _activelyFocused(), appendChild(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure(), ariaSnapshotJSON(), atDocument(), be(), blurNode() (+145 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (48): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+40 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, axios, cloudinary, compression, connect-redis, cookie-parser, cors, express-validator (+23 more)

### Community 5 - "email.service.js"
Cohesion: 0.15
Nodes (18): emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients(), getBookingEmailFields(), getConfig() (+10 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (20): invalidateCache(), isRedisConnected(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), reviewSchema (+12 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "favoriteLocation.routes.js"
Cohesion: 0.26
Nodes (8): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, idParamSchema, createLocationSchema, updateLocationSchema

### Community 10 - "codeMirrorModule-BbkfBe3n.js"
Cohesion: 0.05
Nodes (99): ac(), ar(), bi(), Bn(), br(), ca(), cc(), ci() (+91 more)

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): dompurify, dependencies, dompurify, @mantine/core, @mantine/hooks, react-hook-form, react-hot-toast, react-router-dom (+11 more)

### Community 13 - "googleMaps.routes.js"
Cohesion: 0.15
Nodes (18): autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), cacheMiddleware(), queryCacheKey(), redisGet() (+10 more)

### Community 14 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 15 - "analytics.js"
Cohesion: 0.54
Nodes (5): CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent()

### Community 16 - "a"
Cohesion: 0.08
Nodes (93): A(), at(), b(), c(), g(), o(), s(), v() (+85 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.14
Nodes (30): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+22 more)

### Community 18 - "notification.service.js"
Cohesion: 0.07
Nodes (33): notificationSchema, assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findEligibleDrivers(), getCurrentDriver(), handleDriverTimeout() (+25 more)

### Community 19 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

### Community 20 - "jest"
Cohesion: 0.10
Nodes (20): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, setupFiles, testEnvironment, testMatch, transform (+12 more)

### Community 21 - "matches"
Cohesion: 0.25
Nodes (19): begin(), _cached(), _callMatches(), _callQuery(), _checkSelector(), end(), _expandContextForScopeMatching(), _getEngine() (+11 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.08
Nodes (36): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+28 more)

### Community 23 - "bu"
Cohesion: 0.06
Nodes (81): ad(), ar(), bd(), bu(), cd(), createNode(), createPair(), Cu() (+73 more)

### Community 24 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 26 - "ya"
Cohesion: 0.18
Nodes (13): _a(), ba(), Ca(), ga(), ha(), hasEntry(), resourceEntry(), Sa() (+5 more)

### Community 28 - "auth.routes.js"
Cohesion: 0.09
Nodes (37): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+29 more)

### Community 39 - "driver.service.js"
Cohesion: 0.10
Nodes (11): walletTransactionSchema, createDriverProfile(), getDriverDashboard(), getDriverEarnings(), getDriverStatistics(), getWalletSummary(), getWalletTransactions(), getDriverPeriodEarnings() (+3 more)

### Community 40 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 42 - "payment.routes.js"
Cohesion: 0.27
Nodes (8): createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema, verifyPaymentSchema

### Community 43 - "redisRateLimiter.js"
Cohesion: 0.11
Nodes (18): getRedisClient(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter, IORedisRateLimitStore (+10 more)

### Community 44 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 45 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, babel, presets, description, keywords, license, main, name (+7 more)

### Community 47 - "common.validator.js"
Cohesion: 0.11
Nodes (16): guestSearchLimiter, estimateFare(), downloadInvoice(), rateDriver(), validate(), router, router, router (+8 more)

### Community 48 - "so"
Cohesion: 0.10
Nodes (39): aa(), an(), ao(), ba(), Bs(), n(), co(), cs() (+31 more)

### Community 49 - "BookRide.jsx"
Cohesion: 0.05
Nodes (48): BookRide, ConfirmPage, Hero(), ROUTE_TICKER, ROUTE_TICKER, CHENNAI_CENTER, decodePolyline(), mapContainerStyle (+40 more)

### Community 50 - "_onConfigure"
Cohesion: 0.67
Nodes (3): I(), _onConfigure(), _parseConfig()

### Community 51 - "useAuth"
Cohesion: 0.06
Nodes (41): AdminDashboard, AdminLayout, App(), CustomerDashboard, CustomerLayout, DriverDashboard, DriverLayout, DriverLogin (+33 more)

### Community 52 - "update"
Cohesion: 0.15
Nodes (17): _block(), calculate(), concat(), _crypt(), decrypt(), digest(), encrypt(), _f() (+9 more)

### Community 53 - "G"
Cohesion: 0.05
Nodes (61): addMaskedElements(), _captureAutoExpectSnapshot(), clearHighlight(), _commitAssertValue(), _computeAutoExpectPrecondition(), _consumeRightButtonEvent(), _createHighlightElement(), cursor() (+53 more)

### Community 54 - "endpoints.js"
Cohesion: 0.06
Nodes (33): DriverDocuments, DriverRegister, ForgotPassword, Login, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES (+25 more)

### Community 55 - "c"
Cohesion: 0.18
Nodes (10): close(), closestScreenshot(), c(), oa(), serveClosestScreenshot(), ta(), s(), ve() (+2 more)

### Community 56 - "useSocket"
Cohesion: 0.07
Nodes (48): BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerBookings, DriverBookingDetail, AdvancedMarker(), CancelReasonDialog(), DEFAULT_REASONS (+40 more)

### Community 58 - "app.js"
Cohesion: 0.08
Nodes (19): app, configuredOrigins, bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema (+11 more)

### Community 59 - "en"
Cohesion: 0.20
Nodes (11): cn(), dn(), en(), fromBits(), getRandomValues(), h(), K(), ln() (+3 more)

### Community 60 - "k"
Cohesion: 0.12
Nodes (67): Ae(), at(), B(), be(), r(), Ce(), ct(), De() (+59 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "i"
Cohesion: 0.08
Nodes (69): aa(), an(), ao(), ariaSnapshot(), ariaSnapshotForRecorder(), ba(), bc(), cc() (+61 more)

### Community 63 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "review.routes.js"
Cohesion: 0.33
Nodes (5): createReview(), getDriverReviews(), getMyReviews(), router, createReviewSchema

### Community 67 - "pop"
Cohesion: 0.13
Nodes (36): am(), _applyAttribute(), _assert(), atIndentedComment(), blockMap(), blockScalar(), blockSequence(), decorate() (+28 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, preview (+2 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "us"
Cohesion: 0.11
Nodes (37): ai(), as(), ds(), fs(), G(), hn(), hs(), ii() (+29 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverCharts.jsx"
Cohesion: 0.22
Nodes (6): COLORS, DriverCharts, DriverPie, RATE_COLORS, DriverCharts, DriverPie

### Community 74 - "GuestBookingLookup.jsx"
Cohesion: 0.31
Nodes (8): GuestBookingLookup, CANCELLABLE, fmtWhen(), formatCurrency(), GuestBookingLookup(), readLs(), STATUS_STYLE, guestAPI

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 76 - "SEO.jsx"
Cohesion: 0.04
Nodes (107): About, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ContactUs, DriverContinue, GuestBookingPage (+99 more)

### Community 77 - "sw.bundle.js"
Cohesion: 0.06
Nodes (29): actions(), addFrameSnapshot(), _appendEvent(), appendTrace(), B(), _collectSnapshotPhase(), inflate(), inflateEnd() (+21 more)

### Community 78 - "App.jsx"
Cohesion: 0.06
Nodes (66): AdminBookingRequests, AdminNotifications, CustomerReviews, DriverBookings, DriverHistory, DriverNotifications, DriverReviews, DriverWallet (+58 more)

### Community 79 - "auth.middleware.js"
Cohesion: 0.14
Nodes (19): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus(), createVehicle() (+11 more)

### Community 81 - "validate.middleware.js"
Cohesion: 0.12
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 84 - "n"
Cohesion: 0.21
Nodes (46): A(), g(), p(), bt(), C(), i(), u(), D() (+38 more)

### Community 85 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

### Community 87 - "uiMode.CU5KtEkS.js"
Cohesion: 0.06
Nodes (10): m(), ve(), y(), ./assets/xtermModule-DywYcAf8.js, collectTestIds(), fileNames(), flatTreeItems(), L() (+2 more)

### Community 93 - "constructor"
Cohesion: 0.22
Nodes (10): constructor(), Gr(), ht(), f(), l(), m(), _precompute(), _readFile() (+2 more)

### Community 95 - "VehicleSelector.jsx"
Cohesion: 0.31
Nodes (6): cardVariants, containerVariants, formatCurrency(), perKmLabel(), vehicleImageFor(), VehicleSelector()

### Community 97 - "parseDocument"
Cohesion: 0.26
Nodes (24): atLineEnd(), charAt(), continueScalar(), getLine(), hasChars(), lex(), parseBlockScalar(), parseBlockScalarHeader() (+16 more)

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

### Community 100 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 101 - "booking.service.js"
Cohesion: 0.11
Nodes (25): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+17 more)

### Community 102 - "render"
Cohesion: 0.18
Nodes (13): v(), addResource(), ke(), h(), read_byte(), render(), _respondWithJson(), serveSnapshot() (+5 more)

### Community 103 - "get"
Cohesion: 0.19
Nodes (17): c(), n(), Dr(), t(), g(), n(), e(), get() (+9 more)

### Community 104 - "getEntriesGenerator"
Cohesion: 0.18
Nodes (20): aa(), append(), ea(), getData(), getEntries(), getEntriesGenerator(), gt(), i() (+12 more)

### Community 106 - "dispatch"
Cohesion: 0.13
Nodes (15): _createTestResult(), dispatch(), F(), _handleOnError(), _onAttach(), _onBegin(), _onEnd(), _onError() (+7 more)

### Community 108 - "rn"
Cohesion: 0.13
Nodes (20): jn(), an(), bn(), gn(), hn(), Jn(), Kn(), _n() (+12 more)

### Community 109 - "constructor"
Cohesion: 0.21
Nodes (13): _addChild(), allTests(), constructor(), _createReporter(), _defaultDescribeItem(), entries(), _fileItem(), filterTree() (+5 more)

### Community 110 - "init"
Cohesion: 0.38
Nodes (10): Ar(), Fr(), init(), Ir(), jr(), kr(), Mr(), Nr() (+2 more)

### Community 111 - "_absoluteLocation"
Cohesion: 0.27
Nodes (10): _absoluteAnnotationLocationsInplace(), _absoluteLocation(), _addSuite(), _addTest(), _mergeSuiteInto(), _mergeTestInto(), _onStepBegin(), _onTestEnd() (+2 more)

### Community 112 - "generateLocator"
Cohesion: 0.67
Nodes (9): generateLocator(), Jt(), quote(), regexToSourceString(), regexToString(), toCallWithExact(), toHasNotText(), toHasText() (+1 more)

### Community 113 - "_onProject"
Cohesion: 0.40
Nodes (5): _absolutePath(), N(), _onProject(), _parseProject(), project()

### Community 117 - "error-context.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 118 - "feda50cb721f19ae14fb62cd5058fe0647f8a34d.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 120 - "ec"
Cohesion: 0.06
Nodes (57): ae(), ai(), bi(), br(), C(), cf(), ec(), er() (+49 more)

### Community 141 - "nl"
Cohesion: 0.22
Nodes (16): Al(), dl(), fl(), gl(), hl(), kl(), Ml(), nl() (+8 more)

### Community 142 - "n"
Cohesion: 0.05
Nodes (112): ac(), _activeSelectorForEvent(), add(), addIn(), addUserOverlay(), af(), ap(), ariaSnapshotForCall() (+104 more)

## Knowledge Gaps
- **296 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+291 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **30 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `update` to `defaultSettingsView-Ds6CBOo0.js`, `sw.bundle.js`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `at()` connect `a` to `defaultSettingsView-Ds6CBOo0.js`, `n`, `n`, `bu`, `ec`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `booking.service.js` to `admin.service.js`, `driver.service.js`, `redisRateLimiter.js`, `notification.service.js`, `payment.service.js`, `push.service.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `i()` (e.g. with `defaultSettingsView-Ds6CBOo0.js` and `addIn()`) actually correct?**
  _`i()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `n()` (e.g. with `aa()` and `addIn()`) actually correct?**
  _`n()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `t()` (e.g. with `add()` and `ao()`) actually correct?**
  _`t()` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `r()` (e.g. with `A()` and `ac()`) actually correct?**
  _`r()` has 66 INFERRED edges - model-reasoned connections that need verification._