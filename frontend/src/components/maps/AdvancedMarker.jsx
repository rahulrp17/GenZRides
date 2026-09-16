import { useEffect, useRef } from 'react';

const AdvancedMarker = ({ position, icon, title, map, zIndex }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position?.lat || !position?.lng) return;
    const m = new window.google.maps.Marker({
      position: { lat: position.lat, lng: position.lng },
      map,
      title: title || '',
      icon,
      zIndex,
    });
    markerRef.current = m;
    return () => {
      m.setMap(null);
      markerRef.current = null;
    };
  }, [map, position?.lat, position?.lng, title, zIndex]);

  return null;
};

export default AdvancedMarker;
