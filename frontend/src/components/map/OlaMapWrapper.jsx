// OlaMapWrapper.jsx
// A single Ola Maps wrapper for all map usage in the dashboard
import React, { useRef, useEffect, useState } from 'react';

// Ensure Ola Maps JS SDK is loaded (assume global OlaMaps)
// If not, you must add <script src="https://cdn.olamaps.io/sdk/v1/olamaps.js"></script> in public/index.html

const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

export default function OlaMapWrapper({
  center = { lat: 16.506, lng: 80.648 },
  zoom = 12,
  markers = [], // [{ id, lat, lng, ... }]
  // polylines and other overlays are ignored for now for minimal robust setup
  onBusClick,
  onReady,
  onViewChange,
  children
}) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const [styleLoaded, setStyleLoaded] = useState(false);
  const userInteractedRef = useRef(false);
  // --- Minimal robust GeoJSON for buses ---
  // Convert markers to GeoJSON FeatureCollection
  const getBusGeoJSON = () => ({
    type: 'FeatureCollection',
    features: (markers || []).map(m => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: { ...m }
    }))
  });

  // Initialize Ola Map ONCE
  useEffect(() => {
    const SDK = window.olaMaps || window.OlaMaps;
    if (!SDK) {
      console.error('Ola Maps SDK not loaded – check index.html script tag');
      return;
    }
    if (!mapRef.current && containerRef.current) {
      const ola = new SDK({ apiKey: OLA_MAPS_API_KEY });
      mapRef.current = ola.init({
        container: containerRef.current,
        center,
        zoom,
      });
      if (onReady) onReady(mapRef.current);
      if (onViewChange && mapRef.current) {
        mapRef.current.on('moveend', () => {
          const c = mapRef.current.getCenter();
          const z = mapRef.current.getZoom();
          onViewChange({ center: c, zoom: z });
        });
        mapRef.current.on('zoomend', () => {
          const c = mapRef.current.getCenter();
          const z = mapRef.current.getZoom();
          onViewChange({ center: c, zoom: z });
        });
      }
      mapRef.current.on('style.load', () => {
        const map = mapRef.current;
        // Remove demo/example 3D layers and sources if present
        ['3d_model_data', '3d_model'].forEach(layerId => {
          if (map.getLayer && map.getLayer(layerId)) {
            try { map.removeLayer(layerId); } catch (e) { /* ignore */ }
          }
        });
        // Remove all layers using 'vectordata' before removing the source (reverse order for safety)
        if (map.getStyle && map.getStyle().layers) {
          const layers = map.getStyle().layers;
          for (let i = layers.length - 1; i >= 0; i--) {
            const layer = layers[i];
            if (layer.source === 'vectordata') {
              try { map.removeLayer(layer.id); } catch (e) { /* ignore */ }
            }
          }
        }
        // Remove sources (if present)
        ['vectordata', '3d_model'].forEach(sourceId => {
          if (map.getSource && map.getSource(sourceId)) {
            try { map.removeSource(sourceId); } catch (e) { /* ignore */ }
          }
        });
        // Listen for styleimagemissing and add bus-icon if needed
        if (map.on) {
          map.on('styleimagemissing', (e) => {
            if (e && e.id === 'bus-icon' && map.hasImage && !map.hasImage('bus-icon')) {
              const svg = `<svg width='32' height='32' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'><rect x='4' y='8' width='24' height='12' rx='3' fill='%233b82f6'/><rect x='7' y='11' width='18' height='6' rx='2' fill='white'/><circle cx='9' cy='22' r='2' fill='black'/><circle cx='23' cy='22' r='2' fill='black'/></svg>`;
              const img = new window.Image();
              img.onload = function() {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                try {
                  map.addImage('bus-icon', imageData, { pixelRatio: 2 });
                } catch (e) { /* ignore */ }
              };
              img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
            }
          });
        }
        // Prevent infinite update loop
        setStyleLoaded(prev => prev === true ? true : true);
      });
      if (mapRef.current.isStyleLoaded && mapRef.current.isStyleLoaded()) {
        setStyleLoaded(prev => prev ? prev : true);
      }
    }
  }, [center, zoom, onReady, onViewChange]);

  // Track user interaction to prevent auto-resetting center/zoom
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const setUserInteracted = () => { userInteractedRef.current = true; };
    map.on('zoomstart', setUserInteracted);
    map.on('movestart', setUserInteracted);
    return () => {
      map.off('zoomstart', setUserInteracted);
      map.off('movestart', setUserInteracted);
    };
  }, []);

  // On initial mount only, set center/zoom
  useEffect(() => {
    if (!mapRef.current) return;
    if (!userInteractedRef.current) {
      mapRef.current.setCenter(center);
      mapRef.current.setZoom(zoom);
    }
    // Do NOT update center/zoom on every render or marker update
    // Only update on explicit user action (e.g. fit-to-bounds button)
  }, []);

  // Load bus icons on map load (high-quality PNGs)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const loadBusIcons = () => {
      // Always use an absolute, encoded URL for the icon
      let iconPath = '/icons/BUS ICON - 1.png';
      // Only encode the path part, not the origin
      let encodedPath = iconPath.split('/').map(encodeURIComponent).join('/');
      // Remove double-encoding of slashes
      encodedPath = encodedPath.replace(/%2F/g, '/');
      let iconUrl = window.location.origin + encodedPath;
      console.log('OlaMapWrapper: Loading bus icon from', iconUrl);
      if (!map.hasImage('bus-default')) {
        map.loadImage(iconUrl, (err, image) => {
          if (err) {
            console.error('OlaMapWrapper: Failed to load bus icon', iconUrl, err);
            return;
          }
          if (!image) {
            console.error('OlaMapWrapper: No image loaded for', iconUrl);
            return;
          }
          if (!map.hasImage('bus-default')) {
            try {
              map.addImage('bus-default', image);
            } catch (e) {
              console.error('OlaMapWrapper: addImage error', e);
            }
          }
        });
      }
    };
    map.on('load', loadBusIcons);
    // If already loaded, call immediately
    if (map.isStyleLoaded && map.isStyleLoaded()) loadBusIcons();
    return () => { map.off('load', loadBusIcons); };
  }, []);

  // Add buses source/layer ONCE after style loaded
  useEffect(() => {
    if (!mapRef.current || !styleLoaded) return;
    const map = mapRef.current;
    // Add buses source if not present
    if (!map.getSource('buses')) {
      try {
        map.addSource('buses', {
          type: 'geojson',
          data: getBusGeoJSON()
        });
      } catch (e) {
        console.error('OlaMapWrapper: addSource error', e);
      }
    }
    // Add buses-layer if not present
    if (!map.getLayer('buses-layer')) {
      try {
        map.addLayer({
          id: 'buses-layer',
          type: 'symbol',
          source: 'buses',
          layout: {
            'icon-image': 'bus-default',
            'icon-size': 0.8,
            'icon-allow-overlap': true,
            'icon-rotate': ['get', 'heading']
          },
          paint: {}
        });
      } catch (e) {
        console.error('OlaMapWrapper: addLayer error', e);
      }
    }
  }, [styleLoaded]);

  // Update buses GeoJSON data on marker change
  useEffect(() => {
    if (!mapRef.current || !styleLoaded) return;
    const src = mapRef.current.getSource && mapRef.current.getSource('buses');
    if (src && src.setData) {
      try {
        src.setData(getBusGeoJSON());
      } catch (e) {
        console.error('OlaMapWrapper: setData error', e);
      }
    }
  }, [markers, styleLoaded]);

  // Resize logic (call on window resize)
  useEffect(() => {
    if (!mapRef.current) return;
    const handleResize = () => mapRef.current.resize && mapRef.current.resize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      {/* Ola Map renders here */}
      {children}
    </div>
  );
}
