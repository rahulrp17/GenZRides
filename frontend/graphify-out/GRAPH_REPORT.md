# Graph Report - frontend  (2026-09-06)

## Corpus Check
- 118 files · ~1,543,117 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 507 nodes · 1296 edges · 27 communities (19 shown, 8 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- endpoints.js
- useAuth
- PushToggle.jsx
- App.jsx
- devDependencies
- dependencies
- BookRide.jsx
- SEO.jsx
- api.js
- theme.js
- React + Vite
- QueryProvider.jsx
- DriverDocuments.jsx
- useSocket
- Testiminols.jsx
- CarTypePage.jsx
- ScrollProgress.jsx
- ScrollToTopHandler.jsx
- RouteErrorBoundary
- Earnings.jsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 35 edges
2. `SEO()` - 28 edges
3. `useSocket()` - 25 edges
4. `EmptyState()` - 24 edges
5. `Reveal()` - 20 edges
6. `ErrorState()` - 17 edges
7. `TableSkeleton()` - 17 edges
8. `PageHero()` - 16 edges
9. `GlowBlobs()` - 16 edges
10. `Pagination()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Login/Login.jsx → src/hooks/useAuth.js
- `Navbar()` --calls--> `useSocket()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/Context/SocketContext.jsx
- `Navbar()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/hooks/useAuth.js
- `PushListener()` --calls--> `useSocket()`  [EXTRACTED]
  src/components/PushListener.jsx → src/Context/SocketContext.jsx
- `ManageBookings()` --calls--> `useSocket()`  [EXTRACTED]
  src/Pages/admin/ManageBookings.jsx → src/Context/SocketContext.jsx

## Import Cycles
- None detected.

## Communities (27 total, 8 thin omitted)

### Community 0 - "endpoints.js"
Cohesion: 0.11
Nodes (23): Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), Modal(), Pagination(), SearchBar() (+15 more)

### Community 1 - "useAuth"
Cohesion: 0.05
Nodes (49): AdminLayout, App(), CustomerLayout, DriverContinue, DriverLayout, DriverLogin, DriverProfilePage, DriverRegister (+41 more)

### Community 2 - "PushToggle.jsx"
Cohesion: 0.87
Nodes (4): PushToggle(), getPushPermission(), isPushSupported(), requestPushPermission()

### Community 3 - "App.jsx"
Cohesion: 0.06
Nodes (32): About, AdminBookingRequests, AdminNotifications, AirportDetail, AirportTransfers, ContactUs, CustomerBookings, CustomerReviews (+24 more)

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.06
Nodes (33): axios, framer-motion, lucide-react, dependencies, axios, framer-motion, lucide-react, react (+25 more)

### Community 6 - "BookRide.jsx"
Cohesion: 0.11
Nodes (21): BookRide, addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces() (+13 more)

### Community 7 - "SEO.jsx"
Cohesion: 0.05
Nodes (60): AttachVehicle, Home, BookingTariff(), tabs, FarePricing(), rows, cardHover, PageHero() (+52 more)

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 18 - "DriverDocuments.jsx"
Cohesion: 0.33
Nodes (6): DriverDocuments, ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 20 - "useSocket"
Cohesion: 0.06
Nodes (43): AdminDashboard, BookingDetailsPage, CurrentRide, CurrentRideCustomer, CustomerDashboard, DriverBookingDetail, DriverBookings, DriverDashboard (+35 more)

### Community 22 - "CarTypePage.jsx"
Cohesion: 0.13
Nodes (20): CarTypePage, ConfirmPage, Footer(), Hero(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES (+12 more)

## Knowledge Gaps
- **106 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+101 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `useAuth` to `useSocket`, `CarTypePage.jsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `SEO()` connect `SEO.jsx` to `useAuth`, `CarTypePage.jsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `useSocket()` connect `useSocket` to `endpoints.js`, `useAuth`, `CarTypePage.jsx`, `BookRide.jsx`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _106 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `endpoints.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10528559249786872 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.05314685314685315 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._