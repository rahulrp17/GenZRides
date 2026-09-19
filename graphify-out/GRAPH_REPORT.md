# Graph Report - Cab Booking App  (2026-09-19)

## Corpus Check
- 311 files · ~3,217,915 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2925 nodes · 9740 edges · 132 communities (106 shown, 26 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 1213 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `585aa51c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- notification.service.js
- wd
- defaultSettingsView-Ds6CBOo0.js
- admin.routes.js
- dependencies
- tl
- admin.service.js
- devDependencies
- devDependencies
- server.js
- C
- driver.routes.js
- dependencies
- driverUpload.service.js
- ec
- analytics.js
- a
- booking.routes.js
- favoriteLocation.routes.js
- AdminNotifications.jsx
- jest
- Home.jsx
- aiAssistant.service.js
- ec
- useSocket
- DriverProfilePage.jsx
- React + Vite
- email.service.js
- AGENTS.md
- driver.service.js
- favoriteLocation.service.js
- QueryProvider.jsx
- payment.routes.js
- googleMaps.routes.js
- e
- backend/package.json
- auth.middleware.js
- codeMirrorModule-BbkfBe3n.js
- ConfirmPage.jsx
- invoice.service.js
- useAuth
- RouteServices.jsx
- G
- App.jsx
- express-rate-limit
- CurrentRideCustomer.jsx
- app.js
- images/index.js
- k
- theme.js
- i
- axios
- Testiminols.jsx
- api.js
- pop
- frontend/package.json
- whatsapp.service.js
- t
- StructuredData.js
- playwright
- DriverDashboard.jsx
- push.service.js
- ride-flow.spec.js
- breadcrumbJsonLd
- sw.bundle.js
- Skeleton.jsx
- endpoints.js
- tailwindcss
- live-location.spec.js
- SEO.jsx
- n
- refresh-sitemap.mjs
- StickyMobileCTA.jsx
- uiMode.CU5KtEkS.js
- vercel.json
- redisRateLimiter.js
- constructor
- BookRide.jsx
- @mantine/dates
- parseDocument
- devDependencies
- InstantCustomers.jsx
- booking.service.js
- ya
- get
- getEntriesGenerator
- update
- dispatch
- scripts
- vn
- constructor
- r
- _absoluteLocation
- generateLocator
- _onProject
- $e
- lucide-react
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- moduleFileExtensions
- _onConfigure
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
- @react-google-maps/api
- react
- react-icons
- recharts
- @tanstack/react-query

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
- `AdminProfile()` --calls--> `useAuth()`  [EXTRACTED]
  frontend/src/Pages/admin/AdminProfile.jsx → frontend/src/hooks/useAuth.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (132 total, 26 thin omitted)

### Community 0 - "notification.service.js"
Cohesion: 0.07
Nodes (34): notificationSchema, assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findEligibleDrivers(), getCurrentDriver(), handleDriverTimeout() (+26 more)

### Community 1 - "wd"
Cohesion: 0.06
Nodes (42): ar(), ariaSnapshotForCall(), bm(), bn(), br(), bt(), createRelativeUrl(), Dr() (+34 more)

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (191): aa(), _activelyFocused(), addMaskedElements(), addUserOverlay(), an(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure(), atDocument() (+183 more)

### Community 3 - "admin.routes.js"
Cohesion: 0.06
Nodes (54): approveDriver(), approveWithdrawal(), assignDriver(), blockCustomer(), blockDriver(), cancelBooking(), completeBooking(), createVehicle() (+46 more)

### Community 4 - "dependencies"
Cohesion: 0.06
Nodes (31): dependencies, axios, bcryptjs, cloudinary, compression, connect-redis, cookie-parser, cors (+23 more)

### Community 5 - "tl"
Cohesion: 0.12
Nodes (31): Al(), bl(), _createTestIdEngine(), dl(), evaluate(), gl(), hl(), jl() (+23 more)

### Community 6 - "admin.service.js"
Cohesion: 0.05
Nodes (19): invalidateCache(), memCache, memCacheExpiry, memGet(), memSet(), withCache(), reviewSchema, withdrawalRequestSchema (+11 more)

### Community 7 - "devDependencies"
Cohesion: 0.11
Nodes (19): @babel/core, babel-jest, @babel/preset-env, devDependencies, @babel/core, babel-jest, @babel/preset-env, cross-env (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.10
Nodes (21): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks (+13 more)

### Community 9 - "server.js"
Cohesion: 0.23
Nodes (9): connectDB(), fixBookingAlertIndexes(), closeRedis(), envValidator(), requestTimeout(), sanitizeInput(), gracefulShutdown(), io (+1 more)

### Community 10 - "C"
Cohesion: 0.13
Nodes (30): begin(), C(), _cached(), _callMatches(), _callQuery(), _checkSelector(), D(), decorate() (+22 more)

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): dompurify, framer-motion, dependencies, dompurify, framer-motion, @mantine/core, @mantine/hooks, react-hook-form (+11 more)

### Community 13 - "driverUpload.service.js"
Cohesion: 0.47
Nodes (3): uploadImage(), uploadProfileImage(), uploadVehicleImage()

### Community 14 - "ec"
Cohesion: 0.08
Nodes (60): ai(), as(), bi(), di(), ds(), ec(), fi(), fs() (+52 more)

### Community 15 - "analytics.js"
Cohesion: 0.54
Nodes (5): CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent()

### Community 16 - "a"
Cohesion: 0.09
Nodes (93): A(), ae(), ap(), at(), b(), c(), g(), o() (+85 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.16
Nodes (26): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+18 more)

### Community 18 - "favoriteLocation.routes.js"
Cohesion: 0.29
Nodes (7): createLocation(), deleteLocation(), getLocations(), updateLocation(), router, createLocationSchema, updateLocationSchema

### Community 19 - "AdminNotifications.jsx"
Cohesion: 0.19
Nodes (22): AdminNotifications, DriverNotifications, Notifications, AutoPushSync(), PushToggle(), AdminNotifications(), bookingIdOf(), bookingIdOf() (+14 more)

### Community 20 - "jest"
Cohesion: 0.12
Nodes (16): jest, collectCoverageFrom, coverageDirectory, setupFiles, testEnvironment, testMatch, transform, transformIgnorePatterns (+8 more)

### Community 21 - "Home.jsx"
Cohesion: 0.07
Nodes (25): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, Hero(), ROUTE_TICKER (+17 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.10
Nodes (31): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+23 more)

### Community 23 - "ec"
Cohesion: 0.06
Nodes (76): ad(), ai(), bd(), cd(), ci(), createNode(), createPair(), ct() (+68 more)

### Community 24 - "useSocket"
Cohesion: 0.13
Nodes (25): BookingDetailsPage, CustomerBookings, DriverBookingDetail, cardVariants, containerVariants, formatCurrency(), vehicleImageFor(), VehicleSelector() (+17 more)

### Community 26 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

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
Cohesion: 0.10
Nodes (28): isRedisConnected(), autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), deleteNotification(), getNotifications() (+20 more)

### Community 44 - "e"
Cohesion: 0.09
Nodes (35): af(), appendChild(), bs(), cf(), chainLocators(), Cl(), clone(), cs() (+27 more)

### Community 45 - "backend/package.json"
Cohesion: 0.18
Nodes (10): author, babel, presets, description, keywords, license, main, name (+2 more)

### Community 47 - "auth.middleware.js"
Cohesion: 0.05
Nodes (52): guestSearchLimiter, acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus() (+44 more)

### Community 48 - "codeMirrorModule-BbkfBe3n.js"
Cohesion: 0.05
Nodes (81): ac(), ar(), Bn(), br(), ca(), r(), cc(), ci() (+73 more)

### Community 49 - "ConfirmPage.jsx"
Cohesion: 0.13
Nodes (18): ROUTE_TICKER, CarTypePage(), imageFor(), ConfirmPage(), fmtWhen(), formatCurrency(), perKmLabel(), CHENNAI_AIRPORT (+10 more)

### Community 50 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 51 - "useAuth"
Cohesion: 0.07
Nodes (37): AdminLayout, App(), CustomerLayout, DriverContinue, DriverLayout, DriverLogin, DriverLocationSharer(), movedMeters() (+29 more)

### Community 52 - "RouteServices.jsx"
Cohesion: 0.33
Nodes (5): PopularRoutes(), ROUTES, SERVICES, FareNotes(), NOTES

### Community 53 - "G"
Cohesion: 0.10
Nodes (41): _activeSelectorForEvent(), ariaSnapshot(), ariaSnapshotForRecorder(), ariaSnapshotJSON(), _commit(), _commitAssertValue(), _consumeRightButtonEvent(), _elementHasValue() (+33 more)

### Community 54 - "App.jsx"
Cohesion: 0.04
Nodes (40): About, AdminBookingRequests, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage, ContactUs (+32 more)

### Community 56 - "CurrentRideCustomer.jsx"
Cohesion: 0.11
Nodes (23): CurrentRide, CurrentRideCustomer, AdvancedMarker(), CancelReasonDialog(), DEFAULT_REASONS, formatTime(), RideTimeline(), STAGES (+15 more)

### Community 58 - "app.js"
Cohesion: 0.08
Nodes (16): app, configuredOrigins, bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema (+8 more)

### Community 59 - "images/index.js"
Cohesion: 0.18
Nodes (10): Footer(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES, GuestBookingPage(), fmtWhen(), readJSON() (+2 more)

### Community 60 - "k"
Cohesion: 0.13
Nodes (60): Ae(), at(), B(), be(), i(), Ce(), ct(), De() (+52 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "i"
Cohesion: 0.06
Nodes (122): ac(), add(), addIn(), ao(), as(), b(), ba(), bc() (+114 more)

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 67 - "pop"
Cohesion: 0.14
Nodes (35): am(), _applyAttribute(), _assert(), atIndentedComment(), blockMap(), blockScalar(), blockSequence(), document() (+27 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, preview (+2 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "t"
Cohesion: 0.10
Nodes (40): aa(), an(), ao(), ba(), Bs(), n(), cs(), Do() (+32 more)

### Community 71 - "StructuredData.js"
Cohesion: 0.16
Nodes (9): About(), features, pillars, stats, values, businessJsonLd, organizationJsonLd, PRODUCTION_ORIGIN (+1 more)

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverDashboard.jsx"
Cohesion: 0.07
Nodes (19): AdminDashboard, CustomerDashboard, DriverDashboard, BAR_COLORS, COLORS, COLORS, DriverCharts, DriverPie (+11 more)

### Community 74 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 76 - "breadcrumbJsonLd"
Cohesion: 0.11
Nodes (35): cardHover, PageHero(), GlowBlobs(), Reveal(), SectionHeading(), AirportDetail(), AIRPORTS, CODE_TO_CITY (+27 more)

### Community 77 - "sw.bundle.js"
Cohesion: 0.06
Nodes (31): actions(), addFrameSnapshot(), _appendEvent(), appendTrace(), B(), _collectSnapshotPhase(), hasEntry(), _innerAppendEvent() (+23 more)

### Community 78 - "Skeleton.jsx"
Cohesion: 0.10
Nodes (30): DriverReviews, AssignDriverDialog(), Badge(), ConfirmDialog(), EmptyState(), ErrorState(), GlassTable(), Modal() (+22 more)

### Community 79 - "endpoints.js"
Cohesion: 0.07
Nodes (25): DriverDocuments, ForgotPassword, Login, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES, AuthSplit() (+17 more)

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 83 - "SEO.jsx"
Cohesion: 0.18
Nodes (14): getOrigin(), normalizePath(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), ACCEPTED_IMAGE_TYPES, DriverRegister() (+6 more)

### Community 84 - "n"
Cohesion: 0.20
Nodes (47): A(), g(), p(), bt(), C(), u(), D(), n() (+39 more)

### Community 85 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

### Community 87 - "uiMode.CU5KtEkS.js"
Cohesion: 0.06
Nodes (10): m(), ve(), y(), ./assets/xtermModule-DywYcAf8.js, collectTestIds(), fileNames(), flatTreeItems(), L() (+2 more)

### Community 90 - "redisRateLimiter.js"
Cohesion: 0.11
Nodes (18): getRedisClient(), authLimiter, createLimiter(), dispatchLimiter, generalLimiter, getRedisStore(), guestBookingLimiter, IORedisRateLimitStore (+10 more)

### Community 93 - "constructor"
Cohesion: 0.08
Nodes (30): an(), close(), cn(), constructor(), c(), dn(), en(), fromBits() (+22 more)

### Community 95 - "BookRide.jsx"
Cohesion: 0.10
Nodes (27): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+19 more)

### Community 97 - "parseDocument"
Cohesion: 0.26
Nodes (24): atLineEnd(), charAt(), continueScalar(), getLine(), hasChars(), lex(), parseBlockScalar(), parseBlockScalarHeader() (+16 more)

### Community 98 - "devDependencies"
Cohesion: 0.50
Nodes (3): devDependencies, @playwright/test, @playwright/test

### Community 99 - "InstantCustomers.jsx"
Cohesion: 0.43
Nodes (6): InstantCustomers, fmtWhen(), initials(), InstantCustomers(), STATUS_STYLES, timeAgo()

### Community 101 - "booking.service.js"
Cohesion: 0.09
Nodes (28): supportsTransactions(), withTransaction(), completeBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking() (+20 more)

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

### Community 115 - "$e"
Cohesion: 0.29
Nodes (8): $e(), inflate(), inflateEnd(), inflateInit(), ke(), h(), read_byte(), tt()

### Community 117 - "error-context.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 118 - "feda50cb721f19ae14fb62cd5058fe0647f8a34d.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 119 - "moduleFileExtensions"
Cohesion: 0.50
Nodes (4): moduleFileExtensions, js, json, mjs

### Community 120 - "_onConfigure"
Cohesion: 0.67
Nodes (3): I(), _onConfigure(), _parseConfig()

## Knowledge Gaps
- **291 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+286 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **26 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `update` to `defaultSettingsView-Ds6CBOo0.js`, `sw.bundle.js`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `getData()` connect `getEntriesGenerator` to `get`, `sw.bundle.js`, `r`, `ec`, `constructor`, `i`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `rn()` connect `constructor` to `wd`, `get`, `getEntriesGenerator`, `e`, `sw.bundle.js`, `ec`, `vn`, `r`, `k`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Are the 48 inferred relationships involving `i()` (e.g. with `defaultSettingsView-Ds6CBOo0.js` and `addIn()`) actually correct?**
  _`i()` has 48 INFERRED edges - model-reasoned connections that need verification._
- **Are the 70 inferred relationships involving `n()` (e.g. with `aa()` and `addIn()`) actually correct?**
  _`n()` has 70 INFERRED edges - model-reasoned connections that need verification._
- **Are the 53 inferred relationships involving `t()` (e.g. with `add()` and `ao()`) actually correct?**
  _`t()` has 53 INFERRED edges - model-reasoned connections that need verification._
- **Are the 66 inferred relationships involving `r()` (e.g. with `A()` and `ac()`) actually correct?**
  _`r()` has 66 INFERRED edges - model-reasoned connections that need verification._