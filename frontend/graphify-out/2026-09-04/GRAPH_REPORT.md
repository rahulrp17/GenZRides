# Graph Report - frontend  (2026-09-04)

## Corpus Check
- 96 files · ~1,523,576 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 339 nodes · 819 edges · 22 communities (18 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Skeleton.jsx
- useAuth
- App.jsx
- CurrentRide.jsx
- devDependencies
- dependencies
- BookRide.jsx
- Home.jsx
- endpoints.js
- theme.js
- React + Vite
- QueryProvider.jsx
- BookingTariff.jsx
- Testiminols.jsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 31 edges
2. `EmptyState()` - 24 edges
3. `TableSkeleton()` - 17 edges
4. `ErrorState()` - 16 edges
5. `Pagination()` - 16 edges
6. `Modal()` - 14 edges
7. `bookingAPI` - 13 edges
8. `driverAPI` - 12 edges
9. `useSocket()` - 11 edges
10. `ConfirmDialog()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Navbar()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/hooks/useAuth.js
- `BookRide()` --calls--> `useSocket()`  [EXTRACTED]
  src/Pages/customer/BookRide.jsx → src/Context/SocketContext.jsx
- `DriverRegister()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/driver-auth/DriverRegister.jsx → src/hooks/useAuth.js
- `DriverHome()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/driver/DriverHome.jsx → src/hooks/useAuth.js
- `ProtectedRoute()` --calls--> `useAuth()`  [EXTRACTED]
  src/components/ProtectedRoute.jsx → src/hooks/useAuth.js

## Import Cycles
- None detected.

## Communities (22 total, 4 thin omitted)

### Community 0 - "Skeleton.jsx"
Cohesion: 0.19
Nodes (17): Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), Modal(), Pagination(), SearchBar() (+9 more)

### Community 1 - "useAuth"
Cohesion: 0.08
Nodes (30): App(), Login(), ProtectedRoute(), AuthContext, AuthProvider(), AppContext, AppProvider(), SocketContext (+22 more)

### Community 2 - "App.jsx"
Cohesion: 0.06
Nodes (30): Footer(), ScrollProgress(), ScrollToTopHandler(), About(), features, AdminBookingRequests(), AdminNotifications(), ManageCustomers() (+22 more)

### Community 3 - "CurrentRide.jsx"
Cohesion: 0.11
Nodes (25): ErrorState(), formatTime(), RideTimeline(), STAGES, CardSkeleton(), StatsCard(), useSocket(), AdminDashboard() (+17 more)

### Community 4 - "devDependencies"
Cohesion: 0.07
Nodes (28): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+20 more)

### Community 5 - "dependencies"
Cohesion: 0.07
Nodes (27): axios, framer-motion, @googlemaps/js-api-loader, @heroicons/react, lucide-react, dependencies, axios, framer-motion (+19 more)

### Community 6 - "BookRide.jsx"
Cohesion: 0.12
Nodes (19): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), saveRecentSearches(), saveSavedPlaces(), CHENNAI_CENTER (+11 more)

### Community 7 - "Home.jsx"
Cohesion: 0.11
Nodes (23): Booking(), Hero(), cardHover, GlowBlobs(), Reveal(), SectionHeading(), PopularRoutes(), ROUTES (+15 more)

### Community 8 - "endpoints.js"
Cohesion: 0.12
Nodes (16): ACCEPTED_IMAGE_TYPES, DriverRegister(), validateFile(), ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), api (+8 more)

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

## Knowledge Gaps
- **77 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+72 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `useAuth` to `endpoints.js`, `CurrentRide.jsx`, `Home.jsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _77 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.07505285412262157 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06258890469416785 - nodes in this community are weakly interconnected._
- **Should `CurrentRide.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10661268556005399 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._