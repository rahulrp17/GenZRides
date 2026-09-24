import React from "react";
import DriverBookingFeed from "./DriverBookingFeed";

// Registered-customer bookings awaiting a driver.
const DriverCustomerRequests = () => (
  <DriverBookingFeed
    mode="customer"
    queryKey="driverCustomerRequests"
    storageKey="driverCustomerRequestsView"
    eyebrow="Member requests · registered customers"
    title="Customer Booking Requests"
    subtitle="Registered-customer rides for your cab type. Fresh requests auto-refresh every 10 seconds."
    liveSubtitle="Socket live · polling every 10s as backup"
    actionLabel="View"
    emptyTitle="No customer requests"
    emptyDescription="There are no registered-customer rides for your cab type right now. Check back later."
  />
);

export default DriverCustomerRequests;
