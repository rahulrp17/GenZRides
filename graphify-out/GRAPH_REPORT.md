# Graph Report - Cab Booking App  (2026-09-20)

## Corpus Check
- 313 files · ~3,253,255 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2955 nodes · 9828 edges · 132 communities (105 shown, 27 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 1216 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `99edc728`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AdminNotifications.jsx
- breadcrumbJsonLd
- defaultSettingsView-Ds6CBOo0.js
- admin.routes.js
- dependencies
- get
- admin.service.js
- devDependencies
- devDependencies
- favoriteLocation.routes.js
- us
- driver.routes.js
- dependencies
- StructuredData.js
- LocationPicker.jsx
- analytics.js
- a
- booking.routes.js
- socket/index.js
- endpoints.js
- jest
- Home.jsx
- aiAssistant.service.js
- bu
- AdminCharts.jsx
- $e
- React + Vite
- email.service.js
- AGENTS.md
- driver.service.js
- favoriteLocation.service.js
- QueryProvider.jsx
- payment.routes.js
- googleMaps.routes.js
- Vehicles.jsx
- backend/package.json
- invoice.service.js
- n
- ConfirmPage.jsx
- _onConfigure
- useAuth
- update
- G
- App.jsx
- TariffChart.jsx
- useSocket
- app.js
- images/index.js
- k
- theme.js
- i
- _onTestBegin
- Testiminols.jsx
- api.js
- framer-motion
- pop
- frontend/package.json
- whatsapp.service.js
- codeMirrorModule-BbkfBe3n.js
- playwright
- DriverDashboard.jsx
- ride-flow.spec.js
- Reveal.jsx
- sw.bundle.js
- InstantCustomers.jsx
- auth.middleware.js
- tailwindcss
- live-location.spec.js
- express-rate-limit
- J
- refresh-sitemap.mjs
- StickyMobileCTA.jsx
- uiMode.CU5KtEkS.js
- vercel.json
- lucide-react
- constructor
- BookRide.jsx
- parseDocument
- devDependencies
- notification.routes.js
- booking.service.js
- ya
- get
- getEntriesGenerator
- dispatch
- scripts
- vn
- constructor
- r
- _absoluteLocation
- generateLocator
- _onProject
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- moduleFileExtensions
- C
- express
- express-validator
- socket.io-client
- react-dom
- nodemailer
- socket.io
- mongoose
- zod
- morgan
- @socket.io/redis-adapter
- SEO.jsx
- @react-google-maps/api
- react
- react-icons
- recharts
- @tanstack/react-query
- el
- t
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
- `About()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  frontend/src/Pages/AboutUs/About.jsx → frontend/src/utils/StructuredData.js
- `AirportDetail()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  frontend/src/Pages/AirportDetail/AirportDetail.jsx → frontend/src/utils/StructuredData.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (132 total, 27 thin omitted)

### Community 0 - "AdminNotifications.jsx"
Cohesion: 0.19
Nodes (22): AdminNotifications, DriverNotifications, Notifications, AutoPushSync(), PushToggle(), AdminNotifications(), bookingIdOf(), bookingIdOf() (+14 more)

### Community 1 - "breadcrumbJsonLd"
Cohesion: 0.13
Nodes (19): ContactUs, GuestBookingPage, Info, InfoDetail, PageHero(), ContactUs(), FAQS, GuestBookingPage() (+11 more)

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (185): _activelyFocused(), addMaskedElements(), addUserOverlay(), an(), appendChild(), ar(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure() (+177 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (55): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+47 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+23 more)

### Community 5 - "get"
Cohesion: 0.10
Nodes (33): add(), addIn(), Bf(), Bo(), createRelativeUrl(), delete(), deleteIn(), dn() (+25 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (19): invalidateCache(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), reviewSchema, withdrawalRequestSchema (+11 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 10 - "us"
Cohesion: 0.11
Nodes (40): ai(), as(), ds(), fs(), G(), gs(), hn(), hs() (+32 more)

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): dompurify, dependencies, axios, dompurify, @mantine/core, @mantine/hooks, react-hook-form, react-hot-toast (+11 more)

### Community 13 - "StructuredData.js"
Cohesion: 0.15
Nodes (10): About, About(), features, pillars, stats, values, businessJsonLd, organizationJsonLd (+2 more)

### Community 14 - "LocationPicker.jsx"
Cohesion: 0.42
Nodes (7): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces()

### Community 15 - "analytics.js"
Cohesion: 0.54
Nodes (5): CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent()

### Community 16 - "a"
Cohesion: 0.08
Nodes (89): A(), aa(), ap(), at(), b(), c(), g(), o() (+81 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.08
Nodes (43): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+35 more)

### Community 18 - "socket/index.js"
Cohesion: 0.09
Nodes (22): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+14 more)

### Community 19 - "endpoints.js"
Cohesion: 0.08
Nodes (34): AdminProfile, DriverDocuments, DriverProfilePage, DriverRegister, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal() (+26 more)

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "Home.jsx"
Cohesion: 0.09
Nodes (23): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, PopularRoutes(), SERVICES (+15 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.10
Nodes (31): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+23 more)

### Community 23 - "bu"
Cohesion: 0.08
Nodes (67): ad(), Au(), bd(), bu(), cd(), ci(), clone(), createNode() (+59 more)

### Community 24 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 26 - "$e"
Cohesion: 0.29
Nodes (8): $e(), inflate(), inflateEnd(), inflateInit(), ke(), h(), read_byte(), tt()

### Community 28 - "email.service.js"
Cohesion: 0.06
Nodes (55): forgotPassword(), getProfile(), login(), logout(), logoutAll(), refreshToken(), register(), registerDriver() (+47 more)

### Community 39 - "driver.service.js"
Cohesion: 0.10
Nodes (11): walletTransactionSchema, createDriverProfile(), getDriverDashboard(), getDriverEarnings(), getDriverStatistics(), getWalletSummary(), getWalletTransactions(), getDriverPeriodEarnings() (+3 more)

### Community 40 - "favoriteLocation.service.js"
Cohesion: 0.28
Nodes (4): favoriteLocationSchema, createLocation(), toGeoJSON(), updateLocation()

### Community 42 - "payment.routes.js"
Cohesion: 0.14
Nodes (9): razorpay, createOrder(), getPaymentById(), getPaymentHistory(), refundPayment(), verifyPayment(), router, createOrderSchema (+1 more)

### Community 43 - "googleMaps.routes.js"
Cohesion: 0.07
Nodes (37): getRedisClient(), isRedisConnected(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter (+29 more)

### Community 44 - "Vehicles.jsx"
Cohesion: 0.33
Nodes (5): AttachVehicle, AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 48 - "n"
Cohesion: 0.07
Nodes (58): aa(), an(), ao(), ba(), Bs(), n(), ca(), r() (+50 more)

### Community 49 - "ConfirmPage.jsx"
Cohesion: 0.07
Nodes (36): CarTypePage, ConfirmPage, GuestBookingLookup, Footer(), ROUTE_TICKER, DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES (+28 more)

### Community 50 - "_onConfigure"
Cohesion: 0.67
Nodes (3): I(), _onConfigure(), _parseConfig()

### Community 51 - "useAuth"
Cohesion: 0.10
Nodes (28): DriverContinue, DriverLogin, DriverLocationSharer(), movedMeters(), ProtectedRoute(), bookingIdOf(), detailsUrlFor(), PushListener() (+20 more)

### Community 52 - "update"
Cohesion: 0.15
Nodes (17): _block(), calculate(), concat(), _crypt(), decrypt(), digest(), encrypt(), _f() (+9 more)

### Community 53 - "G"
Cohesion: 0.10
Nodes (42): _activeSelectorForEvent(), ariaSnapshot(), ariaSnapshotForRecorder(), ariaSnapshotJSON(), _commit(), _commitAssertValue(), _consumeRightButtonEvent(), _elementHasValue() (+34 more)

### Community 54 - "App.jsx"
Cohesion: 0.04
Nodes (48): AdminBookingRequests, AdminLayout, App(), BookingDetailsPage, CustomerBookings, CustomerLayout, CustomerReviews, DriverBookingDetail (+40 more)

### Community 55 - "TariffChart.jsx"
Cohesion: 0.33
Nodes (6): TariffChart, imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 56 - "useSocket"
Cohesion: 0.09
Nodes (39): CurrentRide, CurrentRideCustomer, AdvancedMarker(), formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo() (+31 more)

### Community 58 - "app.js"
Cohesion: 0.07
Nodes (19): app, configuredOrigins, bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema (+11 more)

### Community 60 - "k"
Cohesion: 0.14
Nodes (57): Ae(), at(), B(), be(), Ce(), ct(), De(), ee() (+49 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "i"
Cohesion: 0.06
Nodes (97): ac(), af(), ao(), as(), b(), ba(), bc(), cc() (+89 more)

### Community 63 - "_onTestBegin"
Cohesion: 0.67
Nodes (3): _createTestResult(), _onTestBegin(), setStartTimeNumber()

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 67 - "pop"
Cohesion: 0.13
Nodes (36): am(), _applyAttribute(), _assert(), atIndentedComment(), blockMap(), blockScalar(), blockSequence(), decorate() (+28 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, preview (+2 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "codeMirrorModule-BbkfBe3n.js"
Cohesion: 0.06
Nodes (82): ar(), bi(), Bn(), br(), ci(), cn(), cr(), di() (+74 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverDashboard.jsx"
Cohesion: 0.09
Nodes (17): AdminDashboard, CustomerDashboard, DriverDashboard, Earnings, COLORS, DriverCharts, DriverPie, RATE_COLORS (+9 more)

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 76 - "Reveal.jsx"
Cohesion: 0.12
Nodes (25): AirportDetail, AirportTransfers, PopularRoutes, RouteDetail, Services, cardHover, GlowBlobs(), Reveal() (+17 more)

### Community 77 - "sw.bundle.js"
Cohesion: 0.06
Nodes (31): actions(), addFrameSnapshot(), _appendEvent(), appendTrace(), B(), _collectSnapshotPhase(), hasEntry(), _innerAppendEvent() (+23 more)

### Community 78 - "InstantCustomers.jsx"
Cohesion: 0.09
Nodes (39): DriverReviews, AssignDriverDialog(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), ErrorState() (+31 more)

### Community 79 - "auth.middleware.js"
Cohesion: 0.05
Nodes (55): guestSearchLimiter, acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus() (+47 more)

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 84 - "J"
Cohesion: 0.18
Nodes (49): A(), ac(), g(), p(), bt(), C(), i(), cc() (+41 more)

### Community 85 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

### Community 87 - "uiMode.CU5KtEkS.js"
Cohesion: 0.06
Nodes (12): be(), $f(), m(), ve(), y(), ./assets/xtermModule-DywYcAf8.js, collectTestIds(), fileNames() (+4 more)

### Community 93 - "constructor"
Cohesion: 0.08
Nodes (30): an(), close(), cn(), constructor(), c(), dn(), en(), fromBits() (+22 more)

### Community 95 - "BookRide.jsx"
Cohesion: 0.09
Nodes (30): BookRide, CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), cardVariants, containerVariants (+22 more)

### Community 97 - "parseDocument"
Cohesion: 0.26
Nodes (24): atLineEnd(), charAt(), continueScalar(), getLine(), hasChars(), lex(), parseBlockScalar(), parseBlockScalarHeader() (+16 more)

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

### Community 100 - "notification.routes.js"
Cohesion: 0.15
Nodes (14): deleteNotification(), getNotifications(), getUnreadCount(), getVapidPublicKey(), markAllAsRead(), markAsRead(), removePushSubscription(), savePushSubscription() (+6 more)

### Community 101 - "booking.service.js"
Cohesion: 0.08
Nodes (37): supportsTransactions(), withTransaction(), assignDriver(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking() (+29 more)

### Community 102 - "ya"
Cohesion: 0.11
Nodes (21): v(), _a(), addResource(), ba(), Ca(), closestScreenshot(), ga(), ha() (+13 more)

### Community 103 - "get"
Cohesion: 0.16
Nodes (20): c(), n(), Dr(), t(), g(), n(), e(), get() (+12 more)

### Community 104 - "getEntriesGenerator"
Cohesion: 0.20
Nodes (19): aa(), ea(), getData(), getEntries(), getEntriesGenerator(), gt(), i(), ia() (+11 more)

### Community 106 - "dispatch"
Cohesion: 0.17
Nodes (12): dispatch(), F(), _handleOnError(), _onAttach(), _onBegin(), _onEnd(), _onError(), _onExit() (+4 more)

### Community 107 - "scripts"
Cohesion: 0.40
Nodes (5): scripts, dev, start, test, test:ci

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

### Community 113 - "_onProject"
Cohesion: 0.40
Nodes (5): _absolutePath(), N(), _onProject(), _parseProject(), project()

### Community 117 - "error-context.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 118 - "feda50cb721f19ae14fb62cd5058fe0647f8a34d.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 119 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 120 - "C"
Cohesion: 0.10
Nodes (40): ai(), begin(), C(), _cached(), _callMatches(), _callQuery(), _checkSelector(), end() (+32 more)

### Community 134 - "SEO.jsx"
Cohesion: 0.22
Nodes (11): NotFound, WaitingPage, getOrigin(), normalizePath(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta() (+3 more)

### Community 141 - "el"
Cohesion: 0.13
Nodes (33): Al(), bl(), dl(), el(), eo(), evaluate(), fl(), gl() (+25 more)

### Community 142 - "t"
Cohesion: 0.05
Nodes (74): ariaSnapshotForCall(), bm(), bp(), br(), bs(), bt(), t(), cp() (+66 more)

## Knowledge Gaps
- **295 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+290 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `update` to `defaultSettingsView-Ds6CBOo0.js`, `sw.bundle.js`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `at()` connect `a` to `defaultSettingsView-Ds6CBOo0.js`, `el`, `t`, `J`, `bu`, `C`, `i`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `notifyUser()` connect `booking.service.js` to `notification.routes.js`, `admin.service.js`, `driver.service.js`, `payment.routes.js`, `googleMaps.routes.js`, `booking.routes.js`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `i()` (e.g. with `defaultSettingsView-Ds6CBOo0.js` and `addIn()`) actually correct?**
  _`i()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `n()` (e.g. with `aa()` and `addIn()`) actually correct?**
  _`n()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `t()` (e.g. with `add()` and `ao()`) actually correct?**
  _`t()` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `r()` (e.g. with `A()` and `ac()`) actually correct?**
  _`r()` has 66 INFERRED edges - model-reasoned connections that need verification._