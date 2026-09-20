# Graph Report - Cab Booking App  (2026-09-20)

## Corpus Check
- 311 files · ~3,247,726 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2937 nodes · 9780 edges · 147 communities (120 shown, 27 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 1214 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `db709a78`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- notification.service.js
- va
- defaultSettingsView-Ds6CBOo0.js
- admin.routes.js
- dependencies
- n
- admin.service.js
- devDependencies
- devDependencies
- common.validator.js
- SEO.jsx
- driver.routes.js
- dependencies
- driverUpload.routes.js
- ec
- analytics.js
- a
- booking.routes.js
- socket/index.js
- AdminCharts.jsx
- jest
- Home.jsx
- aiAssistant.service.js
- toString
- InstantCustomers.jsx
- email.service.js
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- favoriteLocation.service.js
- QueryProvider.jsx
- payment.routes.js
- googleMaps.routes.js
- Vehicles.jsx
- backend/package.json
- auth.middleware.js
- so
- ConfirmPage.jsx
- _onConfigure
- AutoPushSync.jsx
- mr
- G
- App.jsx
- ioredis
- CurrentRideCustomer.jsx
- app.js
- images/index.js
- k
- theme.js
- ic
- axios
- Testiminols.jsx
- api.js
- framer-motion
- pop
- frontend/package.json
- whatsapp.service.js
- codeMirrorModule-BbkfBe3n.js
- StructuredData.js
- playwright
- useAuth
- push.service.js
- ride-flow.spec.js
- breadcrumbJsonLd
- sw.bundle.js
- Skeleton.jsx
- user.routes.js
- tailwindcss
- setScreencastAnnotation
- live-location.spec.js
- matches
- n
- refresh-sitemap.mjs
- StickyMobileCTA.jsx
- uiMode.CU5KtEkS.js
- vercel.json
- webhook.controller.js
- constructor
- useSocket
- BookRide.jsx
- onContextMenu
- parseDocument
- devDependencies
- googleMaps.service.js
- notification.routes.js
- booking.service.js
- ya
- get
- getEntriesGenerator
- load
- dispatch
- scripts
- rn
- constructor
- init
- _absoluteLocation
- generateLocator
- _onProject
- $e
- DriverCharts.jsx
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- moduleFileExtensions
- ja
- express
- express-validator
- socket.io-client
- react-dom
- LocationPicker.jsx
- nodemailer
- socket.io
- mongoose
- zod
- morgan
- @socket.io/redis-adapter
- onClick
- onMouseMove
- endpoints.js
- payment.service.js
- @react-google-maps/api
- react
- react-icons
- recharts
- @tanstack/react-query
- i
- g
- ve
- _updateVisualPosition
- AIAssistant.jsx
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
- `RideHistory()` --calls--> `useSocket()`  [EXTRACTED]
  frontend/src/Pages/customer/RideHistory.jsx → frontend/src/Context/SocketContext.jsx
- `InfoDetail()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  frontend/src/Pages/InfoDetail/InfoDetail.jsx → frontend/src/utils/StructuredData.js
- `ManageCustomers()` --calls--> `useDebounce()`  [EXTRACTED]
  frontend/src/Pages/admin/ManageCustomers.jsx → frontend/src/hooks/useDebounce.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (147 total, 27 thin omitted)

### Community 0 - "notification.service.js"
Cohesion: 0.10
Nodes (24): notificationSchema, getAvailableBookings(), acceptBooking(), dispatchBooking(), findEligibleDrivers(), getCurrentDriver(), handleDriverTimeout(), rejectBooking() (+16 more)

### Community 1 - "va"
Cohesion: 0.11
Nodes (23): bi(), br(), _createVisibleEngine(), enter(), fr(), lr(), Ma(), oa() (+15 more)

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (162): _activelyFocused(), ar(), ariaSnapshotForCall(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure(), ariaSnapshotJSON(), atDocument(), be() (+154 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.08
Nodes (48): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+40 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+23 more)

### Community 5 - "n"
Cohesion: 0.06
Nodes (90): ac(), add(), addIn(), addUserOverlay(), ariaSnapshot(), ariaSnapshotForRecorder(), as(), b() (+82 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (18): invalidateCache(), memGet(), memSet(), withCache(), reviewSchema, withdrawalRequestSchema, assignDriver(), cancelBooking() (+10 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "common.validator.js"
Cohesion: 0.10
Nodes (21): createLocation(), deleteLocation(), getLocations(), updateLocation(), rateDriver(), createVehicle(), deleteVehicle(), getVehicles() (+13 more)

### Community 10 - "SEO.jsx"
Cohesion: 0.18
Nodes (12): NotFound, getOrigin(), normalizePath(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), FAQS (+4 more)

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): dompurify, dependencies, dompurify, lucide-react, @mantine/core, @mantine/hooks, react-hook-form, react-hot-toast (+11 more)

### Community 13 - "driverUpload.routes.js"
Cohesion: 0.12
Nodes (15): uploadDriverDocumentFile(), uploadVehicleImages(), uploadProfileImage(), allowedMimeTypes, storage, upload, uploadSingle(), router (+7 more)

### Community 14 - "ec"
Cohesion: 0.09
Nodes (32): ba(), Bs(), n(), dt(), ea(), ec(), gs(), n() (+24 more)

### Community 15 - "analytics.js"
Cohesion: 0.54
Nodes (5): CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent()

### Community 16 - "a"
Cohesion: 0.12
Nodes (68): A(), ae(), ap(), at(), b(), c(), g(), o() (+60 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.16
Nodes (26): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+18 more)

### Community 18 - "socket/index.js"
Cohesion: 0.11
Nodes (19): connectDB(), fixBookingAlertIndexes(), closeRedis(), memCache, memCacheExpiry, envValidator(), requestTimeout(), sanitizeInput() (+11 more)

### Community 19 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "Home.jsx"
Cohesion: 0.09
Nodes (23): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, cardHover, PopularRoutes() (+15 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.10
Nodes (31): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+23 more)

### Community 23 - "toString"
Cohesion: 0.07
Nodes (70): ad(), bd(), cd(), cm(), createNode(), createPair(), Cu(), dd() (+62 more)

### Community 24 - "InstantCustomers.jsx"
Cohesion: 0.09
Nodes (41): BookingDetailsPage, CustomerBookings, AssignDriverDialog(), CancelReasonDialog(), DEFAULT_REASONS, GlassTable(), Modal(), formatTime() (+33 more)

### Community 26 - "email.service.js"
Cohesion: 0.15
Nodes (18): emailLogSchema, buildBookingEmailHtml(), buildBookingEmailText(), combineNameAddress(), formatDateTime(), getAdminRecipients(), getBookingEmailFields(), getConfig() (+10 more)

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

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.08
Nodes (31): getRedisClient(), isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+23 more)

### Community 44 - "Vehicles.jsx"
Cohesion: 0.40
Nodes (4): AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "auth.middleware.js"
Cohesion: 0.09
Nodes (26): acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus(), downloadInvoice() (+18 more)

### Community 48 - "so"
Cohesion: 0.11
Nodes (36): aa(), an(), ao(), co(), cs(), Do(), eo(), fa() (+28 more)

### Community 49 - "ConfirmPage.jsx"
Cohesion: 0.16
Nodes (17): Footer(), Navbar(), FareNotes(), NOTES, CarTypePage(), imageFor(), ConfirmPage(), fmtWhen() (+9 more)

### Community 50 - "_onConfigure"
Cohesion: 0.67
Nodes (3): I(), _onConfigure(), _parseConfig()

### Community 51 - "AutoPushSync.jsx"
Cohesion: 0.15
Nodes (27): AdminLayout, CustomerLayout, AutoPushSync(), bookingIdOf(), detailsUrlFor(), PushListener(), routeSummary(), PushToggle() (+19 more)

### Community 52 - "mr"
Cohesion: 0.14
Nodes (28): ar(), cr(), Dr(), fr(), ir(), is(), jr(), kr() (+20 more)

### Community 53 - "G"
Cohesion: 0.36
Nodes (12): _consumeRightButtonEvent(), G(), _ignoreOverlayEvent(), onDblClick(), onKeyUp(), onMouseDown(), onMouseEnter(), onMouseLeave() (+4 more)

### Community 54 - "App.jsx"
Cohesion: 0.04
Nodes (42): About, AdminBookingRequests, AdminDashboard, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage (+34 more)

### Community 56 - "CurrentRideCustomer.jsx"
Cohesion: 0.17
Nodes (13): CurrentRideCustomer, AdvancedMarker(), formatElapsed(), getRideTimeInfo(), toMs(), useRideTime(), CurrentRideCustomer(), decodePolyline() (+5 more)

### Community 58 - "app.js"
Cohesion: 0.08
Nodes (17): app, configuredOrigins, bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema (+9 more)

### Community 59 - "images/index.js"
Cohesion: 0.11
Nodes (12): Hero(), ROUTE_TICKER, ROUTE_TICKER, CHENNAI_AIRPORT, DateTimeField(), GuestBookingForm(), mantineInputStyles, pad() (+4 more)

### Community 60 - "k"
Cohesion: 0.13
Nodes (59): Ae(), at(), B(), be(), Ce(), ct(), De(), ee() (+51 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "ic"
Cohesion: 0.06
Nodes (71): aa(), af(), ao(), appendChild(), bc(), C(), cc(), cf() (+63 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 67 - "pop"
Cohesion: 0.11
Nodes (40): am(), _applyAttribute(), _assert(), atIndentedComment(), blockMap(), blockScalar(), blockSequence(), compose() (+32 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, preview (+2 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "codeMirrorModule-BbkfBe3n.js"
Cohesion: 0.06
Nodes (81): ac(), ai(), as(), bi(), Bn(), br(), ca(), cc() (+73 more)

### Community 71 - "StructuredData.js"
Cohesion: 0.18
Nodes (8): features, pillars, stats, values, businessJsonLd, organizationJsonLd, PRODUCTION_ORIGIN, webSiteJsonLd

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "useAuth"
Cohesion: 0.06
Nodes (45): AdminProfile, App(), DriverContinue, DriverLayout, DriverLogin, DriverProfilePage, Profile, DASHBOARD_ROUTES (+37 more)

### Community 74 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 76 - "breadcrumbJsonLd"
Cohesion: 0.11
Nodes (31): PageHero(), GlowBlobs(), Reveal(), SectionHeading(), ROUTES, About(), AirportDetail(), AIRPORTS (+23 more)

### Community 77 - "sw.bundle.js"
Cohesion: 0.05
Nodes (34): v(), addFrameSnapshot(), addResource(), B(), calculate(), _collectSnapshotPhase(), concat(), _crypt() (+26 more)

### Community 78 - "Skeleton.jsx"
Cohesion: 0.07
Nodes (36): DriverHistory, DriverNotifications, DriverReviews, FavoriteLocations, Payments, RideHistory, Badge(), ConfirmDialog() (+28 more)

### Community 79 - "user.routes.js"
Cohesion: 0.12
Nodes (10): getRideHistory(), changePassword(), getAllUsers(), updateProfile(), validateQuery(), router, router, paginationQuerySchema (+2 more)

### Community 81 - "setScreencastAnnotation"
Cohesion: 0.12
Nodes (20): addMaskedElements(), clearHighlight(), _createHighlightElement(), _ensureElementHighlightRaf(), _ensureHighlight(), getUserOverlay(), hideActionCursor(), hideActionPoint() (+12 more)

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 83 - "matches"
Cohesion: 0.26
Nodes (18): begin(), _cached(), _callMatches(), _callQuery(), _checkSelector(), _expandContextForScopeMatching(), _getEngine(), _hasScopeClause() (+10 more)

### Community 84 - "n"
Cohesion: 0.21
Nodes (49): A(), g(), p(), bt(), C(), i(), r(), u() (+41 more)

### Community 85 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

### Community 87 - "uiMode.CU5KtEkS.js"
Cohesion: 0.06
Nodes (10): m(), ve(), y(), ./assets/xtermModule-DywYcAf8.js, collectTestIds(), fileNames(), flatTreeItems(), L() (+2 more)

### Community 90 - "webhook.controller.js"
Cohesion: 0.39
Nodes (7): checkIdempotency(), handlePaymentCaptured(), handlePaymentFailed(), handleRazorpayWebhook(), handleRefundCreated(), verifyWebhookSignature(), router

### Community 93 - "constructor"
Cohesion: 0.15
Nodes (18): _block(), close(), constructor(), c(), digest(), en(), _f(), finalize() (+10 more)

### Community 94 - "useSocket"
Cohesion: 0.20
Nodes (11): AdminNotifications, Notifications, SessionResume(), useSocket(), AdminDashboard(), AdminNotifications(), bookingIdOf(), ManageDrivers() (+3 more)

### Community 95 - "BookRide.jsx"
Cohesion: 0.09
Nodes (30): BookRide, CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), cardVariants, containerVariants (+22 more)

### Community 96 - "onContextMenu"
Cohesion: 0.20
Nodes (14): _activeSelectorForEvent(), _captureAutoExpectSnapshot(), _computeAutoExpectPrecondition(), firstTooltipBox(), _isEditable(), onContextMenu(), onInput(), onKeyDown() (+6 more)

### Community 97 - "parseDocument"
Cohesion: 0.26
Nodes (24): atLineEnd(), charAt(), continueScalar(), getLine(), hasChars(), lex(), parseBlockScalar(), parseBlockScalarHeader() (+16 more)

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

### Community 99 - "googleMaps.service.js"
Cohesion: 0.25
Nodes (6): estimateFare(), calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 100 - "notification.routes.js"
Cohesion: 0.33
Nodes (9): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+1 more)

### Community 101 - "booking.service.js"
Cohesion: 0.12
Nodes (24): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+16 more)

### Community 102 - "ya"
Cohesion: 0.11
Nodes (22): _a(), ba(), Ca(), closestScreenshot(), ga(), ha(), hasEntry(), render() (+14 more)

### Community 103 - "get"
Cohesion: 0.14
Nodes (22): c(), cn(), n(), Dr(), t(), g(), n(), e() (+14 more)

### Community 104 - "getEntriesGenerator"
Cohesion: 0.18
Nodes (20): aa(), append(), ea(), getData(), getEntries(), getEntriesGenerator(), gt(), i() (+12 more)

### Community 105 - "load"
Cohesion: 0.20
Nodes (10): actions(), _appendEvent(), appendTrace(), _innerAppendEvent(), isLive(), load(), _modernize(), ne() (+2 more)

### Community 106 - "dispatch"
Cohesion: 0.13
Nodes (15): _createTestResult(), dispatch(), F(), _handleOnError(), _onAttach(), _onBegin(), _onEnd(), _onError() (+7 more)

### Community 107 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

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

### Community 115 - "$e"
Cohesion: 0.29
Nodes (8): $e(), inflate(), inflateEnd(), inflateInit(), ke(), h(), read_byte(), tt()

### Community 116 - "DriverCharts.jsx"
Cohesion: 0.22
Nodes (6): COLORS, DriverCharts, DriverPie, RATE_COLORS, DriverCharts, DriverPie

### Community 117 - "error-context.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 118 - "feda50cb721f19ae14fb62cd5058fe0647f8a34d.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 119 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 120 - "ja"
Cohesion: 0.16
Nodes (19): ai(), an(), ba(), ci(), describeIFrameStyle(), es(), fs(), ja() (+11 more)

### Community 125 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 132 - "onClick"
Cohesion: 0.25
Nodes (9): _commitAssertValue(), _elementHasValue(), firstBox(), _generateAction(), onClick(), _renderValue(), _showDialog(), _showTextDialog() (+1 more)

### Community 133 - "onMouseMove"
Cohesion: 0.28
Nodes (9): generateSelector(), _installObserverIfNeeded(), _modelForElement(), onFocus(), onMouseMove(), onScroll(), _reset(), _resetHoveredModel() (+1 more)

### Community 134 - "endpoints.js"
Cohesion: 0.08
Nodes (23): DriverDocuments, DriverRegister, Login, OtpVerification, ResetPassword, AUTH_SLIDES, AuthSplit(), getAuthErrorMessage() (+15 more)

### Community 141 - "i"
Cohesion: 0.11
Nodes (43): Al(), bl(), _createInternalHasNotTextEngine(), _createInternalHasTextEngine(), _createInternalLabelEngine(), _createTestIdEngine(), _createTextEngine(), dl() (+35 more)

### Community 142 - "g"
Cohesion: 0.13
Nodes (26): bp(), cp(), ct(), D(), dp(), Fp(), from(), getObject() (+18 more)

### Community 143 - "ve"
Cohesion: 0.29
Nodes (6): oa(), ta(), s(), ve(), s(), pe()

### Community 144 - "_updateVisualPosition"
Cohesion: 0.40
Nodes (6): cursor(), _hideOverlay(), setUIState(), _showOverlay(), _switchCurrentTool(), _updateVisualPosition()

### Community 145 - "AIAssistant.jsx"
Cohesion: 0.50
Nodes (4): AIAssistant(), formatReply(), SUGGESTED_PROMPTS, aiAPI

## Knowledge Gaps
- **293 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+288 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `constructor` to `defaultSettingsView-Ds6CBOo0.js`, `sw.bundle.js`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `rn()` connect `rn` to `defaultSettingsView-Ds6CBOo0.js`, `codeMirrorModule-BbkfBe3n.js`, `get`, `getEntriesGenerator`, `sw.bundle.js`, `ve`, `k`, `constructor`, `ic`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `Ut()` connect `ic` to `defaultSettingsView-Ds6CBOo0.js`, `rn`, `i`, `so`, `toString`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `i()` (e.g. with `defaultSettingsView-Ds6CBOo0.js` and `addIn()`) actually correct?**
  _`i()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `n()` (e.g. with `aa()` and `addIn()`) actually correct?**
  _`n()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `t()` (e.g. with `add()` and `ao()`) actually correct?**
  _`t()` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `r()` (e.g. with `A()` and `ac()`) actually correct?**
  _`r()` has 66 INFERRED edges - model-reasoned connections that need verification._