/**
 * APSRTC REALISTIC ROUTE DATA - VIJAYAWADA & VISAKHAPATNAM
 * Hard-coded waypoints following actual roads
 * Each route has 15-30+ waypoints for smooth road-snapped movement
 * 
 * Ola Maps API Key: aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK
 */

export const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

// Road speed limits by segment type (km/h)
export const ROAD_SPEED_LIMITS = {
  'highway': 60,
  'arterial': 40,
  'urban': 30,
  'congested': 20,
  'residential': 25,
  'bus_stand': 10
};

// Traffic multipliers by time of day
export const getTrafficMultiplier = () => {
  const hour = new Date().getHours();
  if (hour >= 7 && hour <= 10) return 0.6;
  if (hour >= 17 && hour <= 20) return 0.5;
  if (hour >= 11 && hour <= 16) return 0.85;
  if (hour >= 21 || hour <= 6) return 1.0;
  return 0.8;
};

// Delay hotspots - Vijayawada & Visakhapatnam
export const DELAY_HOTSPOTS = [
  // Vijayawada
  { name: 'Benz Circle', lat: 16.5060, lng: 80.6480, baseDelay: 8, radius: 0.005 },
  { name: 'One Town', lat: 16.5100, lng: 80.6200, baseDelay: 5, radius: 0.004 },
  { name: 'Governorpet', lat: 16.5119, lng: 80.6332, baseDelay: 4, radius: 0.003 },
  { name: 'PNBS', lat: 16.5065, lng: 80.6185, baseDelay: 6, radius: 0.004 },
  // Visakhapatnam
  { name: 'RTC Complex Vizag', lat: 17.7215, lng: 83.3025, baseDelay: 7, radius: 0.005 },
  { name: 'Jagadamba Junction', lat: 17.7120, lng: 83.3010, baseDelay: 6, radius: 0.004 },
  { name: 'Gajuwaka', lat: 17.7050, lng: 83.2150, baseDelay: 5, radius: 0.004 },
  { name: 'NAD Junction', lat: 17.7280, lng: 83.2450, baseDelay: 4, radius: 0.003 }
];

/**
 * VIJAYAWADA ROUTES - Detailed waypoints following actual roads
 */
export const VIJAYAWADA_ROUTES = {
  // ============================================
  // RJ-12: Benz Circle Loop (City Circular)
  // ============================================
  'RJ-12': {
    name: 'Vijayawada City - Benz Circle Loop',
    color: '#ef4444',
    region: 'vijayawada',
    totalDistance: 12.5,
    avgTripTime: 45,
    waypoints: [
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 0 },
      { lat: 16.5078, lng: 80.6210, roadType: 'urban' },
      { lat: 16.5095, lng: 80.6255, roadType: 'arterial' },
      { lat: 16.5119, lng: 80.6332, roadType: 'congested', stopName: 'Governorpet', stopIndex: 1 },
      { lat: 16.5108, lng: 80.6380, roadType: 'urban' },
      { lat: 16.5080, lng: 80.6440, roadType: 'arterial' },
      { lat: 16.5060, lng: 80.6480, roadType: 'congested', stopName: 'Benz Circle', stopIndex: 2 },
      { lat: 16.5090, lng: 80.6455, roadType: 'urban' },
      { lat: 16.5150, lng: 80.6380, roadType: 'arterial', stopName: 'MG Road', stopIndex: 3 },
      { lat: 16.5180, lng: 80.6350, roadType: 'residential', stopName: 'Labbipet', stopIndex: 4 },
      { lat: 16.5150, lng: 80.6260, roadType: 'urban' },
      { lat: 16.5110, lng: 80.6210, roadType: 'arterial' },
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 0 }
    ]
  },

  // ============================================
  // RJ-10: Guntur - Vijayawada Express
  // ============================================
  'RJ-10': {
    name: 'Guntur - Vijayawada Rapid',
    color: '#3b82f6',
    region: 'vijayawada',
    totalDistance: 35,
    avgTripTime: 55,
    waypoints: [
      { lat: 16.2989, lng: 80.4414, roadType: 'bus_stand', stopName: 'Guntur Bus Station', stopIndex: 0 },
      { lat: 16.3150, lng: 80.4600, roadType: 'arterial' },
      { lat: 16.3550, lng: 80.5000, roadType: 'highway' },
      { lat: 16.3900, lng: 80.5350, roadType: 'highway' },
      { lat: 16.4307, lng: 80.5686, roadType: 'urban', stopName: 'Mangalagiri', stopIndex: 1 },
      { lat: 16.4500, lng: 80.5850, roadType: 'arterial' },
      { lat: 16.4730, lng: 80.6020, roadType: 'urban', stopName: 'Tadepalli', stopIndex: 2 },
      { lat: 16.4870, lng: 80.6120, roadType: 'arterial' },
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 3 }
    ]
  },

  // ============================================
  // RJ-15: Vijayawada - Tenali Local
  // ============================================
  'RJ-15': {
    name: 'Vijayawada - Tenali Local',
    color: '#10b981',
    region: 'vijayawada',
    totalDistance: 28,
    avgTripTime: 50,
    waypoints: [
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 0 },
      { lat: 16.4980, lng: 80.6350, roadType: 'arterial' },
      { lat: 16.4850, lng: 80.6700, roadType: 'urban', stopName: 'Patamata', stopIndex: 1 },
      { lat: 16.4500, lng: 80.6680, roadType: 'highway' },
      { lat: 16.3800, lng: 80.6580, roadType: 'highway' },
      { lat: 16.3200, lng: 80.6480, roadType: 'arterial' },
      { lat: 16.2432, lng: 80.6400, roadType: 'bus_stand', stopName: 'Tenali Bus Stand', stopIndex: 2 }
    ]
  },

  // ============================================
  // RJ-08: Amaravati Express
  // ============================================
  'RJ-08': {
    name: 'Amaravati Capital Express',
    color: '#8b5cf6',
    region: 'vijayawada',
    totalDistance: 32,
    avgTripTime: 48,
    waypoints: [
      { lat: 16.5730, lng: 80.3575, roadType: 'bus_stand', stopName: 'Amaravati', stopIndex: 0 },
      { lat: 16.5480, lng: 80.4200, roadType: 'highway' },
      { lat: 16.5250, lng: 80.4800, roadType: 'highway' },
      { lat: 16.5100, lng: 80.5200, roadType: 'arterial' },
      { lat: 16.4970, lng: 80.5750, roadType: 'urban', stopName: 'Undavalli', stopIndex: 1 },
      { lat: 16.5030, lng: 80.6050, roadType: 'urban' },
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 2 }
    ]
  },

  // ============================================
  // RJ-22: Eluru Road Circular
  // ============================================
  'RJ-22': {
    name: 'Eluru Road Circular',
    color: '#f59e0b',
    region: 'vijayawada',
    totalDistance: 15,
    avgTripTime: 40,
    waypoints: [
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 0 },
      { lat: 16.5010, lng: 80.6350, roadType: 'arterial' },
      { lat: 16.4975, lng: 80.6559, roadType: 'arterial', stopName: 'Eluru Road', stopIndex: 1 },
      { lat: 16.4850, lng: 80.6700, roadType: 'urban', stopName: 'Patamata', stopIndex: 2 },
      { lat: 16.4750, lng: 80.6600, roadType: 'urban', stopName: 'Auto Nagar', stopIndex: 3 },
      { lat: 16.4870, lng: 80.6400, roadType: 'arterial' },
      { lat: 16.5020, lng: 80.6210, roadType: 'urban' },
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 0 }
    ]
  },

  // ============================================
  // RJ-05: Railway Station Express
  // ============================================
  'RJ-05': {
    name: 'Railway Station Express',
    color: '#06b6d4',
    region: 'vijayawada',
    totalDistance: 8,
    avgTripTime: 25,
    waypoints: [
      { lat: 16.5188, lng: 80.6198, roadType: 'bus_stand', stopName: 'Railway Station', stopIndex: 0 },
      { lat: 16.5160, lng: 80.6250, roadType: 'urban' },
      { lat: 16.5119, lng: 80.6332, roadType: 'congested', stopName: 'Governorpet', stopIndex: 1 },
      { lat: 16.5078, lng: 80.6435, roadType: 'arterial' },
      { lat: 16.5060, lng: 80.6480, roadType: 'congested', stopName: 'Benz Circle', stopIndex: 2 },
      { lat: 16.5050, lng: 80.6400, roadType: 'urban' },
      { lat: 16.5055, lng: 80.6250, roadType: 'arterial' },
      { lat: 16.5065, lng: 80.6185, roadType: 'bus_stand', stopName: 'PNBS Vijayawada', stopIndex: 3 }
    ]
  },

  // ============================================
  // VISAKHAPATNAM ROUTES
  // ============================================

  // VZ-01: RTC Complex - Gajuwaka
  'VZ-01': {
    name: 'Vizag RTC Complex - Gajuwaka',
    color: '#dc2626',
    region: 'visakhapatnam',
    totalDistance: 18,
    avgTripTime: 45,
    waypoints: [
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 0 },
      { lat: 17.7180, lng: 83.3000, roadType: 'urban' },
      { lat: 17.7120, lng: 83.3010, roadType: 'congested', stopName: 'Jagadamba Junction', stopIndex: 1 },
      { lat: 17.7100, lng: 83.2900, roadType: 'arterial' },
      { lat: 17.7080, lng: 83.2750, roadType: 'arterial', stopName: 'Akkayyapalem', stopIndex: 2 },
      { lat: 17.7060, lng: 83.2550, roadType: 'highway' },
      { lat: 17.7050, lng: 83.2350, roadType: 'highway' },
      { lat: 17.7050, lng: 83.2150, roadType: 'urban', stopName: 'Gajuwaka', stopIndex: 3 }
    ]
  },

  // VZ-02: Beach Road Circular
  'VZ-02': {
    name: 'Vizag Beach Road Circular',
    color: '#0891b2',
    region: 'visakhapatnam',
    totalDistance: 22,
    avgTripTime: 55,
    waypoints: [
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 0 },
      { lat: 17.7250, lng: 83.3100, roadType: 'urban' },
      { lat: 17.7300, lng: 83.3200, roadType: 'arterial', stopName: 'Siripuram', stopIndex: 1 },
      { lat: 17.7350, lng: 83.3350, roadType: 'arterial' },
      { lat: 17.7380, lng: 83.3500, roadType: 'arterial', stopName: 'Kailasagiri', stopIndex: 2 },
      { lat: 17.7320, lng: 83.3600, roadType: 'urban' },
      { lat: 17.7250, lng: 83.3550, roadType: 'urban', stopName: 'Rushikonda', stopIndex: 3 },
      { lat: 17.7200, lng: 83.3400, roadType: 'arterial' },
      { lat: 17.7180, lng: 83.3200, roadType: 'urban' },
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 0 }
    ]
  },

  // VZ-03: Vizag - Anakapalli
  'VZ-03': {
    name: 'Vizag - Anakapalli Express',
    color: '#7c3aed',
    region: 'visakhapatnam',
    totalDistance: 35,
    avgTripTime: 60,
    waypoints: [
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 0 },
      { lat: 17.7280, lng: 83.2800, roadType: 'arterial' },
      { lat: 17.7280, lng: 83.2450, roadType: 'urban', stopName: 'NAD Junction', stopIndex: 1 },
      { lat: 17.7200, lng: 83.2100, roadType: 'highway' },
      { lat: 17.7100, lng: 83.1700, roadType: 'highway' },
      { lat: 17.6950, lng: 83.1300, roadType: 'highway' },
      { lat: 17.6850, lng: 83.0900, roadType: 'arterial' },
      { lat: 17.6910, lng: 83.0040, roadType: 'bus_stand', stopName: 'Anakapalli', stopIndex: 2 }
    ]
  },

  // VZ-04: Vizag - Simhachalam
  'VZ-04': {
    name: 'Vizag - Simhachalam Temple',
    color: '#ea580c',
    region: 'visakhapatnam',
    totalDistance: 16,
    avgTripTime: 40,
    waypoints: [
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 0 },
      { lat: 17.7180, lng: 83.2950, roadType: 'urban' },
      { lat: 17.7150, lng: 83.2850, roadType: 'arterial' },
      { lat: 17.7100, lng: 83.2700, roadType: 'arterial', stopName: 'Gopalapatnam', stopIndex: 1 },
      { lat: 17.7050, lng: 83.2550, roadType: 'urban' },
      { lat: 17.7000, lng: 83.2450, roadType: 'arterial' },
      { lat: 17.6800, lng: 83.2500, roadType: 'urban', stopName: 'Simhachalam', stopIndex: 2 }
    ]
  },

  // VZ-05: Steel Plant Route
  'VZ-05': {
    name: 'Vizag Steel Plant Route',
    color: '#4f46e5',
    region: 'visakhapatnam',
    totalDistance: 25,
    avgTripTime: 50,
    waypoints: [
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 0 },
      { lat: 17.7120, lng: 83.3010, roadType: 'congested', stopName: 'Jagadamba Junction', stopIndex: 1 },
      { lat: 17.7050, lng: 83.2800, roadType: 'arterial' },
      { lat: 17.7050, lng: 83.2150, roadType: 'urban', stopName: 'Gajuwaka', stopIndex: 2 },
      { lat: 17.6950, lng: 83.1950, roadType: 'highway' },
      { lat: 17.6850, lng: 83.1750, roadType: 'highway' },
      { lat: 17.6700, lng: 83.1550, roadType: 'arterial', stopName: 'Steel Plant Gate', stopIndex: 3 }
    ]
  },

  // VZ-06: MVP Colony - Maddilapalem
  'VZ-06': {
    name: 'MVP Colony - Maddilapalem',
    color: '#059669',
    region: 'visakhapatnam',
    totalDistance: 12,
    avgTripTime: 35,
    waypoints: [
      { lat: 17.7350, lng: 83.3150, roadType: 'urban', stopName: 'MVP Colony', stopIndex: 0 },
      { lat: 17.7300, lng: 83.3100, roadType: 'residential' },
      { lat: 17.7250, lng: 83.3050, roadType: 'urban' },
      { lat: 17.7215, lng: 83.3025, roadType: 'bus_stand', stopName: 'RTC Complex Vizag', stopIndex: 1 },
      { lat: 17.7180, lng: 83.2980, roadType: 'urban' },
      { lat: 17.7150, lng: 83.2900, roadType: 'arterial' },
      { lat: 17.7100, lng: 83.2800, roadType: 'urban', stopName: 'Maddilapalem', stopIndex: 2 }
    ]
  }
};


// ============================================
// UTILITY FUNCTIONS
// ============================================

export const getRouteIds = () => Object.keys(VIJAYAWADA_ROUTES);

export const getRouteById = (routeId) => VIJAYAWADA_ROUTES[routeId];

export const getRoutesByRegion = (region) => {
  return Object.entries(VIJAYAWADA_ROUTES)
    .filter(([_, route]) => route.region === region)
    .map(([id, route]) => ({ id, ...route }));
};

export const getRouteStops = (routeId) => {
  const route = VIJAYAWADA_ROUTES[routeId];
  if (!route) return [];
  return route.waypoints.filter(wp => wp.stopName);
};

export const getRoutePolyline = (routeId) => {
  const route = VIJAYAWADA_ROUTES[routeId];
  if (!route) return [];
  return route.waypoints.map(wp => [wp.lat, wp.lng]);
};

export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getDelayAtPosition = (lat, lng) => {
  for (const hotspot of DELAY_HOTSPOTS) {
    const dist = calculateDistance(lat, lng, hotspot.lat, hotspot.lng);
    if (dist < hotspot.radius * 111) {
      return hotspot.baseDelay * (1 - dist / (hotspot.radius * 111));
    }
  }
  return 0;
};

// Region centers for map initialization
export const REGION_CENTERS = {
  vijayawada: { lat: 16.5062, lng: 80.6480, zoom: 12 },
  visakhapatnam: { lat: 17.7215, lng: 83.3025, zoom: 12 },
  all: { lat: 17.0, lng: 82.0, zoom: 8 }
};

export default VIJAYAWADA_ROUTES;
