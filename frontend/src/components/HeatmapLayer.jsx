import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

const HeatmapLayer = ({ points, options = {} }) => {
  const map = useMap();

  useEffect(() => {
    if (!points || points.length === 0) return;

    // Create a simple heatmap using circle markers with varying opacity
    const heatmapGroup = L.layerGroup();

    points.forEach(point => {
      const [lat, lng, intensity = 0.5] = point;
      
      // Create multiple circles with different sizes for heat effect
      const baseRadius = options.radius || 50;
      const maxRadius = baseRadius * 2;
      
      for (let i = 0; i < 3; i++) {
        const radius = maxRadius - (i * baseRadius / 3);
        const opacity = (intensity / 3) * (1 - i * 0.3);
        
        const circle = L.circle([lat, lng], {
          radius: radius,
          fillColor: options.gradient?.[i] || '#ff4444',
          color: 'transparent',
          fillOpacity: opacity * 0.3,
          weight: 0
        });
        
        heatmapGroup.addLayer(circle);
      }
    });

    heatmapGroup.addTo(map);

    return () => {
      map.removeLayer(heatmapGroup);
    };
  }, [map, points, options]);

  return null;
};

export default HeatmapLayer;