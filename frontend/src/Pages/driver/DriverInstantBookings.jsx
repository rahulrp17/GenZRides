import React from "react";
import DriverBookingFeed from "./DriverBookingFeed";

// Verified guest (instant) bookings awaiting a driver.
const DriverInstantBookings = () => (
  <DriverBookingFeed
    mode="instant"
    queryKey="driverInstantBookings"
    storageKey="driverInstantBookingsView"
    eyebrow="Instant requests · verified guests"
    title="Instant Customer Bookings"
    subtitle="Verified guest rides for your cab type. Fresh requests auto-refresh every 10 seconds."
    liveSubtitle="Socket live · polling every 10s as backup"
    actionLabel="View & Accept"
    emptyTitle="No instant bookings"
    emptyDescription="There are no verified guest rides for your cab type right now. Check back later."
  />
);

export default DriverInstantBookings;
