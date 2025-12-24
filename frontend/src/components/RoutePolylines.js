/**
 * Route Polylines Component
 * Draws APSRTC bus routes on Leaflet maps with road-snapped waypoints
 * 
 * Usage:
 * import { drawRoutePolylines, drawRouteStops, clearRoutePolylines } from './RoutePolylines';
 * drawRoutePolylines(mapInstance, ['RJ-12', 'RJ-10']); // Draw specific routes
 * drawRoutePolylines(mapInstance); // Draw all routes
 */

import { VIJAYAWADA_ROUTES, getRouteById, getRouteIds, getRoutePolyline } from '../services/VijayawadaRoutes';

// Store polyline references for cleanup
let routePolylines = [];
let stopMarkers = [];

/**
 * Draw route polylines on map
 * @param {Object} map - Leaflet map instance
 * @param {Array} routeIds - Optional array of route IDs to draw (draws all if not specified)
 * @param {Object} options - Styling options
 */
export const drawRoutePolylines = (map, routeIds = null, options = {}) => {
  if (!map || !window.L) {
    console.warn('Map or Leaflet not available');
    return [];
  }

  // Clear existing polylines
  clearRoutePolylines(map);

  const routesToDraw = routeIds || getRouteIds();
  const defaultOptions = {
    weight: 4,
    opacity: 0.7,
    dashArray: null, // Solid line for main routes
    showStops: true
  };
  const opts = { ...defaultOptions, ...options };

  routesToDraw.forEach(routeId => {
    const route = getRouteById(routeId);
    if (!route) return;

    const coordinates = route.waypoints.map(wp => [wp.lat, wp.lng]);
    
    // Create polyline with route color
    const polyline = window.L.polyline(coordinates, {
      color: route.color || '#FF6B35',
      weight: opts.weight,
      opacity: opts.opacity,
      dashArray: opts.dashArray,
      className: `route-polyline route-${routeId}`
    }).addTo(map);

    // Add popup with route info
    polyline.bindPopup(`
      <div style="min-width: 150px; font-family: system-ui;">
        <div style="background: ${route.color}; color: white; padding: 8px; margin: -13px -20px 8px; font-weight: bold;">
          ${routeId}
        </div>
        <div style="padding: 4px;">
          <p style="margin: 4px 0; font-size: 12px;"><strong>${route.name}</strong></p>
          <p style="margin: 4px 0; font-size: 11px;">Distance: ${route.totalDistance} km</p>
          <p style="margin: 4px 0; font-size: 11px;">Avg Time: ${route.avgTripTime} min</p>
        </div>
      </div>
    `);

    routePolylines.push(polyline);
  });

  console.log(`🛣️ Drew ${routePolylines.length} route polylines`);
  return routePolylines;
};

/**
 * Draw bus stop markers on map
 * @param {Object} map - Leaflet map instance
 * @param {Array} routeIds - Optional array of route IDs
 */
export const drawRouteStops = (map, routeIds = null) => {
  if (!map || !window.L) return [];

  // Clear existing stop markers
  clearStopMarkers(map);

  const routesToDraw = routeIds || getRouteIds();
  const drawnStops = new Set(); // Avoid duplicate stops

  routesToDraw.forEach(routeId => {
    const route = getRouteById(routeId);
    if (!route) return;

    route.waypoints
      .filter(wp => wp.stopName)
      .forEach(stop => {
        const stopKey = `${stop.lat}-${stop.lng}`;
        if (drawnStops.has(stopKey)) return;
        drawnStops.add(stopKey);

        const marker = window.L.circleMarker([stop.lat, stop.lng], {
          radius: 6,
          color: route.color || '#3b82f6',
          fillColor: 'white',
          fillOpacity: 1,
          weight: 3
        }).addTo(map);

        marker.bindPopup(`
          <div style="text-align: center; min-width: 120px;">
            <strong style="color: ${route.color};">${stop.stopName}</strong>
            <br><small>Route: ${routeId}</small>
          </div>
        `);

        stopMarkers.push(marker);
      });
  });

  console.log(`🚏 Drew ${stopMarkers.length} stop markers`);
  return stopMarkers;
};

/**
 * Clear all route polylines from map
 */
export const clearRoutePolylines = (map) => {
  routePolylines.forEach(polyline => {
    if (map) map.removeLayer(polyline);
  });
  routePolylines = [];
};

/**
 * Clear all stop markers from map
 */
export const clearStopMarkers = (map) => {
  stopMarkers.forEach(marker => {
    if (map) map.removeLayer(marker);
  });
  stopMarkers = [];
};

/**
 * Draw a single route with highlighted style (for selected bus)
 */
export const highlightRoute = (map, routeId, options = {}) => {
  if (!map || !window.L) return null;

  const route = getRouteById(routeId);
  if (!route) return null;

  const coordinates = route.waypoints.map(wp => [wp.lat, wp.lng]);
  
  const defaultOptions = {
    color: route.color || '#FF6B35',
    weight: 6,
    opacity: 0.9,
    dashArray: null
  };
  const opts = { ...defaultOptions, ...options };

  const polyline = window.L.polyline(coordinates, opts).addTo(map);
  
  // Fit map to route bounds
  if (options.fitBounds !== false) {
    map.fitBounds(polyline.getBounds(), { padding: [50, 50] });
  }

  return polyline;
};

/**
 * Draw delay hotspots on map
 */
export const drawDelayHotspots = (map, hotspots) => {
  if (!map || !window.L) return [];

  const circles = [];
  
  hotspots.forEach(hotspot => {
    const color = hotspot.baseDelay > 6 ? '#ef4444' : 
                  hotspot.baseDelay > 4 ? '#f59e0b' : '#10b981';
    
    const circle = window.L.circle([hotspot.lat, hotspot.lng], {
      radius: 300 + hotspot.baseDelay * 30,
      color: color,
      fillColor: color,
      fillOpacity: 0.25,
      weight: 2
    }).addTo(map);

    circle.bindPopup(`
      <div style="text-align: center;">
        <strong style="color: ${color};">⚠️ ${hotspot.name}</strong>
        <br><small>Avg Delay: +${hotspot.baseDelay} min</small>
      </div>
    `);

    circles.push(circle);
  });

  return circles;
};

/**
 * Create animated bus marker that follows route
 */
export const createAnimatedBusMarker = (map, bus, routeId) => {
  if (!map || !window.L) return null;

  const route = getRouteById(routeId);
  if (!route) return null;

  const color = bus.occupancy_percent > 90 ? '#ef4444' : 
                bus.occupancy_percent > 70 ? '#f59e0b' : '#10b981';

  const icon = window.L.divIcon({
    className: 'animated-bus-marker',
    html: `
      <div style="position: relative;">
        <div style="
          width: 32px;
          height: 32px;
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          transform: rotate(${bus.heading || 0}deg);
          transition: transform 0.5s ease;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
            <path d="M4 16V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>
          </svg>
        </div>
        <div style="
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: #1e3a5f;
          color: white;
          font-size: 9px;
          font-weight: bold;
          padding: 2px 6px;
          border-radius: 4px;
          white-space: nowrap;
        ">${bus.route_id} • ${bus.speed_kmph?.toFixed(0) || 0} km/h</div>
      </div>
    `,
    iconSize: [32, 44],
    iconAnchor: [16, 22]
  });

  return window.L.marker([bus.lat, bus.lon], { icon });
};

export default {
  drawRoutePolylines,
  drawRouteStops,
  clearRoutePolylines,
  clearStopMarkers,
  highlightRoute,
  drawDelayHotspots,
  createAnimatedBusMarker
};
