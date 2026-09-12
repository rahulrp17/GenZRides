# Graph Report - frontend  (2026-09-05)

## Corpus Check
- 111 files · ~1,536,475 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 416 nodes · 1080 edges · 24 communities (21 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a2f9138e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- endpoints.js
- useAuth
- SocketContext.jsx
- App.jsx
- devDependencies
- dependencies
- BookRide.jsx
- index.js
- DriverContinue.jsx
- theme.js
- React + Vite
- QueryProvider.jsx
- DriverDocuments.jsx
- CurrentRideCustomer.jsx
- Testiminols.jsx
- GuestBookingForm.jsx
- DriverRegister.jsx

## God Nodes (most connected - your core abstractions)
1. `useAuth()` - 31 edges
2. `EmptyState()` - 24 edges
3. `Reveal()` - 20 edges
4. `TableSkeleton()` - 17 edges
5. `PageHero()` - 16 edges
6. `GlowBlobs()` - 16 edges
7. `ErrorState()` - 16 edges
8. `Pagination()` - 16 edges
9. `cardHover` - 14 edges
10. `Modal()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `Login()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Login/Login.jsx → src/hooks/useAuth.js
- `Navbar()` --calls--> `useAuth()`  [EXTRACTED]
  src/Component/Navbar/Navbar.jsx → src/hooks/useAuth.js
- `SocketProvider()` --calls--> `useAuth()`  [EXTRACTED]
  src/Context/SocketContext.jsx → src/hooks/useAuth.js
- `BookRide()` --calls--> `useSocket()`  [EXTRACTED]
  src/Pages/customer/BookRide.jsx → src/Context/SocketContext.jsx
- `DriverContinue()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/driver-auth/DriverContinue.jsx → src/hooks/useAuth.js

## Import Cycles
- None detected.

## Communities (24 total, 3 thin omitted)

### Community 0 - "endpoints.js"
Cohesion: 0.13
Nodes (28): Badge(), CancelReasonDialog(), DEFAULT_REASONS, ConfirmDialog(), EmptyState(), Modal(), Pagination(), SearchBar() (+20 more)

### Community 1 - "useAuth"
Cohesion: 0.15
Nodes (15): ProtectedRoute(), AuthContext, useAuth(), AdminLayout(), navItems, CustomerLayout(), navItems, DriverLayout() (+7 more)

### Community 2 - "SocketContext.jsx"
Cohesion: 0.23
Nodes (8): App(), AuthProvider(), AppContext, AppProvider(), SocketContext, SocketProvider(), queryClient, authAPI

### Community 3 - "App.jsx"
Cohesion: 0.06
Nodes (32): ScrollProgress(), ScrollToTopHandler(), About(), AdminBookingRequests(), AdminDashboard(), AdminNotifications(), ManageCustomers(), ManageDrivers() (+24 more)

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
Nodes (59): BookingTariff(), tabs, FarePricing(), rows, Footer(), cardHover, PageHero(), GlowBlobs() (+51 more)

### Community 8 - "DriverContinue.jsx"
Cohesion: 0.40
Nodes (4): benefits, DriverContinue(), requirements, steps

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 18 - "DriverDocuments.jsx"
Cohesion: 0.40
Nodes (5): ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments(), validateFile(), driverUploadAPI

### Community 20 - "CurrentRideCustomer.jsx"
Cohesion: 0.11
Nodes (20): ErrorState(), formatTime(), RideTimeline(), STAGES, CardSkeleton(), StatsCard(), useSocket(), ManageBookings() (+12 more)

### Community 22 - "GuestBookingForm.jsx"
Cohesion: 0.18
Nodes (12): Hero(), CarTypePage(), imageFor(), ConfirmPage(), fmtWhen(), GuestBookingForm(), pad(), clearDraft() (+4 more)

### Community 23 - "DriverRegister.jsx"
Cohesion: 0.25
Nodes (7): AUTH_SLIDES, AuthSplit(), Login(), DriverLogin(), ACCEPTED_IMAGE_TYPES, DriverRegister(), validateFile()

## Knowledge Gaps
- **106 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+101 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `devDependencies`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `useAuth` to `SocketContext.jsx`, `index.js`, `DriverContinue.jsx`, `CurrentRideCustomer.jsx`, `DriverRegister.jsx`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _106 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `endpoints.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13169398907103824 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06050420168067227 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._