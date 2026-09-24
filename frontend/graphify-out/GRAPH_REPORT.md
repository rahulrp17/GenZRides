# Graph Report - frontend  (2026-09-24)

## Corpus Check
- 168 files · ~2,648,103 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 793 nodes · 2264 edges · 49 communities (39 shown, 10 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3dbdd1f5`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- AdminInstantBookings.jsx
- BookingDetailsPage.jsx
- Home.jsx
- App.jsx
- devDependencies
- dependencies
- main.jsx
- DriverDashboard.jsx
- endpoints.js
- theme.js
- React + Vite
- QueryProvider.jsx
- DriverRegister.jsx
- useSocket
- Testiminols.jsx
- ConfirmPage.jsx
- Vehicles.jsx
- Login.jsx
- RouteErrorBoundary
- index.js
- CurrentRideCustomer.jsx
- DriverContinue.jsx
- StructuredData.js
- analytics.js
- DriverDocuments.jsx
- SEO.jsx
- Reveal.jsx
- TariffChart.jsx
- NotFound.jsx
- DriverBookingFeed
- InfoDetail.jsx
- LoadingPage.jsx
- StickyMobileCTA.jsx
- vercel.json
- DriverProfilePage.jsx
- AIAssistant.jsx
- BookRide.jsx
- PopularRoutes.jsx
- refresh-sitemap.mjs
- ScrollProgress.jsx
- ScrollToTopHandler.jsx

## God Nodes (most connected - your core abstractions)
1. `useSocket()` - 46 edges
2. `useAuth()` - 45 edges
3. `ErrorState()` - 38 edges
4. `SEO()` - 35 edges
5. `EmptyState()` - 28 edges
6. `formatTripDuration()` - 27 edges
7. `breadcrumbJsonLd()` - 25 edges
8. `Reveal()` - 22 edges
9. `Modal()` - 21 edges
10. `TableSkeleton()` - 20 edges

## Surprising Connections (you probably didn't know these)
- `AdminDashboard()` --calls--> `useSocket()`  [EXTRACTED]
  src/Pages/admin/AdminDashboard.jsx → src/Context/SocketContext.jsx
- `About()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  src/Pages/AboutUs/About.jsx → src/utils/StructuredData.js
- `InfoDetail()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  src/Pages/InfoDetail/InfoDetail.jsx → src/utils/StructuredData.js
- `PopularRoutes()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  src/Pages/PopularRoutes/PopularRoutes.jsx → src/utils/StructuredData.js
- `AdminProfile()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/admin/AdminProfile.jsx → src/hooks/useAuth.js

## Import Cycles
- None detected.

## Communities (49 total, 10 thin omitted)

### Community 0 - "AdminInstantBookings.jsx"
Cohesion: 0.07
Nodes (66): DriverReviews, AssignDriverDialog(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), ErrorState() (+58 more)

### Community 1 - "BookingDetailsPage.jsx"
Cohesion: 0.09
Nodes (31): BookingDetailsPage, DriverBookingDetail, GuestBookingLookup, WaitingPage, cardVariants, containerVariants, formatCurrency(), perKmLabel() (+23 more)

### Community 2 - "Home.jsx"
Cohesion: 0.12
Nodes (17): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, DriverCTA(), FinalCTA() (+9 more)

### Community 3 - "App.jsx"
Cohesion: 0.05
Nodes (41): About, AdminCustomerBookingRequests, AdminCustomerBookings, AdminInstantBookingRequests, AdminInstantBookings, AdminLayout, AdminVisitors, AirportDetail (+33 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+23 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (43): axios, dompurify, echarts, framer-motion, lucide-react, @mantine/core, @mantine/dates, @mantine/hooks (+35 more)

### Community 6 - "main.jsx"
Cohesion: 0.19
Nodes (9): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, queryClient, theme (+1 more)

### Community 7 - "DriverDashboard.jsx"
Cohesion: 0.06
Nodes (26): AdminDashboard, CustomerDashboard, DriverDashboard, Earnings, AdminCharts(), AXIS_LABEL, DARK_TOOLTIP, fmtIN() (+18 more)

### Community 8 - "endpoints.js"
Cohesion: 0.15
Nodes (10): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded(), dispatchAPI, driverStatusAPI, favoriteAPI (+2 more)

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 18 - "DriverRegister.jsx"
Cohesion: 0.50
Nodes (4): ACCEPTED_IMAGE_TYPES, DriverRegister(), validateFile(), driverUploadAPI

### Community 20 - "useSocket"
Cohesion: 0.07
Nodes (56): AdminNotifications, DriverNotifications, Notifications, DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES, AutoPushSync() (+48 more)

### Community 22 - "ConfirmPage.jsx"
Cohesion: 0.08
Nodes (27): CarTypePage, ConfirmPage, Footer(), Hero(), ROUTE_TICKER, ROUTE_TICKER, CarTypePage(), imageFor() (+19 more)

### Community 23 - "Vehicles.jsx"
Cohesion: 0.40
Nodes (4): AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 24 - "Login.jsx"
Cohesion: 0.20
Nodes (5): AUTH_SLIDES, AuthSplit(), getAuthErrorMessage(), Login(), DriverLogin()

### Community 26 - "index.js"
Cohesion: 0.14
Nodes (20): PageHero(), AirportDetail(), AIRPORTS, CODE_TO_CITY, PERKS, AIRPORTS, AirportTransfers(), PERKS (+12 more)

### Community 27 - "CurrentRideCustomer.jsx"
Cohesion: 0.13
Nodes (20): CurrentRide, CurrentRideCustomer, AdvancedMarker(), formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo() (+12 more)

### Community 28 - "DriverContinue.jsx"
Cohesion: 0.33
Nodes (5): DriverContinue, benefits, DriverContinue(), requirements, steps

### Community 29 - "StructuredData.js"
Cohesion: 0.16
Nodes (9): About(), features, pillars, stats, values, businessJsonLd, organizationJsonLd, PRODUCTION_ORIGIN (+1 more)

### Community 30 - "analytics.js"
Cohesion: 0.38
Nodes (7): RouteTracker(), CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent(), trackPageview()

### Community 31 - "DriverDocuments.jsx"
Cohesion: 0.40
Nodes (5): DriverDocuments, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile()

### Community 32 - "SEO.jsx"
Cohesion: 0.27
Nodes (7): getOrigin(), normalizePath(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), passwordRules

### Community 33 - "Reveal.jsx"
Cohesion: 0.18
Nodes (14): AIRPORTS, AirportTransfers(), cardHover, GlowBlobs(), Reveal(), SectionHeading(), PopularRoutes(), ROUTES (+6 more)

### Community 34 - "TariffChart.jsx"
Cohesion: 0.40
Nodes (5): imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 36 - "DriverBookingFeed"
Cohesion: 0.20
Nodes (4): DriverCustomerRequests, DriverInstantBookings, DriverMyBookings, DriverBookingFeed()

### Community 37 - "InfoDetail.jsx"
Cohesion: 0.33
Nodes (5): FAQS, InfoDetail(), ORDER, TITLES, TOPICS

### Community 42 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

### Community 43 - "AIAssistant.jsx"
Cohesion: 0.50
Nodes (4): AIAssistant(), formatReply(), SUGGESTED_PROMPTS, aiAPI

### Community 44 - "BookRide.jsx"
Cohesion: 0.08
Nodes (37): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), SavedPlaceButton(), saveRecentSearches() (+29 more)

### Community 45 - "PopularRoutes.jsx"
Cohesion: 0.50
Nodes (4): PopularRoutes(), RouteCard(), ROUTES, slugOf()

### Community 46 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

## Knowledge Gaps
- **167 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+162 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `useSocket` to `BookingDetailsPage.jsx`, `DriverDashboard.jsx`, `DriverProfilePage.jsx`, `BookRide.jsx`, `DriverRegister.jsx`, `Login.jsx`, `DriverContinue.jsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `useSocket()` connect `useSocket` to `AdminInstantBookings.jsx`, `BookingDetailsPage.jsx`, `DriverBookingFeed`, `DriverDashboard.jsx`, `BookRide.jsx`, `CurrentRideCustomer.jsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `SEO()` connect `SEO.jsx` to `BookingDetailsPage.jsx`, `Home.jsx`, `NotFound.jsx`, `Reveal.jsx`, `InfoDetail.jsx`, `TariffChart.jsx`, `PopularRoutes.jsx`, `DriverRegister.jsx`, `useSocket`, `ConfirmPage.jsx`, `Vehicles.jsx`, `Login.jsx`, `index.js`, `DriverContinue.jsx`, `StructuredData.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _167 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AdminInstantBookings.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07147067491895077 - nodes in this community are weakly interconnected._
- **Should `BookingDetailsPage.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09358974358974359 - nodes in this community are weakly interconnected._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11956521739130435 - nodes in this community are weakly interconnected._