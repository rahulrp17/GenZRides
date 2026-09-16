import { useState, useEffect } from "react";

/**
 * Returns a debounced copy of `value` — updates only after `delay` ms with
 * no new changes. Feed the debounced value (not the raw input) into React
 * Query keys so typing in a search box doesn't fire a request per keystroke.
 */
const useDebounce = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

export default useDebounce;
