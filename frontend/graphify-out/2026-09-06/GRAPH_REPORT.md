# Graph Report - frontend  (2026-09-05)

## Corpus Check
- 115 files · ~1,540,229 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 436 nodes · 1171 edges · 27 communities (19 shown, 8 thin omitted)
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
- index.js
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
- Invoices
- CurrentRide

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 35 edges
2. `useSocket()` - 25 edges
3. `EmptyState()` - 24 edges
4. `Reveal()` - 20 edges
5. `ErrorState()` - 17 edges
6. `TableSkeleton()` - 17 edges
7. `PageHero()` - 16 edges
8. `GlowBlobs()` - 16 edges
9. `Pagination()` - 16 edges
10. `Modal()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Navbar()` --calls--> `useSocket()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/Context/SocketContext.jsx
- `Navbar()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/hooks/useAuth.js
- `PushListener()` --calls--> `useSocket()`  [EXTRACTED]
  src/components/PushListener.jsx → src/Context/SocketContext.jsx
- `BookRide()` --calls--> `useSocket()`  [EXTRACTED]
  src/Pages/customer/BookRide.jsx → src/Context/SocketContext.jsx
- `CurrentRide()` --calls--> `useSocket()`  [EXTRACTED]
  src/Pages/driver/CurrentRide.jsx → src/Context/SocketContext.jsx

## Import Cycles
- None detected.

## Communities (27 total, 8 thin omitted)

### Community 0 - "endpoints.js"
Cohesion: 0.11
Nodes (37): Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), ErrorState(), Modal(), Pagination() (+29 more)

### Community 1 - "useAuth"
Cohesion: 0.06
Nodes (40): App(), AUTH_SLIDES, AuthSplit(), Login(), ProtectedRoute(), bookingIdOf(), detailsUrlFor(), PushListener() (+32 more)

### Community 2 - "PushToggle.jsx"
Cohesion: 0.87
Nodes (4): PushToggle(), getPushPermission(), isPushSupported(), requestPushPermission()

### Community 3 - "App.jsx"
Cohesion: 0.07
Nodes (27): About(), AdminBookingRequests(), AdminDashboard(), ManageCustomers(), ManageReviews(), ManageVehicles(), ManageWithdrawals(), AirportDetail() (+19 more)

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (39): axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, lucide-react, dependencies, axios, framer-motion (+31 more)

### Community 6 - "BookRide.jsx"
Cohesion: 0.12
Nodes (19): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces(), CHENNAI_CENTER (+11 more)

### Community 7 - "index.js"
Cohesion: 0.06
Nodes (53): BookingTariff(), tabs, FarePricing(), rows, cardHover, PageHero(), GlowBlobs(), Reveal() (+45 more)

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 18 - "DriverDocuments.jsx"
Cohesion: 0.40
Nodes (5): ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 20 - "useSocket"
Cohesion: 0.14
Nodes (14): useSocket(), AdminNotifications(), bookingIdOf(), ManageBookings(), ManageDrivers(), BookingDetailsPage(), formatDateTime(), CurrentRideCustomer() (+6 more)

### Community 22 - "CarTypePage.jsx"
Cohesion: 0.15
Nodes (18): Footer(), Hero(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES, CarTypePage(), imageFor() (+10 more)

## Knowledge Gaps
- **109 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+104 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `useAuth` to `endpoints.js`, `useSocket`, `CarTypePage.jsx`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _109 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `endpoints.js` be split into smaller, more focused modules?**
  _Cohesion score 0.10740740740740741 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.062146892655367235 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._