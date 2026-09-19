# Graph Report - frontend  (2026-09-18)

## Corpus Check
- 149 files · ~2,558,870 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 668 nodes · 1773 edges · 42 communities (34 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a8f9d48`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- endpoints.js
- useAuth
- Home.jsx
- App.jsx
- devDependencies
- dependencies
- BookRide.jsx
- SEO.jsx
- api.js
- theme.js
- React + Vite
- QueryProvider.jsx
- DriverRegister.jsx
- CurrentRideCustomer.jsx
- Testiminols.jsx
- ConfirmPage.jsx
- GuestBookingForm.jsx
- AuthSplit.jsx
- RouteErrorBoundary
- StructuredData.js
- DriverDashboard.jsx
- main.jsx
- AdminCharts.jsx
- analytics.js
- InfoDetail.jsx
- TariffChart.jsx
- Vehicles.jsx
- AIAssistant.jsx
- Login.jsx
- BookingTariff.jsx
- NotFound.jsx
- LoadingPage.jsx
- StickyMobileCTA.jsx
- vercel.json

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 43 edges
2. `useSocket()` - 35 edges
3. `ErrorState()` - 35 edges
4. `SEO()` - 34 edges
5. `EmptyState()` - 25 edges
6. `breadcrumbJsonLd()` - 25 edges
7. `Reveal()` - 20 edges
8. `Modal()` - 19 edges
9. `TableSkeleton()` - 17 edges
10. `PageHero()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `About()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  src/Pages/AboutUs/About.jsx → src/utils/StructuredData.js
- `InfoDetail()` --calls--> `breadcrumbJsonLd()`  [EXTRACTED]
  src/Pages/InfoDetail/InfoDetail.jsx → src/utils/StructuredData.js
- `DriverDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/driver/DriverDashboard.jsx → src/hooks/useAuth.js
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Login/Login.jsx → src/hooks/useAuth.js
- `Navbar()` --calls--> `useSocket()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/Context/SocketContext.jsx

## Import Cycles
- None detected.

## Communities (42 total, 8 thin omitted)

### Community 0 - "endpoints.js"
Cohesion: 0.06
Nodes (67): AdminDashboard, BookingDetailsPage, AssignDriverDialog(), Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState() (+59 more)

### Community 1 - "useAuth"
Cohesion: 0.06
Nodes (61): AdminLayout, AdminProfile, CustomerLayout, DriverContinue, DriverLayout, DriverLogin, DriverProfilePage, Profile (+53 more)

### Community 2 - "Home.jsx"
Cohesion: 0.12
Nodes (21): Home, FarePricing(), rows, cardHover, GlowBlobs(), SectionHeading(), PopularRoutes(), ROUTES (+13 more)

### Community 3 - "App.jsx"
Cohesion: 0.04
Nodes (44): About, AdminBookingRequests, AdminNotifications, AirportDetail, AirportTransfers, AttachVehicle, CarTypePage, ConfirmPage (+36 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (30): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+22 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (33): axios, framer-motion, lucide-react, dependencies, axios, framer-motion, lucide-react, react (+25 more)

### Community 6 - "BookRide.jsx"
Cohesion: 0.09
Nodes (29): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+21 more)

### Community 7 - "SEO.jsx"
Cohesion: 0.12
Nodes (28): PageHero(), Reveal(), getOrigin(), normalizePath(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta() (+20 more)

### Community 8 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 18 - "DriverRegister.jsx"
Cohesion: 0.20
Nodes (10): DriverDocuments, DriverRegister, ACCEPTED_IMAGE_TYPES, DriverRegister(), validateFile(), ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments() (+2 more)

### Community 20 - "CurrentRideCustomer.jsx"
Cohesion: 0.14
Nodes (16): CurrentRideCustomer, AdvancedMarker(), formatTime(), RideTimeline(), STAGES, formatElapsed(), getRideTimeInfo(), toMs() (+8 more)

### Community 22 - "ConfirmPage.jsx"
Cohesion: 0.15
Nodes (17): Footer(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES, FareNotes(), NOTES, CarTypePage() (+9 more)

### Community 23 - "GuestBookingForm.jsx"
Cohesion: 0.13
Nodes (7): Hero(), ROUTE_TICKER, ROUTE_TICKER, GuestBookingForm(), pad(), minPickupISO(), saveDraft()

### Community 24 - "AuthSplit.jsx"
Cohesion: 0.14
Nodes (7): ForgotPassword, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES, AuthSplit(), passwordRules

### Community 26 - "StructuredData.js"
Cohesion: 0.14
Nodes (11): About(), features, pillars, stats, values, Home(), businessJsonLd, makeHomeJsonLd() (+3 more)

### Community 27 - "DriverDashboard.jsx"
Cohesion: 0.16
Nodes (8): DriverDashboard, COLORS, DriverCharts, DriverPie, RATE_COLORS, DriverCharts, DriverDashboard(), DriverPie

### Community 28 - "main.jsx"
Cohesion: 0.21
Nodes (8): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, queryClient, authAPI

### Community 29 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 30 - "analytics.js"
Cohesion: 0.54
Nodes (5): CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent()

### Community 31 - "InfoDetail.jsx"
Cohesion: 0.33
Nodes (5): FAQS, InfoDetail(), ORDER, TITLES, TOPICS

### Community 32 - "TariffChart.jsx"
Cohesion: 0.40
Nodes (5): imageForVehicle(), notes, PACKAGES, TariffChart(), tariffData

### Community 33 - "Vehicles.jsx"
Cohesion: 0.40
Nodes (4): AttachVehicle(), cardVariants, imageForVehicle(), vehicles

### Community 34 - "AIAssistant.jsx"
Cohesion: 0.50
Nodes (4): AIAssistant(), formatReply(), SUGGESTED_PROMPTS, aiAPI

### Community 35 - "Login.jsx"
Cohesion: 0.67
Nodes (3): Login, getAuthErrorMessage(), Login()

### Community 36 - "BookingTariff.jsx"
Cohesion: 0.50
Nodes (3): BookingTariff(), RULES, TABS

## Knowledge Gaps
- **141 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+136 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `useAuth` to `endpoints.js`, `Login.jsx`, `DriverRegister.jsx`, `ConfirmPage.jsx`, `DriverDashboard.jsx`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `useSocket()` connect `endpoints.js` to `useAuth`, `CurrentRideCustomer.jsx`, `ConfirmPage.jsx`, `BookRide.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `SEO()` connect `SEO.jsx` to `TariffChart.jsx`, `useAuth`, `Home.jsx`, `Login.jsx`, `Vehicles.jsx`, `NotFound.jsx`, `DriverRegister.jsx`, `ConfirmPage.jsx`, `AuthSplit.jsx`, `StructuredData.js`, `InfoDetail.jsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _141 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `endpoints.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06071334906897456 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.05740740740740741 - nodes in this community are weakly interconnected._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._