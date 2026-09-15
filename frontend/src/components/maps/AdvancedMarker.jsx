import { useEffect, useRef } from 'react';

const AdvancedMarker = ({ position, icon, title, map, zIndex }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position?.lat || !position?.lng) return;
    const m = new window.google.maps.marker.AdvancedMarkerElement({
      position: { lat: position.lat, lng: position.lng },
      map,
      title: title || '',
      icon: icon ? { url: icon } : undefined,
      zIndex,
    });
    markerRef.current = m;
    return () => {
      m.map = null;
      markerRef.current = null;
    };
  }, [map, position?.lat, position?.lng, icon, title, zIndex]);

  return null;
};

export default AdvancedMarker;
