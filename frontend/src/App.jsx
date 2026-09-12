import "./App.css";
import React, { Suspense, lazy } from "react";
import LoadingPage from "./components/shared/LoadingPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./Component/Navbar/Navbar";
import Footer from "./Component/Footer/Footer";
import ScrollProgress from "./Component/ScrollProgress";
import ScrollToTopHandler from "./Component/ScrollToTopHandler";

// Route-level code splitting: each page becomes its own chunk so the
// initial bundle stays lean. Layouts/chrome stay eager (tiny).
const Home = lazy(() => import("./Pages/Home/Home"));
const GuestBookingPage = lazy(() => import("./Pages/guest/GuestBookingPage"));
const CarTypePage = lazy(() => import("./Pages/guest/CarTypePage"));
const ConfirmPage = lazy(() => import("./Pages/guest/ConfirmPage"));
const WaitingPage = lazy(() => import("./Pages/guest/WaitingPage"));
const Login = lazy(() => import("./Component/Login/Login"));
const About = lazy(() => import("./Pages/AboutUs/About"));
const TariffChart = lazy(() => import("./Pages/Tariff_Chart/TariffChart"));
const AttachVehicle = lazy(() => import("./Pages/Vehicles/Vehicles"));
const ContactUs = lazy(() => import("./Pages/Contact_Us/ContactUs"));
const PopularRoutes = lazy(() => import("./Pages/PopularRoutes/PopularRoutes"));
const AirportTransfers = lazy(() => import("./Pages/AirportTransfers/AirportTransfers"));
const Info = lazy(() => import("./Pages/Info/Info"));
const RouteDetail = lazy(() => import("./Pages/RouteDetail/RouteDetail"));
const AirportDetail = lazy(() => import("./Pages/AirportDetail/AirportDetail"));
const InfoDetail = lazy(() => import("./Pages/InfoDetail/InfoDetail"));
const Services = lazy(() => import("./Pages/Services/Services"));
const BookingDetailsPage = lazy(() => import("./Pages/booking/BookingDetailsPage"));

const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const AdminDashboard = lazy(() => import("./Pages/admin/AdminDashboard"));
const ManageCustomers = lazy(() => import("./Pages/admin/ManageCustomers"));
const ManageDrivers = lazy(() => import("./Pages/admin/ManageDrivers"));
const ManageVehicles = lazy(() => import("./Pages/admin/ManageVehicles"));
const ManageBookings = lazy(() => import("./Pages/admin/ManageBookings"));
const AdminBookingRequests = lazy(() => import("./Pages/admin/AdminBookingRequests"));
const ManageWithdrawals = lazy(() => import("./Pages/admin/ManageWithdrawals"));
const ManageReviews = lazy(() => import("./Pages/admin/ManageReviews"));
const AdminNotifications = lazy(() => import("./Pages/admin/AdminNotifications"));

const CustomerLayout = lazy(() => import("./layouts/CustomerLayout"));
const CustomerDashboard = lazy(() => import("./Pages/customer/CustomerDashboard"));
const BookRide = lazy(() => import("./Pages/customer/BookRide"));
const RideHistory = lazy(() => import("./Pages/customer/RideHistory"));
const CurrentRideCustomer = lazy(() => import("./Pages/customer/CurrentRideCustomer"));
const CustomerBookings = lazy(() => import("./Pages/customer/CustomerBookings"));
const Payments = lazy(() => import("./Pages/customer/Payments"));
const WalletPage = lazy(() => import("./Pages/customer/WalletPage"));
const CustomerReviews = lazy(() => import("./Pages/customer/CustomerReviews"));
const Notifications = lazy(() => import("./Pages/customer/Notifications"));
const FavoriteLocations = lazy(() => import("./Pages/customer/FavoriteLocations"));
const Invoices = lazy(() => import("./Pages/customer/Invoices"));
const Profile = lazy(() => import("./Pages/customer/Profile"));

const DriverLayout = lazy(() => import("./layouts/DriverLayout"));
const DriverDashboard = lazy(() => import("./Pages/driver/DriverDashboard"));
const DriverBookings = lazy(() => import("./Pages/driver/DriverBookings"));
const DriverBookingDetail = lazy(() => import("./Pages/driver/DriverBookingDetail"));
const CurrentRide = lazy(() => import("./Pages/driver/CurrentRide"));
const DriverHistory = lazy(() => import("./Pages/driver/DriverHistory"));
const Earnings = lazy(() => import("./Pages/driver/Earnings"));
const DriverWallet = lazy(() => import("./Pages/driver/DriverWallet"));
const DriverReviews = lazy(() => import("./Pages/driver/DriverReviews"));
const DriverNotifications = lazy(() => import("./Pages/driver/DriverNotifications"));
const DriverProfilePage = lazy(() => import("./Pages/driver/DriverProfilePage"));
const DriverDocuments = lazy(() => import("./Pages/driver/DriverDocuments"));

const DriverRegister = lazy(() => import("./Pages/driver-auth/DriverRegister"));
const DriverLogin = lazy(() => import("./Pages/driver-auth/DriverLogin"));
const DriverContinue = lazy(() => import("./Pages/driver-auth/DriverContinue"));
const NotFound = lazy(() => import("./Pages/NotFound"));
const ForgotPassword = lazy(() => import("./Pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./Pages/Auth/ResetPassword"));

const PageFallback = () => <LoadingPage />;

class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="font-display text-2xl font-bold text-white">Something went wrong</p>
          <p className="text-sm text-gray-400">Please refresh the page and try again.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold"
          >
            Refresh
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTopHandler />
      <ScrollProgress />

      <RouteErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Routes>
        {/* Public routes */}
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/booking" element={<GuestBookingPage />} />
        <Route path="/booking/vehicles" element={<CarTypePage />} />
        <Route path="/booking/confirm" element={<ConfirmPage />} />
        <Route path="/booking/waiting" element={<WaitingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/tariff" element={<><Navbar /><TariffChart /><Footer /></>} />
        <Route path="/vehicles" element={<><Navbar /><AttachVehicle /><Footer /></>} />
        <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><ContactUs /><Footer /></>} />
        <Route path="/popular-routes" element={<><Navbar /><PopularRoutes /><Footer /></>} />
        <Route path="/routes/:slug" element={<><Navbar /><RouteDetail /><Footer /></>} />
        <Route path="/airport-transfers" element={<><Navbar /><AirportTransfers /><Footer /></>} />
        <Route path="/airport/:code" element={<><Navbar /><AirportDetail /><Footer /></>} />
        <Route path="/info" element={<><Navbar /><Info /><Footer /></>} />
        <Route path="/info/:topic" element={<><Navbar /><InfoDetail /><Footer /></>} />
        

        {/* Driver auth */}
        <Route path="/driver/continue" element={<><Navbar /><DriverContinue /></>} />
        <Route path="/driver/register" element={<DriverRegister />} />
        <Route path="/driver/login" element={<DriverLogin />} />

        {/* Admin dashboard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="customers" element={<ManageCustomers />} />
          <Route path="drivers" element={<ManageDrivers />} />
          <Route path="vehicles" element={<ManageVehicles />} />
          <Route path="bookings" element={<ManageBookings />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="booking-requests" element={<AdminBookingRequests />} />
          <Route path="withdrawals" element={<ManageWithdrawals />} />
          <Route path="reviews" element={<ManageReviews />} />
          <Route path="notifications" element={<AdminNotifications />} />
        </Route>

        {/* Customer dashboard */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<CustomerDashboard />} />
          <Route path="book" element={<BookRide />} />
          <Route path="current-ride" element={<CurrentRideCustomer />} />
          <Route path="bookings" element={<CustomerBookings />} />
          <Route path="bookings/:id" element={<BookingDetailsPage />} />
          <Route path="history" element={<RideHistory />} />
          <Route path="payments" element={<Payments />} />
          <Route path="wallet" element={<WalletPage />} />
          <Route path="reviews" element={<CustomerReviews />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="favorites" element={<FavoriteLocations />} />
          <Route path="invoices" element={<Invoices />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Driver dashboard */}
        <Route path="/driver" element={<DriverLayout />}>
          <Route index element={<DriverDashboard />} />
          <Route path="bookings" element={<DriverBookings />} />
          <Route path="bookings/:id" element={<DriverBookingDetail />} />
          <Route path="ride" element={<CurrentRide />} />
          <Route path="history" element={<DriverHistory />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="wallet" element={<DriverWallet />} />
          <Route path="reviews" element={<DriverReviews />} />
          <Route path="notifications" element={<DriverNotifications />} />
          <Route path="profile" element={<DriverProfilePage />} />
          <Route path="documents" element={<DriverDocuments />} />
        </Route>
        <Route path="*" element={<><Navbar /><NotFound /><Footer /></>} />
          </Routes>
        </Suspense>
      </RouteErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
