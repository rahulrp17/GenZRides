const KEY = "guestBookingDraft";

export const saveDraft = (draft) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // storage unavailable — flow continues in-memory via route state
  }
};

export const loadDraft = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const clearDraft = () => {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
};

// Round-trip days derived the same way as the backend:
// ceil((return - pickup) / 1 day), minimum 1.
export const daysBetween = (pickupISO, returnISO) => {
  if (!pickupISO || !returnISO) return 1;
  const diff = new Date(returnISO).getTime() - new Date(pickupISO).getTime();
  if (diff <= 0) return 1;
  return Math.max(1, Math.ceil(diff / (24 * 60 * 60 * 1000)));
};

export const minPickupISO = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 30);
  return d;
};

export const toLocalInputValue = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const h = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${y}-${m}-${day}T${h}:${min}`;
};
