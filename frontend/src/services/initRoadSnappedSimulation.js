/**
 * ROAD-SNAPPED SIMULATION INITIALIZER
 * Quick start script to populate Firebase with road-snapped bus data
 * 
 * Usage:
 * import { initRoadSnappedSimulation, startLiveSimulation } from './initRoadSnappedSimulation';
 * await initRoadSnappedSimulation(50); // Initialize 50 buses
 * startLiveSimulation(); // Start live movement updates
 */

import { db } from '../lib/firebase';
import { ref, set, update } from 'firebase/database';
import {
  VIJAYAWADA_ROUTES,
  getRouteById,
  getRouteIds,
  DELAY_HOTSPOTS,
  getTrafficMultiplier
} from './VijayawadaRoutes';
import {
  calculateRoadSnappedPosition,
  calculateHeading,
  RoadSnappedFleet,
  roadSnappedFleet
} from './RoadSnappedMovement';

// Driver names for simulation
const DRIVER_NAMES = [
  'Ravi Kumar', 'Srinivas Rao', 'Venkata Ramana', 'Krishna Murthy',
  'Suresh Babu', 'Ramesh Chandra', 'Vijay Kumar', 'Mahesh Reddy',
  'Narayana Swamy', 'Prakash Rao', 'Subba Rao', 'Lakshmi Naidu'
];

/**
 * Initialize Firebase with road-snapped bus data
 */
export const initRoadSnappedSimulation = async (busCount = 50) => {
  console.log(`🚌 Initializing ${busCount} road-snapped buses...`);
  
  const routeIds = getRouteIds();
  const telemetryData = {};
  
  for (let i = 0; i < busCount; i++) {
    const routeId = routeIds[i % routeIds.length];
    const route = getRouteById(routeId);
    const vehicleId = `AP39TB${String(800 + i).padStart(3, '0')}`;
    
    // Random starting position along route
    const progress = Math.random();
    const position = calculateRoadSnappedPosition(routeId, progress);
    
    if (!position) continue;
    
    // Simulate occupancy
    const hour = new Date().getHours();
    const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
    const occupancy = Math.floor((isPeak ? 60 : 35) + Math.random() * 40);
    const capacity = 52;
    const passengers = Math.floor((occupancy / 100) * capacity);

    telemetryData[vehicleId] = {
      vehicle_id: vehicleId,
      route_id: routeId,
      route_name: route?.name || 'Unknown',
      lat: position.lat,
      lon: position.lng,
      heading: position.heading,
      speed_kmph: position.speed,
      road_type: position.roadType,
      progress: progress,
      waypoint_index: position.waypointIndex,
      current_stop: position.currentStop || 'En Route',
      next_stop: position.nextStop || 'Terminal',
      stop_index: position.stopIndex,
      passengers: passengers,
      capacity: capacity,
      seats_available: capacity - passengers,
      occupancy_percent: occupancy,
      predicted_delay_seconds: Math.round(position.delayMinutes * 60),
      driver_name: DRIVER_NAMES[i % DRIVER_NAMES.length],
      driver_phone: `+91 98765${String(10000 + i).slice(-5)}`,
      is_active: true,
      status: occupancy > 90 ? 'crowded' : 'running',
      timestamp: Date.now(),
      last_update: Date.now()
    };
  }
  
  try {
    await set(ref(db, 'live-telemetry'), telemetryData);
    console.log(`✅ Initialized ${Object.keys(telemetryData).length} buses in Firebase`);
    
    // Also save route geometries for reference
    const routeGeometries = {};
    routeIds.forEach(routeId => {
      const route = getRouteById(routeId);
      if (route) {
        routeGeometries[routeId] = {
          name: route.name,
          color: route.color,
          totalDistance: route.totalDistance,
          avgTripTime: route.avgTripTime,
          waypoints: route.waypoints
        };
      }
    });
    await set(ref(db, 'routes'), routeGeometries);
    console.log(`✅ Saved ${routeIds.length} route geometries to Firebase`);
    
    return { success: true, busCount: Object.keys(telemetryData).length };
  } catch (error) {
    console.error('❌ Error initializing simulation:', error);
    return { success: false, error: error.message };
  }
};


// Simulation state
let simulationInterval = null;
let simulationSpeed = 1;

/**
 * Start live simulation with road-snapped movement
 */
export const startLiveSimulation = (speedMultiplier = 1, updateIntervalMs = 2000) => {
  if (simulationInterval) {
    console.log('⚠️ Simulation already running');
    return;
  }
  
  simulationSpeed = speedMultiplier;
  console.log(`▶️ Starting road-snapped simulation at ${speedMultiplier}x speed`);
  
  simulationInterval = setInterval(async () => {
    await updateAllBusPositions(simulationSpeed);
  }, updateIntervalMs);
  
  return () => stopLiveSimulation();
};

/**
 * Stop live simulation
 */
export const stopLiveSimulation = () => {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('⏹️ Simulation stopped');
  }
};

/**
 * Set simulation speed
 */
export const setSimulationSpeed = (speed) => {
  simulationSpeed = speed;
  console.log(`⚡ Simulation speed set to ${speed}x`);
};

/**
 * Update all bus positions using road-snapped movement
 */
export const updateAllBusPositions = async (speedMultiplier = 1) => {
  try {
    // Get current bus data from Firebase
    const { onValue } = await import('firebase/database');
    
    return new Promise((resolve) => {
      const telemetryRef = ref(db, 'live-telemetry');
      
      onValue(telemetryRef, async (snapshot) => {
        const buses = snapshot.val();
        if (!buses) {
          resolve(false);
          return;
        }
        
        const updates = {};
        const now = Date.now();
        
        Object.entries(buses).forEach(([vehicleId, bus]) => {
          const route = getRouteById(bus.route_id);
          if (!route) return;
          
          // Calculate progress increment
          const avgTripTimeSeconds = (route.avgTripTime || 45) * 60;
          const progressPerSecond = 1 / avgTripTimeSeconds;
          const trafficMultiplier = getTrafficMultiplier();
          
          // 2 second intervals
          const elapsed = 2 * speedMultiplier;
          const progressIncrement = progressPerSecond * elapsed * trafficMultiplier;
          
          let newProgress = (bus.progress || 0) + progressIncrement;
          if (newProgress > 1) newProgress = 0;
          
          // Get new road-snapped position
          const position = calculateRoadSnappedPosition(bus.route_id, newProgress);
          if (!position) return;
          
          // Calculate heading
          const heading = calculateHeading(bus.lat, bus.lon, position.lat, position.lng);
          
          // Update occupancy at stops
          let occupancy = bus.occupancy_percent;
          if (position.currentStop && position.currentStop !== bus.current_stop) {
            const boarding = Math.floor(Math.random() * 10);
            const alighting = Math.floor(Math.random() * 8);
            occupancy = Math.max(15, Math.min(100, occupancy + boarding - alighting));
          }
          
          updates[`live-telemetry/${vehicleId}`] = {
            ...bus,
            lat: position.lat,
            lon: position.lng,
            heading: heading,
            speed_kmph: position.speed + (Math.random() - 0.5) * 3,
            road_type: position.roadType,
            progress: newProgress,
            waypoint_index: position.waypointIndex,
            current_stop: position.currentStop || 'En Route',
            next_stop: position.nextStop || 'Terminal',
            stop_index: position.stopIndex,
            occupancy_percent: Math.floor(occupancy),
            passengers: Math.floor((occupancy / 100) * bus.capacity),
            seats_available: Math.floor(bus.capacity - (occupancy / 100) * bus.capacity),
            predicted_delay_seconds: Math.round(position.delayMinutes * 60 + (bus.predicted_delay_seconds || 0) * 0.9),
            timestamp: now,
            last_update: now
          };
        });
        
        await update(ref(db), updates);
        resolve(true);
      }, { onlyOnce: true });
    });
  } catch (error) {
    console.error('Error updating positions:', error);
    return false;
  }
};

export default {
  initRoadSnappedSimulation,
  startLiveSimulation,
  stopLiveSimulation,
  setSimulationSpeed,
  updateAllBusPositions
};
