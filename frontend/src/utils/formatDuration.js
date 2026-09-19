// Trip-duration display: minutes below an hour, hours (plus minutes) once
// the trip is 60+ minutes — e.g. 45 min, 1h, 1h 30m, 2h 45m.
// Used everywhere a route/booking duration is shown (guest + customer +
// admin + driver) so long trips read naturally in hours.
export const formatTripDuration = (minutes) => {
  const n = Number(minutes);
  if (!Number.isFinite(n) || n < 0) return "—";
  const total = Math.round(n);
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};