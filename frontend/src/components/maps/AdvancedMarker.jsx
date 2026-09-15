import { useEffect, useRef } from 'react';

const AdvancedMarker = ({ position, icon, title, map, zIndex }) => {
  const markerRef = useRef(null);

  useEffect(() => {
    if (!map || !position?.lat || !position?.lng) return;
    const content = icon ? document.createElement('img') : undefined;
    if (content) {
      content.src = icon;
      content.style.width = '32px';
      content.style.height = '42px';
      content.style.objectFit = 'contain';
    }
    const m = new window.google.maps.marker.AdvancedMarkerElement({
      position: { lat: position.lat, lng: position.lng },
      map,
      title: title || '',
      content,
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
