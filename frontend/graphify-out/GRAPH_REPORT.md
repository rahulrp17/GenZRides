# Graph Report - frontend  (2026-09-23)

## Corpus Check
- 165 files · ~2,644,555 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 775 nodes · 2172 edges · 50 communities (39 shown, 11 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3e26ce1d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- endpoints.js
- useAuth
- Home.jsx
- App.jsx
- devDependencies
- dependencies
- RideMap.jsx
- breadcrumbJsonLd
- api.js
- theme.js
- React + Vite
- QueryProvider.jsx
- DriverRegister.jsx
- useRideTime
- Testiminols.jsx
- CarTypePage.jsx
- GuestBookingForm.jsx
- AuthSplit.jsx
- RouteErrorBoundary
- StructuredData.js
- DriverDashboard.jsx
- main.jsx
- AdminCharts.jsx
- analytics.js
- useSocket
- SEO.jsx
- index.js
- AIAssistant.jsx
- Login.jsx
- formatTripDuration
- NotFound.jsx
- LoadingPage.jsx
- StickyMobileCTA.jsx
- vercel.json
- DriverProfilePage.jsx
- ConfirmPage.jsx
- BookRide.jsx
- LocationPicker.jsx
- refresh-sitemap.mjs
- DriverCustomerRequests.jsx
- DriverInstantBookings.jsx
- DriverMyBookings.jsx

## God Nodes (most connected - your core abstractions)
1. `useSocket()` - 45 edges
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
- `AdminProfile()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/admin/AdminProfile.jsx → src/hooks/useAuth.js
- `CustomerDashboard()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/customer/CustomerDashboard.jsx → src/hooks/useAuth.js
- `Profile()` --calls--> `useAuth()`  [EXTRACTED]
  src/Pages/customer/Profile.jsx → src/hooks/useAuth.js

## Import Cycles
- None detected.

## Communities (50 total, 11 thin omitted)

### Community 0 - "endpoints.js"
Cohesion: 0.06
Nodes (63): AdminDashboard, CurrentRide, CurrentRideCustomer, CustomerDashboard, AdvancedMarker(), Badge(), CancelReasonDialog(), DEFAULT_REASONS (+55 more)

### Community 1 - "useAuth"
Cohesion: 0.08
Nodes (45): AdminLayout, CustomerLayout, DriverContinue, DriverLayout, DriverLogin, AutoPushSync(), DriverLocationSharer(), movedMeters() (+37 more)

### Community 2 - "Home.jsx"
Cohesion: 0.09
Nodes (22): Home, BookingTariff(), RULES, TABS, FarePricing(), rows, AirportTransfers(), PopularRoutes() (+14 more)

### Community 3 - "App.jsx"
Cohesion: 0.05
Nodes (42): About, AdminCustomerBookingRequests, AdminCustomerBookings, AdminInstantBookingRequests, AdminInstantBookings, AdminNotifications, AdminVisitors, AirportDetail (+34 more)

### Community 4 - "devDependencies"
Cohesion: 0.06
Nodes (31): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, devDependencies, eslint, @eslint/js (+23 more)

### Community 5 - "dependencies"
Cohesion: 0.05
Nodes (41): axios, dompurify, framer-motion, lucide-react, @mantine/core, @mantine/dates, @mantine/hooks, dependencies (+33 more)

### Community 6 - "RideMap.jsx"
Cohesion: 0.19
Nodes (9): CHENNAI_CENTER, decodePolyline(), mapContainerStyle, mapOptions, RideMap(), RideMap, mapsAPI, GOOGLE_MAPS_KEY (+1 more)

### Community 7 - "breadcrumbJsonLd"
Cohesion: 0.10
Nodes (24): PageHero(), AirportDetail(), AIRPORTS, AirportTransfers(), PERKS, ContactUs(), FAQS, faqJsonLd (+16 more)

### Community 8 - "api.js"
Cohesion: 0.25
Nodes (5): api, AUTH_PATHS, failedQueue, isAuthPage(), redirectToLoginIfNeeded()

### Community 9 - "theme.js"
Cohesion: 0.40
Nodes (3): btn, glass, glow

### Community 18 - "DriverRegister.jsx"
Cohesion: 0.20
Nodes (10): DriverDocuments, DriverRegister, ACCEPTED_IMAGE_TYPES, DriverRegister(), validateFile(), ACCEPTED_IMAGE_TYPES, documentTypes, DriverDocuments() (+2 more)

### Community 20 - "useRideTime"
Cohesion: 0.31
Nodes (8): formatElapsed(), getRideTimeInfo(), toMs(), useRideTime(), CurrentRideCustomer(), decodePolyline(), CurrentRide(), decodePolyline()

### Community 22 - "CarTypePage.jsx"
Cohesion: 0.14
Nodes (19): Footer(), DASHBOARD_ROUTES, Navbar(), NOTIF_ROUTES, PROFILE_ROUTES, CANCELLABLE, fmtWhen(), formatCurrency() (+11 more)

### Community 23 - "GuestBookingForm.jsx"
Cohesion: 0.12
Nodes (12): Hero(), ROUTE_TICKER, ROUTE_TICKER, CHENNAI_AIRPORT, DateTimeField(), GuestBookingForm(), mantineInputStyles, pad() (+4 more)

### Community 24 - "AuthSplit.jsx"
Cohesion: 0.14
Nodes (7): ForgotPassword, NewPassword, OtpVerification, ResetPassword, AUTH_SLIDES, AuthSplit(), passwordRules

### Community 26 - "StructuredData.js"
Cohesion: 0.16
Nodes (9): About(), features, pillars, stats, values, businessJsonLd, organizationJsonLd, PRODUCTION_ORIGIN (+1 more)

### Community 27 - "DriverDashboard.jsx"
Cohesion: 0.16
Nodes (8): DriverDashboard, COLORS, DriverCharts, DriverPie, RATE_COLORS, DriverCharts, DriverDashboard(), DriverPie

### Community 28 - "main.jsx"
Cohesion: 0.19
Nodes (9): App(), AuthContext, AuthProvider(), AppContext, AppProvider(), NOTE: no mount-time profile fetch here on purpose — AuthContext, queryClient, theme (+1 more)

### Community 29 - "AdminCharts.jsx"
Cohesion: 0.25
Nodes (3): BAR_COLORS, COLORS, AdminCharts

### Community 30 - "analytics.js"
Cohesion: 0.38
Nodes (7): RouteTracker(), CookieBanner(), getConsent(), hasConsented(), initGA(), setConsent(), trackPageview()

### Community 31 - "useSocket"
Cohesion: 0.15
Nodes (36): AssignDriverDialog(), GlassTable(), useSocket(), useDebounce(), AdminCustomerBookingRequests(), AdminInstantBookingRequests(), REJECT_REASONS, AdminInstantBookings() (+28 more)

### Community 32 - "SEO.jsx"
Cohesion: 0.24
Nodes (11): getOrigin(), normalizePath(), SEO(), upsertJsonLd(), upsertLink(), upsertMeta(), imageForVehicle(), notes (+3 more)

### Community 33 - "index.js"
Cohesion: 0.18
Nodes (16): AIRPORTS, cardHover, GlowBlobs(), Reveal(), SectionHeading(), ROUTES, STEPS, WHY (+8 more)

### Community 34 - "AIAssistant.jsx"
Cohesion: 0.50
Nodes (4): AIAssistant(), formatReply(), SUGGESTED_PROMPTS, aiAPI

### Community 35 - "Login.jsx"
Cohesion: 0.67
Nodes (3): Login, getAuthErrorMessage(), Login()

### Community 36 - "formatTripDuration"
Cohesion: 0.17
Nodes (17): DriverBookingDetail, cardVariants, containerVariants, formatCurrency(), perKmLabel(), vehicleImageFor(), VehicleSelector(), AdminCustomerBookings() (+9 more)

### Community 42 - "DriverProfilePage.jsx"
Cohesion: 0.14
Nodes (17): AdminProfile, DriverProfilePage, Profile, ACCENT_BTN, ACCENT_RING, EditProfileModal(), ACCENTS, ProfileCard() (+9 more)

### Community 43 - "ConfirmPage.jsx"
Cohesion: 0.20
Nodes (12): ConfirmPage, FareNotes(), NOTES, CarTypePage(), imageFor(), ConfirmPage(), fmtWhen(), formatCurrency() (+4 more)

### Community 44 - "BookRide.jsx"
Cohesion: 0.24
Nodes (14): BookRide, BookRide(), DateTimeField(), fmtWhen(), formatCurrency(), getMinDateTime(), mantineInputStyles, minPickupDate() (+6 more)

### Community 45 - "LocationPicker.jsx"
Cohesion: 0.26
Nodes (12): addRecentSearch(), CHENNAI_AIRPORT, loadRecentSearches(), loadSavedPlaces(), LocationPicker(), SavedPlaceButton(), saveRecentSearches(), saveSavedPlaces() (+4 more)

### Community 46 - "refresh-sitemap.mjs"
Cohesion: 0.33
Nodes (5): file, root, today, updated, xml

## Knowledge Gaps
- **170 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuth()` connect `useAuth` to `endpoints.js`, `Login.jsx`, `formatTripDuration`, `DriverProfilePage.jsx`, `BookRide.jsx`, `DriverRegister.jsx`, `CarTypePage.jsx`, `DriverDashboard.jsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `useSocket()` connect `useSocket` to `endpoints.js`, `useAuth`, `formatTripDuration`, `BookRide.jsx`, `useRideTime`, `CarTypePage.jsx`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **Why does `SEO()` connect `SEO.jsx` to `useAuth`, `index.js`, `Login.jsx`, `Home.jsx`, `NotFound.jsx`, `breadcrumbJsonLd`, `ConfirmPage.jsx`, `DriverRegister.jsx`, `CarTypePage.jsx`, `AuthSplit.jsx`, `StructuredData.js`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _170 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `endpoints.js` be split into smaller, more focused modules?**
  _Cohesion score 0.05925081897165646 - nodes in this community are weakly interconnected._
- **Should `useAuth` be split into smaller, more focused modules?**
  _Cohesion score 0.08306010928961749 - nodes in this community are weakly interconnected._
- **Should `Home.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08994708994708994 - nodes in this community are weakly interconnected._