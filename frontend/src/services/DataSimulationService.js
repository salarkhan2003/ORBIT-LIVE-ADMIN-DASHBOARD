/**
 * APSRTC Control Room - Real-time Data Simulation Service
 * Generates realistic live telemetry data for the hackathon demo
 * NOW WITH ROAD-SNAPPED MOVEMENT - Buses follow actual Vijayawada roads!
 */

import { db, ref, set, update, push } from '../lib/firebase';
import {
  VIJAYAWADA_ROUTES,
  getRouteById,
  getRouteIds,
  getRoutePolyline,
  ROAD_SPEED_LIMITS,
  getTrafficMultiplier,
  DELAY_HOTSPOTS
} from './VijayawadaRoutes';
import {
  RoadSnappedBus,
  RoadSnappedFleet,
  roadSnappedFleet,
  calculateRoadSnappedPosition,
  calculateHeading
} from './RoadSnappedMovement';

// Ola Maps API Key
export const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

// Re-export road-snapped utilities
export {
  VIJAYAWADA_ROUTES,
  getRouteById,
  getRouteIds,
  getRoutePolyline,
  ROAD_SPEED_LIMITS,
  DELAY_HOTSPOTS,
  RoadSnappedBus,
  RoadSnappedFleet,
  roadSnappedFleet,
  calculateRoadSnappedPosition,
  calculateHeading
};

// APSRTC Route definitions - Now using detailed waypoints from VijayawadaRoutes.js
// Legacy format for backward compatibility
export const APSRTC_ROUTES = Object.fromEntries(
  getRouteIds().map(routeId => {
    const route = getRouteById(routeId);
    const stops = route.waypoints
      .filter(wp => wp.stopName)
      .map((wp, idx) => ({
        id: `S${idx + 1}`,
        name: wp.stopName,
        lat: wp.lat,
        lon: wp.lng
      }));
    
    return [routeId, {
      name: route.name,
      stops,
      depot: routeId.includes('18') ? 'Guntur' : routeId.includes('15') ? 'Tenali' : 'Vijayawada',
      avgTrips: Math.floor(route.avgTripTime ? 480 / route.avgTripTime : 30),
      capacity: 52,
      color: route.color,
      totalDistance: route.totalDistance,
      avgTripTime: route.avgTripTime,
      waypoints: route.waypoints // Include full waypoints for road-snapped movement
    }];
  })
);

// Driver names for simulation
const DRIVER_NAMES = [
  'Ravi Kumar', 'Srinivas Rao', 'Venkata Ramana', 'Krishna Murthy',
  'Suresh Babu', 'Ramesh Chandra', 'Vijay Kumar', 'Mahesh Reddy',
  'Narayana Swamy', 'Prakash Rao', 'Subba Rao', 'Lakshmi Naidu',
  'Anand Kumar', 'Bhaskar Rao', 'Chandra Sekhar', 'Durga Prasad'
];

// Conductor names
const CONDUCTOR_NAMES = [
  'Satish Kumar', 'Praveen Kumar', 'Anil Kumar', 'Rajesh Babu',
  'Mohan Rao', 'Sekhar Babu', 'Harish Kumar', 'Sunil Reddy'
];

// Generate vehicle ID
const generateVehicleId = (routeId, index) => {
  const num = String(800 + index).padStart(3, '0');
  return `AP39TB${num}`;
};

// Get random item from array
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Get random number between min and max
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Calculate GPS position along route using ROAD-SNAPPED waypoints
const interpolatePosition = (stops, progress) => {
  // This is now a legacy function - use calculateRoadSnappedPosition instead
  // Keeping for backward compatibility
  const totalSegments = stops.length - 1;
  const segmentIndex = Math.min(Math.floor(progress * totalSegments), totalSegments - 1);
  const segmentProgress = (progress * totalSegments) - segmentIndex;

  const start = stops[segmentIndex];
  const end = stops[Math.min(segmentIndex + 1, stops.length - 1)];

  // Smooth interpolation without random jitter for road-snapped movement
  const lat = start.lat + (end.lat - start.lat) * segmentProgress;
  const lon = start.lon + (end.lon - start.lon) * segmentProgress;

  return { lat, lon };
};

// Calculate heading based on movement direction (legacy)
const calculateHeadingLegacy = (prevLat, prevLon, currLat, currLon) => {
  const dLon = currLon - prevLon;
  const dLat = currLat - prevLat;
  let heading = Math.atan2(dLon, dLat) * (180 / Math.PI);
  if (heading < 0) heading += 360;
  return Math.round(heading);
};

// Generate simulated vehicles using ROAD-SNAPPED movement
export const generateSimulatedVehicles = (count = 50) => {
  const vehicles = [];
  const routeIds = getRouteIds();

  for (let i = 0; i < count; i++) {
    const routeId = routeIds[i % routeIds.length];
    const vehicleId = generateVehicleId(routeId, i);
    const route = getRouteById(routeId);
    
    // Random starting position along route (0-1 progress)
    const progress = Math.random();
    
    // Get road-snapped position
    const position = calculateRoadSnappedPosition(routeId, progress);
    
    if (!position) continue;

    // Simulate occupancy (more during peak hours)
    const hour = new Date().getHours();
    const isPeakHour = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    const baseOccupancy = isPeakHour ? 0.7 : 0.4;
    const occupancy = Math.min(1, baseOccupancy + (Math.random() * 0.3));
    const capacity = 52;
    const currentPassengers = Math.floor(capacity * occupancy);
    const seatsAvailable = capacity - currentPassengers;

    // Delay based on position (hotspots add delay)
    let delaySeconds = Math.round(position.delayMinutes * 60);
    if (Math.random() > 0.7) {
      delaySeconds += randomBetween(60, 300);
    }

    vehicles.push({
      vehicle_id: vehicleId,
      route_id: routeId,
      route_name: route?.name || 'Unknown',
      depot: APSRTC_ROUTES[routeId]?.depot || 'Vijayawada',
      lat: position.lat,
      lon: position.lng,
      heading: position.heading,
      speed_kmph: position.speed,
      road_type: position.roadType,
      status: delaySeconds > 300 ? 'delayed' : 'running',
      is_active: true,
      passengers: currentPassengers,
      capacity: capacity,
      seats_available: seatsAvailable,
      occupancy_percent: Math.round(occupancy * 100),
      predicted_delay_seconds: delaySeconds,
      driver_id: `DRV-${String(i + 1).padStart(3, '0')}`,
      driver_name: randomItem(DRIVER_NAMES),
      conductor_name: randomItem(CONDUCTOR_NAMES),
      trip_id: `TRIP-${Date.now()}-${i}`,
      current_stop_index: position.stopIndex || 0,
      current_stop: position.currentStop || 'En Route',
      next_stop: position.nextStop || 'Terminal',
      eta_next_stop: Math.floor(Date.now() / 1000) + randomBetween(120, 600),
      timestamp: Date.now(),
      last_update: Date.now(),
      fuel_level: randomBetween(30, 95),
      battery_voltage: 12.4 + (Math.random() * 0.8),
      gps_accuracy: randomBetween(3, 15),
      emergency: false,
      progress: progress,
      waypoint_index: position.waypointIndex
    });
  }

  return vehicles;
};

// Generate drivers data
export const generateDriversData = () => {
  const drivers = {};
  DRIVER_NAMES.forEach((name, index) => {
    const driverId = `DRV-${String(index + 1).padStart(3, '0')}`;
    drivers[driverId] = {
      driver_id: driverId,
      name: name,
      phone: `+91 9${randomBetween(100000000, 999999999)}`,
      license_no: `AP${randomBetween(10, 99)}${String(Date.now()).slice(-8)}`,
      license_expiry: new Date(Date.now() + randomBetween(30, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      duty_hours_today: randomBetween(2, 8),
      total_trips_today: randomBetween(1, 6),
      rating: (3.5 + Math.random() * 1.5).toFixed(1),
      status: 'on_duty',
      depot: randomItem(['Vijayawada', 'Guntur', 'Tenali']),
      joined_date: new Date(Date.now() - randomBetween(365, 3650) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  });
  return drivers;
};

// Generate vehicles/fleet data
export const generateVehiclesData = () => {
  const vehicles = {};
  const routes = Object.keys(APSRTC_ROUTES);

  for (let i = 0; i < 50; i++) {
    const routeId = routes[i % routes.length];
    const vehicleId = generateVehicleId(routeId, i);

    vehicles[vehicleId] = {
      vehicle_id: vehicleId,
      reg_no: vehicleId,
      model: randomItem(['Ashok Leyland Viking', 'Tata Ultra', 'Volvo 8400', 'BharatBenz']),
      capacity: APSRTC_ROUTES[routeId].capacity,
      fuel_type: randomItem(['Diesel', 'CNG', 'Electric']),
      last_service: new Date(Date.now() - randomBetween(15, 60) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      next_service: new Date(Date.now() + randomBetween(7, 45) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      mileage_km: randomBetween(50000, 250000),
      status: 'active',
      depot: APSRTC_ROUTES[routeId].depot,
      purchase_year: randomBetween(2018, 2023),
      insurance_valid: new Date(Date.now() + randomBetween(30, 365) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      fitness_valid: new Date(Date.now() + randomBetween(60, 180) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };
  }
  return vehicles;
};

// Generate AI insights data
export const generateAIInsights = () => {
  const today = new Date().toISOString().split('T')[0];

  return {
    date: today,
    delay_heatmap: [
      { location: 'Benz Circle', lat: 16.5060, lon: 80.6480, avg_delay_min: 12, intensity: 0.9, reason: 'Peak traffic congestion' },
      { location: 'One Town', lat: 16.5100, lon: 80.6200, avg_delay_min: 6, intensity: 0.6, reason: 'School zone traffic' },
      { location: 'Governorpet', lat: 16.5119, lon: 80.6332, avg_delay_min: 4, intensity: 0.4, reason: 'Market area congestion' },
      { location: 'Mangalagiri', lat: 16.4307, lon: 80.5686, avg_delay_min: 3, intensity: 0.3, reason: 'Highway merge point' }
    ],
    demand_forecast: {
      hourly: [
        { hour: 6, demand: 2500, capacity: 4000 },
        { hour: 7, demand: 5200, capacity: 5000 },
        { hour: 8, demand: 7800, capacity: 6000 },
        { hour: 9, demand: 6500, capacity: 6000 },
        { hour: 10, demand: 4200, capacity: 5000 },
        { hour: 11, demand: 3800, capacity: 4500 },
        { hour: 12, demand: 4500, capacity: 4500 },
        { hour: 13, demand: 4200, capacity: 4500 },
        { hour: 14, demand: 3800, capacity: 4000 },
        { hour: 15, demand: 4000, capacity: 4000 },
        { hour: 16, demand: 5500, capacity: 5000 },
        { hour: 17, demand: 7200, capacity: 6000 },
        { hour: 18, demand: 8100, capacity: 6500 },
        { hour: 19, demand: 6800, capacity: 6000 },
        { hour: 20, demand: 4500, capacity: 5000 },
        { hour: 21, demand: 3200, capacity: 4000 }
      ],
      route_specific: {
        'RJ-12': { current: 450, predicted: 520, change: '+15.5%', peak_hour: 8 },
        'RJ-15': { current: 380, predicted: 410, change: '+7.9%', peak_hour: 17 },
        'RJ-08': { current: 290, predicted: 275, change: '-5.2%', peak_hour: 9 },
        'RJ-22': { current: 520, predicted: 580, change: '+11.5%', peak_hour: 18 },
        'RJ-05': { current: 180, predicted: 210, change: '+16.7%', peak_hour: 8 },
        'RJ-18': { current: 340, predicted: 355, change: '+4.4%', peak_hour: 17 }
      }
    },
    optimization_suggestions: [
      {
        id: 1,
        type: 'capacity',
        priority: 'high',
        route: 'RJ-12',
        title: 'Add 2 buses to RJ-12 during 07:30-08:30',
        description: 'Predicted demand exceeds capacity by 30% during morning peak',
        impact: { delay_reduction: '57%', revenue_increase: '₹12,000/day', satisfaction: '+18%' },
        cost: '₹8,500/day'
      },
      {
        id: 2,
        type: 'route',
        priority: 'high',
        route: 'RJ-12',
        title: 'Shorten RJ-12 loop via Benz Circle bypass',
        description: 'Avoid congested Benz Circle during 8-10 AM',
        impact: { time_saved: '8 min/trip', fuel_saved: '₹45,000/month' },
        cost: 'No additional cost'
      },
      {
        id: 3,
        type: 'schedule',
        priority: 'medium',
        route: 'RJ-15',
        title: 'Add express variant for Vizag R10',
        description: 'Skip 3 intermediate stops during peak hours',
        impact: { time_saved: '12 min/trip', passenger_increase: '+22%' },
        cost: '₹5,000/day'
      },
      {
        id: 4,
        type: 'maintenance',
        priority: 'low',
        route: 'Fleet',
        title: 'Schedule preventive maintenance for 5 vehicles',
        description: 'Due next week - schedule during low demand periods',
        impact: { breakdown_prevention: '85%', savings: '₹75,000' },
        cost: '₹25,000'
      }
    ],
    load_anomalies: [
      { vehicle_id: 'AP39TB805', route: 'RJ-12', occupancy: 98, action: 'Dispatch backup immediately' },
      { vehicle_id: 'AP39TB812', route: 'RJ-22', occupancy: 96, action: 'Consider route splitting' },
      { vehicle_id: 'AP39TB818', route: 'RJ-15', occupancy: 95, action: 'Add to high-demand list' }
    ]
  };
};

// Generate emergency data
export const generateEmergencies = () => {
  const emergencies = {};
  const types = ['breakdown', 'accident', 'medical', 'traffic'];
  const severities = ['low', 'medium', 'high', 'critical'];

  // Generate 2-3 sample emergencies
  for (let i = 0; i < randomBetween(2, 4); i++) {
    const id = `EMG-${Date.now()}-${i}`;
    const route = randomItem(Object.keys(APSRTC_ROUTES));
    const routeData = APSRTC_ROUTES[route];
    const stop = randomItem(routeData.stops);

    emergencies[id] = {
      id: id,
      vehicle_id: generateVehicleId(route, randomBetween(0, 10)),
      route_id: route,
      type: randomItem(types),
      severity: randomItem(severities),
      status: randomItem(['open', 'assigned', 'in_progress']),
      lat: stop.lat + (Math.random() - 0.5) * 0.01,
      lon: stop.lon + (Math.random() - 0.5) * 0.01,
      location_name: stop.name,
      description: 'Auto-generated incident for simulation',
      reported_at: Date.now() - randomBetween(5, 60) * 60 * 1000,
      assigned_to: randomItem(DRIVER_NAMES),
      timeline: [
        { time: Date.now() - 30 * 60 * 1000, event: 'Incident reported' },
        { time: Date.now() - 25 * 60 * 1000, event: 'Control room notified' },
        { time: Date.now() - 20 * 60 * 1000, event: 'Response team dispatched' }
      ]
    };
  }

  return emergencies;
};

// Generate passes data
export const generatePasses = () => {
  const passes = {};
  const passTypes = ['student', 'senior', 'general', 'monthly'];
  const statuses = ['pending', 'approved', 'rejected'];

  for (let i = 0; i < 10; i++) {
    const id = `PASS-${Date.now()}-${i}`;
    passes[id] = {
      id: id,
      user_id: `USER-${randomBetween(1000, 9999)}`,
      user_name: randomItem(['Arun Kumar', 'Priya Sharma', 'Rahul Reddy', 'Sneha Rao', 'Vikram Naidu']),
      pass_type: randomItem(passTypes),
      status: randomItem(statuses),
      validity_from: new Date().toISOString().split('T')[0],
      validity_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      route: randomItem(['All Routes', 'RJ-12', 'RJ-15', 'RJ-08']),
      amount: randomBetween(200, 1500),
      submitted_at: Date.now() - randomBetween(1, 48) * 60 * 60 * 1000,
      docs_verified: Math.random() > 0.3
    };
  }

  return passes;
};

// Initialize all Firebase data
export const initializeFirebaseData = async () => {
  console.log('🚀 Initializing APSRTC Control Room data in Firebase...');

  try {
    // Generate all data
    const vehicles = generateSimulatedVehicles();
    const driversData = generateDriversData();
    const vehiclesData = generateVehiclesData();
    const aiInsights = generateAIInsights();
    const emergencies = generateEmergencies();
    const passes = generatePasses();

    // Write to Firebase
    const telemetryRef = ref(db, 'live-telemetry');
    const driversRef = ref(db, 'drivers');
    const vehiclesRef = ref(db, 'vehicles');
    const aiRef = ref(db, `ai_insights/${new Date().toISOString().split('T')[0]}`);
    const emergenciesRef = ref(db, 'emergencies');
    const passesRef = ref(db, 'passes');

    // Write live telemetry
    const telemetryData = {};
    vehicles.forEach(v => {
      telemetryData[v.vehicle_id] = v;
    });
    await set(telemetryRef, telemetryData);
    console.log(`✅ Written ${vehicles.length} vehicles to /live-telemetry`);

    // Write drivers
    await set(driversRef, driversData);
    console.log(`✅ Written ${Object.keys(driversData).length} drivers to /drivers`);

    // Write vehicles
    await set(vehiclesRef, vehiclesData);
    console.log(`✅ Written ${Object.keys(vehiclesData).length} vehicles to /vehicles`);

    // Write AI insights
    await set(aiRef, aiInsights);
    console.log('✅ Written AI insights to /ai_insights');

    // Write emergencies
    await set(emergenciesRef, emergencies);
    console.log(`✅ Written ${Object.keys(emergencies).length} emergencies to /emergencies`);

    // Write passes
    await set(passesRef, passes);
    console.log(`✅ Written ${Object.keys(passes).length} passes to /passes`);

    return { success: true, vehicleCount: vehicles.length };

  } catch (error) {
    console.error('❌ Error initializing Firebase data:', error);
    return { success: false, error: error.message };
  }
};

// Update vehicle positions using ROAD-SNAPPED movement
export const updateVehiclePositions = async (vehicles, speedMultiplier = 1) => {
  const updates = {};
  const now = Date.now();

  vehicles.forEach(vehicle => {
    const route = getRouteById(vehicle.route_id);
    if (!route) return;

    // Calculate new progress along route
    const avgTripTimeSeconds = (route.avgTripTime || 45) * 60;
    const progressPerSecond = 1 / avgTripTimeSeconds;
    const trafficMultiplier = getTrafficMultiplier();
    
    // Time since last update (assume 2 second intervals)
    const elapsed = 2;
    const progressIncrement = progressPerSecond * elapsed * speedMultiplier * trafficMultiplier;
    
    let newProgress = (vehicle.progress || 0) + progressIncrement;
    if (newProgress > 1) newProgress = 0; // Loop back

    // Get road-snapped position
    const position = calculateRoadSnappedPosition(vehicle.route_id, newProgress);
    if (!position) return;

    // Calculate heading from movement
    const heading = calculateHeading(vehicle.lat, vehicle.lon, position.lat, position.lng);

    // Random seat changes at stops
    let seatsAvailable = vehicle.seats_available || 10;
    if (position.currentStop) {
      const boarding = Math.floor(Math.random() * 8);
      const alighting = Math.floor(Math.random() * 5);
      seatsAvailable = Math.max(0, Math.min(vehicle.capacity, seatsAvailable - boarding + alighting));
    }

    // Speed with slight variation
    const speed = position.speed + (Math.random() - 0.5) * 5;

    updates[`live-telemetry/${vehicle.vehicle_id}`] = {
      ...vehicle,
      lat: position.lat,
      lon: position.lng,
      heading: heading,
      speed_kmph: Math.max(5, Math.min(60, speed)),
      road_type: position.roadType,
      seats_available: seatsAvailable,
      passengers: vehicle.capacity - seatsAvailable,
      occupancy_percent: Math.round(((vehicle.capacity - seatsAvailable) / vehicle.capacity) * 100),
      progress: newProgress,
      waypoint_index: position.waypointIndex,
      timestamp: now,
      last_update: now,
      current_stop_index: position.stopIndex || 0,
      current_stop: position.currentStop || 'En Route',
      next_stop: position.nextStop || 'Terminal',
      predicted_delay_seconds: Math.round(position.delayMinutes * 60) + (vehicle.predicted_delay_seconds || 0) * 0.9
    };
  });

  try {
    await update(ref(db), updates);
    return true;
  } catch (error) {
    console.error('Error updating positions:', error);
    return false;
  }
};

// Create new emergency
export const createEmergency = async (vehicleId, type, severity, description, lat, lon) => {
  const emergencyId = `EMG-${Date.now()}`;
  const emergencyData = {
    id: emergencyId,
    vehicle_id: vehicleId,
    type: type,
    severity: severity,
    status: 'open',
    description: description,
    lat: lat,
    lon: lon,
    reported_at: Date.now(),
    timeline: [
      { time: Date.now(), event: 'Emergency reported' }
    ]
  };

  try {
    await set(ref(db, `emergencies/${emergencyId}`), emergencyData);
    return emergencyId;
  } catch (error) {
    console.error('Error creating emergency:', error);
    return null;
  }
};

// Send message to driver
export const sendMessageToDriver = async (vehicleId, message) => {
  const messageId = `MSG-${Date.now()}`;
  const messageData = {
    id: messageId,
    vehicle_id: vehicleId,
    message: message,
    sent_at: Date.now(),
    read: false,
    sender: 'Control Room'
  };

  try {
    await set(ref(db, `messages/${vehicleId}/${messageId}`), messageData);
    return messageId;
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

// Update vehicle route
export const reassignRoute = async (vehicleId, newRouteId) => {
  try {
    await update(ref(db, `live-telemetry/${vehicleId}`), {
      route_id: newRouteId,
      route_name: APSRTC_ROUTES[newRouteId]?.name || 'Unknown',
      progress: 0,
      timestamp: Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error reassigning route:', error);
    return false;
  }
};

// Export routes for use in components
export const getAvailableRoutes = () => Object.keys(APSRTC_ROUTES);
export const getRouteDetails = (routeId) => APSRTC_ROUTES[routeId];

