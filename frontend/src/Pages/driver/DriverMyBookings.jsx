import React from "react";
import DriverBookingFeed from "./DriverBookingFeed";

// Rides assigned to the logged-in driver (upcoming + active + history).
const DriverMyBookings = () => (
  <DriverBookingFeed
    mode="mine"
    queryKey="driverMyBookings"
    storageKey="driverMyBookingsView"
    eyebrow="Assigned to you"
    title="My Bookings"
    subtitle="Every ride assigned to you — upcoming, active, and past."
    liveSubtitle="Socket live · polling every 10s as backup"
    actionLabel="View Details"
    emptyTitle="No bookings assigned yet"
    emptyDescription="Accept a ride from Instant Bookings or Customer Requests and it shows up here."
    showStatus
    gateOnActiveRide={false}
  />
);

export default DriverMyBookings;
