# Graph Report - Cab Booking App  (2026-09-21)

## Corpus Check
- 314 files · ~3,336,700 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2963 nodes · 9853 edges · 134 communities (106 shown, 28 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 1216 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7e3768b7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- i
- upload.middleware.js
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
- Home.jsx
- analytics.js
- a
- booking.routes.js
- notification.service.js
- main.jsx
- jest
- C
- aiAssistant.service.js
- toString
- AdminDashboard.jsx
- get
- React + Vite
- auth.routes.js
- AGENTS.md
- driver.service.js
- favoriteLocation.service.js
- QueryProvider.jsx
- payment.routes.js
- redisRateLimiter.js
- googleMaps.service.js
- backend/package.json
- invoice.service.js
- t
- GuestBookingForm.jsx
- _onConfigure
- endpoints.js
- driverUpload.service.js
- G
- App.jsx
- c
- BookRide.jsx
- app.js
- en
- k
- theme.js
- ic
- push.service.js
- Testiminols.jsx
- api.js
- load
- pop
- frontend/package.json
- whatsapp.service.js
- ec
- vehicle.routes.js
- playwright
- DriverCharts.jsx
- D
- ride-flow.spec.js
- SEO.jsx
- sw.bundle.js
- useSocket
- auth.middleware.js
- tailwindcss
- user.routes.js
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
- BookingDetailsPage.jsx
- RouteErrorBoundary
- parseDocument
- devDependencies
- notification.routes.js
- booking.service.js
- $e
- e
- getEntriesGenerator
- bcryptjs
- dispatch
- dotenv
- _onTestBegin
- constructor
- t
- _absoluteLocation
- generateLocator
- socket.io-client
- multer
- pdfkit
- error-context.md
- feda50cb721f19ae14fb62cd5058fe0647f8a34d.md
- framer-motion
- va
- express
- react-dom
- nodemailer
- socket.io
- zod
- @react-google-maps/api
- react
- react-icons
- recharts
- @tanstack/react-query
- jl
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
- `O()` --indirect_call--> `h()`  [INFERRED]
  playwright-report/trace/assets/codeMirrorModule-BbkfBe3n.js → playwright-report/trace/assets/defaultSettingsView-Ds6CBOo0.js
- `A()` --indirect_call--> `se()`  [INFERRED]
  playwright-report/trace/assets/codeMirrorModule-BbkfBe3n.js → playwright-report/trace/assets/defaultSettingsView-Ds6CBOo0.js

## Import Cycles
- 3-file cycle: `backend/src/services/dispatch.service.js -> backend/src/services/notification.service.js -> backend/src/socket/index.js -> backend/src/services/dispatch.service.js`

## Communities (134 total, 28 thin omitted)

### Community 0 - "i"
Cohesion: 0.06
Nodes (68): af(), appendChild(), ar(), ba(), bt(), chainLocators(), createRelativeUrl(), df() (+60 more)

### Community 1 - "upload.middleware.js"
Cohesion: 0.21
Nodes (7): uploadProfileImage(), allowedMimeTypes, storage, upload, uploadSingle(), router, uploadImage()

### Community 2 - "defaultSettingsView-Ds6CBOo0.js"
Cohesion: 0.02
Nodes (173): _activelyFocused(), addMaskedElements(), addUserOverlay(), _ariaSnapshotForExpect(), ariaSnapshotForExpectFailure(), atDocument(), blurNode(), bn() (+165 more)

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
Cohesion: 0.04
Nodes (28): connectDB(), fixBookingAlertIndexes(), closeRedis(), invalidateCache(), memCache, memCacheExpiry, memGet(), memSet() (+20 more)

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
Nodes (76): ac(), ar(), Bn(), br(), ca(), r(), cc(), cn() (+68 more)

### Community 11 - "driver.routes.js"
Cohesion: 0.13
Nodes (23): createProfile(), getCurrentBooking(), getDashboard(), getEarnings(), getProfile(), getRideHistory(), getStatistics(), getTodayRides() (+15 more)

### Community 12 - "dependencies"
Cohesion: 0.11
Nodes (19): dompurify, dependencies, axios, dompurify, @mantine/core, @mantine/hooks, react-hook-form, react-hot-toast (+11 more)

### Community 13 - "googleMaps.routes.js"
Cohesion: 0.14
Nodes (19): isRedisConnected(), autocomplete(), getETA(), getPlaceDetails(), getRoute(), reverseGeocode(), cacheMiddleware(), queryCacheKey() (+11 more)

### Community 14 - "Home.jsx"
Cohesion: 0.08
Nodes (27): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, AirportTransfers(), PopularRoutes() (+19 more)

### Community 15 - "analytics.js"
Cohesion: 0.54
Nodes (5): CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent()

### Community 16 - "a"
Cohesion: 0.10
Nodes (83): A(), ap(), at(), b(), c(), g(), o(), s() (+75 more)

### Community 17 - "booking.routes.js"
Cohesion: 0.14
Nodes (30): acceptBooking(), addDriverTip(), cancelBooking(), completeRide(), createBooking(), createGuestBooking(), driverCancelBooking(), getAvailableBookings() (+22 more)

### Community 18 - "notification.service.js"
Cohesion: 0.07
Nodes (33): notificationSchema, assignDriver(), getAvailableBookings(), acceptBooking(), dispatchBooking(), findEligibleDrivers(), getCurrentDriver(), handleDriverTimeout() (+25 more)

### Community 19 - "main.jsx"
Cohesion: 0.18
Nodes (9): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, SocketProvider(), queryClient (+1 more)

### Community 20 - "jest"
Cohesion: 0.10
Nodes (20): jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, setupFiles, testEnvironment, testMatch, transform (+12 more)

### Community 21 - "C"
Cohesion: 0.13
Nodes (31): begin(), C(), _cached(), _callMatches(), _callQuery(), _checkSelector(), end(), _expandContextForScopeMatching() (+23 more)

### Community 22 - "aiAssistant.service.js"
Cohesion: 0.10
Nodes (31): sendMessage(), router, buildVehicleContext(), chat(), cleanPlace(), computeFareReply(), extractLocations(), fallbackChat() (+23 more)

### Community 23 - "toString"
Cohesion: 0.07
Nodes (66): ad(), ai(), bd(), cd(), createNode(), createPair(), Cu(), dd() (+58 more)

### Community 24 - "AdminDashboard.jsx"
Cohesion: 0.18
Nodes (5): AdminDashboard, BAR_COLORS, COLORS, AdminCharts, AdminDashboard()

### Community 26 - "get"
Cohesion: 0.13
Nodes (22): _a(), ba(), Ca(), ga(), get(), ha(), hasEntry(), resourceByUrl() (+14 more)

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

### Community 44 - "googleMaps.service.js"
Cohesion: 0.25
Nodes (6): estimateFare(), calculateDistance(), getETA(), getRoute(), headers(), requestRoute()

### Community 45 - "backend/package.json"
Cohesion: 0.12
Nodes (15): author, babel, presets, description, keywords, license, main, name (+7 more)

### Community 47 - "invoice.service.js"
Cohesion: 0.38
Nodes (5): downloadInvoice(), __dirname, __filename, generateInvoice(), LOGO_PATH

### Community 48 - "t"
Cohesion: 0.08
Nodes (51): aa(), an(), ao(), ba(), Bs(), n(), co(), cs() (+43 more)

### Community 49 - "GuestBookingForm.jsx"
Cohesion: 0.06
Nodes (47): Hero(), ROUTE_TICKER, ROUTE_TICKER, AutoPushSync(), addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces() (+39 more)

### Community 50 - "_onConfigure"
Cohesion: 0.67
Nodes (3): I(), _onConfigure(), _parseConfig()

### Community 51 - "endpoints.js"
Cohesion: 0.05
Nodes (56): AdminLayout, AdminProfile, CustomerDashboard, CustomerLayout, DriverContinue, DriverDashboard, DriverLayout, DriverLogin (+48 more)

### Community 52 - "driverUpload.service.js"
Cohesion: 0.33
Nodes (6): uploadDriverDocumentFile(), uploadVehicleImages(), uploadDriverDocument(), uploadImage(), uploadProfileImage(), uploadVehicleImage()

### Community 53 - "G"
Cohesion: 0.11
Nodes (36): ariaSnapshot(), ariaSnapshotForRecorder(), ariaSnapshotJSON(), _commit(), _commitAssertValue(), _consumeRightButtonEvent(), _elementHasValue(), firstBox() (+28 more)

### Community 54 - "App.jsx"
Cohesion: 0.03
Nodes (56): About, AdminBookingRequests, AdminNotifications, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage (+48 more)

### Community 55 - "c"
Cohesion: 0.29
Nodes (6): close(), closestScreenshot(), c(), ve(), s(), pe()

### Community 56 - "BookRide.jsx"
Cohesion: 0.06
Nodes (41): BookRide, CurrentRide, CurrentRideCustomer, CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap() (+33 more)

### Community 58 - "app.js"
Cohesion: 0.07
Nodes (19): app, configuredOrigins, bookingSchema, locationSchema, driverProfileSchema, driverWalletSchema, transactionSchema, paymentSchema (+11 more)

### Community 59 - "en"
Cohesion: 0.20
Nodes (11): cn(), dn(), en(), fromBits(), getRandomValues(), h(), K(), ln() (+3 more)

### Community 60 - "k"
Cohesion: 0.14
Nodes (56): Ae(), at(), B(), be(), Ce(), ct(), De(), ee() (+48 more)

### Community 61 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 62 - "ic"
Cohesion: 0.07
Nodes (69): ac(), an(), ao(), bc(), cc(), ci(), co(), cs() (+61 more)

### Community 63 - "push.service.js"
Cohesion: 0.27
Nodes (5): pushSubscriptionSchema, detailsUrlFor(), initPush(), isPushEnabled(), sendPushToUser()

### Community 65 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 66 - "load"
Cohesion: 0.20
Nodes (10): actions(), _appendEvent(), appendTrace(), _innerAppendEvent(), isLive(), load(), _modernize(), ne() (+2 more)

### Community 67 - "pop"
Cohesion: 0.11
Nodes (41): am(), _applyAttribute(), _assert(), atIndentedComment(), blockMap(), blockScalar(), blockSequence(), cm() (+33 more)

### Community 68 - "frontend/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, dev, lint, prebuild, preview (+2 more)

### Community 69 - "whatsapp.service.js"
Cohesion: 0.24
Nodes (14): whatsappLogSchema, buildBookingAlert(), buildBookingTemplateParams(), getBookingAlertFields(), getConfig(), markAlertSent(), maskPhone(), metaPost() (+6 more)

### Community 70 - "ec"
Cohesion: 0.10
Nodes (51): ai(), as(), bi(), ci(), di(), ds(), ec(), fi() (+43 more)

### Community 71 - "vehicle.routes.js"
Cohesion: 0.48
Nodes (5): createVehicle(), deleteVehicle(), getVehicles(), updateVehicle(), router

### Community 72 - "playwright"
Cohesion: 0.17
Nodes (11): BROWSER, mcp, playwright, command, enabled, environment, type, $schema (+3 more)

### Community 73 - "DriverCharts.jsx"
Cohesion: 0.22
Nodes (6): COLORS, DriverCharts, DriverPie, RATE_COLORS, DriverCharts, DriverPie

### Community 74 - "D"
Cohesion: 0.33
Nodes (7): D(), from(), getObject(), jd(), kd(), setObject(), sf()

### Community 75 - "ride-flow.spec.js"
Cohesion: 0.27
Nodes (8): ADMIN, clickRideAction(), CUSTOMER, dismissActiveRide(), DRIVER, RESULTS, shot(), step()

### Community 76 - "SEO.jsx"
Cohesion: 0.04
Nodes (93): Info, AUTH_SLIDES, AuthSplit(), Footer(), AIRPORTS, cardHover, PageHero(), GlowBlobs() (+85 more)

### Community 77 - "sw.bundle.js"
Cohesion: 0.06
Nodes (35): v(), addFrameSnapshot(), addResource(), B(), _block(), calculate(), _collectSnapshotPhase(), concat() (+27 more)

### Community 78 - "useSocket"
Cohesion: 0.08
Nodes (50): AssignDriverDialog(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), ErrorState(), GlassTable() (+42 more)

### Community 79 - "auth.middleware.js"
Cohesion: 0.08
Nodes (35): guestSearchLimiter, acceptBooking(), dispatchBooking(), handleDriverTimeout(), rejectBooking(), sendToNextDriver(), getDriverPerformance(), toggleOnlineStatus() (+27 more)

### Community 81 - "user.routes.js"
Cohesion: 0.27
Nodes (7): changePassword(), getAllUsers(), updateProfile(), router, paginationQuerySchema, changePasswordSchema, updateProfileSchema

### Community 82 - "live-location.spec.js"
Cohesion: 0.20
Nodes (5): CUSTOMER, DRIVER, DROP, PICKUP, RESULTS

### Community 84 - "n"
Cohesion: 0.20
Nodes (49): A(), g(), p(), bt(), C(), i(), u(), D() (+41 more)

### Community 85 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

### Community 87 - "uiMode.CU5KtEkS.js"
Cohesion: 0.06
Nodes (13): be(), $f(), jn(), m(), ve(), y(), ./assets/xtermModule-DywYcAf8.js, collectTestIds() (+5 more)

### Community 93 - "constructor"
Cohesion: 0.11
Nodes (26): an(), constructor(), n(), Jn(), f(), l(), m(), o() (+18 more)

### Community 95 - "BookingDetailsPage.jsx"
Cohesion: 0.14
Nodes (22): BookingDetailsPage, DriverBookingDetail, cardVariants, containerVariants, formatCurrency(), perKmLabel(), vehicleImageFor(), VehicleSelector() (+14 more)

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

### Community 102 - "$e"
Cohesion: 0.29
Nodes (8): $e(), inflate(), inflateEnd(), inflateInit(), ke(), h(), read_byte(), tt()

### Community 103 - "e"
Cohesion: 0.15
Nodes (16): append(), bn(), g(), n(), e(), gn(), hn(), Kn() (+8 more)

### Community 104 - "getEntriesGenerator"
Cohesion: 0.20
Nodes (19): aa(), ea(), getData(), getEntries(), getEntriesGenerator(), gt(), i(), ia() (+11 more)

### Community 106 - "dispatch"
Cohesion: 0.14
Nodes (14): dispatch(), F(), _handleOnError(), _onAttach(), _onBegin(), _onEnd(), _onError(), _onExit() (+6 more)

### Community 108 - "_onTestBegin"
Cohesion: 0.67
Nodes (3): _createTestResult(), _onTestBegin(), setStartTimeNumber()

### Community 109 - "constructor"
Cohesion: 0.21
Nodes (13): _addChild(), allTests(), constructor(), _createReporter(), _defaultDescribeItem(), entries(), _fileItem(), filterTree() (+5 more)

### Community 110 - "t"
Cohesion: 0.21
Nodes (17): Ar(), c(), Dr(), t(), Fr(), getOrCompute(), Gr(), ht() (+9 more)

### Community 111 - "_absoluteLocation"
Cohesion: 0.21
Nodes (13): _absoluteAnnotationLocationsInplace(), _absoluteLocation(), _absolutePath(), _addSuite(), _addTest(), _mergeSuiteInto(), _mergeTestInto(), N() (+5 more)

### Community 112 - "generateLocator"
Cohesion: 0.67
Nodes (9): generateLocator(), Jt(), quote(), regexToSourceString(), regexToString(), toCallWithExact(), toHasNotText(), toHasText() (+1 more)

### Community 117 - "error-context.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 118 - "feda50cb721f19ae14fb62cd5058fe0647f8a34d.md"
Cohesion: 0.40
Nodes (4): Error details, Instructions, Test info, Test source

### Community 120 - "va"
Cohesion: 0.12
Nodes (29): ae(), bi(), br(), cf(), er(), fi(), fr(), gi() (+21 more)

### Community 141 - "jl"
Cohesion: 0.31
Nodes (11): Al(), bl(), jl(), jsonValue(), kl(), Ml(), pa(), Pl() (+3 more)

### Community 142 - "n"
Cohesion: 0.06
Nodes (85): aa(), _activeSelectorForEvent(), add(), addIn(), ariaSnapshotForCall(), as(), b(), Bf() (+77 more)

## Knowledge Gaps
- **296 isolated node(s):** `mockGet`, `mockPost`, `COORDS`, `mockGet`, `mockPost` (+291 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_f()` connect `sw.bundle.js` to `defaultSettingsView-Ds6CBOo0.js`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `rn()` connect `constructor` to `i`, `ec`, `e`, `getEntriesGenerator`, `sw.bundle.js`, `c`, `en`, `k`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
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