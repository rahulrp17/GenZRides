import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

/**
 * WhatsApp template deep-link landing.
 * Meta URL buttons append the variable suffix DIRECTLY to the static URL
 * (no separator), and the variable must be last — so actions ride in the
 * path: /admin/booking-action/:action/:id. This just forwards to the
 * details page query form (?action=) which BookingDetailsPage consumes.
 */
const VALID_ACTIONS = new Set(["verify", "cancel"]);

const BookingActionRedirect = () => {
  const { action, id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const safeAction = VALID_ACTIONS.has(action) ? action : null;
    const target = safeAction
      ? `/admin/bookings/${id}?action=${safeAction}`
      : `/admin/bookings/${id}`;
    navigate(target, { replace: true });
  }, [action, id, navigate]);

  return null;
};

export default BookingActionRedirect;
