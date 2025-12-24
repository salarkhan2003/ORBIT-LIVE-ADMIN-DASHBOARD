/**
 * ROAD-SNAPPED BUS MOVEMENT ENGINE
 * Realistic bus movement following actual Vijayawada roads
 * 
 * Features:
 * - Smooth interpolation between waypoints
 * - Speed varies by road type and traffic
 * - Delay simulation at hotspots
 * - Direction/heading calculation
 * - Firebase sync for live telemetry
 */

import { db } from '../lib/firebase';
import { ref, update, set } from 'firebase/database';
import {
  VIJAYAWADA_ROUTES,
  ROAD_SPEED_LIMITS,
  getTrafficMultiplier,
  calculateDistance,
  getDelayAtPosition,
  getRouteById
} from './VijayawadaRoutes';

// Ola Maps API Key for snap-to-road (future enhancement)
export const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

/**
 * Linear interpolation between two values
 */
export const lerp = (start, end, t) => start + (end - start) * Math.max(0, Math.min(1, t));

/**
 * Calculate heading/bearing between two points
 */
export const calculateHeading = (lat1, lng1, lat2, lng2) => {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const lat1Rad = lat1 * Math.PI / 180;
  const lat2Rad = lat2 * Math.PI / 180;
  
  const x = Math.sin(dLng) * Math.cos(lat2Rad);
  const y = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
            Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
  
  let heading = Math.atan2(x, y) * 180 / Math.PI;
  return (heading + 360) % 360;
};

/**
 * Get speed for current road segment
 */
export const getSegmentSpeed = (roadType, trafficMultiplier = 1) => {
  const baseSpeed = ROAD_SPEED_LIMITS[roadType] || ROAD_SPEED_LIMITS.urban;
  return baseSpeed * trafficMultiplier;
};

/**
 * Calculate bus position along route based on progress (0-1)
 * Returns interpolated position between waypoints
 */
export const calculateRoadSnappedPosition = (routeId, progress, direction = 1) => {
  const route = getRouteById(routeId);
  if (!route || !route.waypoints || route.waypoints.length < 2) {
    return null;
  }

  const waypoints = route.waypoints;
  const totalWaypoints = waypoints.length;
  
  // Clamp progress to 0-1
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  // Calculate which segment we're on
  const exactIndex = clampedProgress * (totalWaypoints - 1);
  const currentIndex = Math.floor(exactIndex);
  const nextIndex = Math.min(currentIndex + 1, totalWaypoints - 1);
  const segmentProgress = exactIndex - currentIndex;
  
  const currentWaypoint = waypoints[currentIndex];
  const nextWaypoint = waypoints[nextIndex];
  
  // Interpolate position
  const lat = lerp(currentWaypoint.lat, nextWaypoint.lat, segmentProgress);
  const lng = lerp(currentWaypoint.lng, nextWaypoint.lng, segmentProgress);
  
  // Calculate heading
  const heading = calculateHeading(
    currentWaypoint.lat, currentWaypoint.lng,
    nextWaypoint.lat, nextWaypoint.lng
  );
  
  // Get road type and speed
  const roadType = currentWaypoint.roadType || 'urban';
  const trafficMultiplier = getTrafficMultiplier();
  const speed = getSegmentSpeed(roadType, trafficMultiplier);
  
  // Check for delay hotspot
  const delayMinutes = getDelayAtPosition(lat, lng);
  
  // Find current and next stop
  const currentStop = currentWaypoint.stopName || null;
  const stopIndex = currentWaypoint.stopIndex;
  
  // Find next stop
  let nextStop = null;
  for (let i = nextIndex; i < totalWaypoints; i++) {
    if (waypoints[i].stopName) {
      nextStop = waypoints[i].stopName;
      break;
    }
  }
  
  return {
    lat,
    lng,
    lon: lng, // Alias for compatibility
    heading,
    speed,
    roadType,
    currentStop,
    nextStop,
    stopIndex,
    delayMinutes,
    progress: clampedProgress,
    waypointIndex: currentIndex,
    segmentProgress
  };
};

/**
 * Bus state manager for road-snapped movement
 */
export class RoadSnappedBus {
  constructor(vehicleId, routeId, initialProgress = 0) {
    this.vehicleId = vehicleId;
    this.routeId = routeId;
    this.progress = initialProgress;
    this.direction = 1; // 1 = forward, -1 = reverse
    this.startTime = Date.now();
    this.lastUpdate = Date.now();
    this.tripCount = 0;
    this.totalDelaySeconds = 0;
    
    // Get route info
    const route = getRouteById(routeId);
    this.avgTripTime = route?.avgTripTime || 45; // minutes
    this.totalDistance = route?.totalDistance || 15; // km
    
    // Passenger simulation
    this.capacity = route?.capacity || 52;
    this.passengers = Math.floor(Math.random() * this.capacity * 0.7);
  }
  
  /**
   * Update bus position based on elapsed time
   * @param {number} speedMultiplier - Simulation speed (1x, 5x, 10x)
   */
  update(speedMultiplier = 1) {
    const now = Date.now();
    const elapsed = (now - this.lastUpdate) / 1000; // seconds
    this.lastUpdate = now;
    
    // Calculate progress increment based on trip time
    // Full trip (progress 0 to 1) should take avgTripTime minutes
    const tripTimeSeconds = this.avgTripTime * 60;
    const progressPerSecond = 1 / tripTimeSeconds;
    
    // Apply speed multiplier and traffic
    const trafficMultiplier = getTrafficMultiplier();
    const effectiveSpeed = progressPerSecond * speedMultiplier * trafficMultiplier;
    
    // Update progress
    this.progress += effectiveSpeed * elapsed * this.direction;
    
    // Handle route completion (loop back)
    if (this.progress >= 1) {
      this.progress = 0;
      this.tripCount++;
      this.direction = 1;
    } else if (this.progress < 0) {
      this.progress = 0;
      this.direction = 1;
    }
    
    // Get current position
    const position = calculateRoadSnappedPosition(this.routeId, this.progress, this.direction);
    
    if (position) {
      // Add delay if in hotspot
      if (position.delayMinutes > 0) {
        this.totalDelaySeconds += position.delayMinutes * 60 * (elapsed / 60);
      }
      
      // Simulate passenger changes at stops
      if (position.currentStop) {
        const boarding = Math.floor(Math.random() * 8);
        const alighting = Math.floor(Math.random() * 5);
        this.passengers = Math.max(0, Math.min(this.capacity, this.passengers + boarding - alighting));
      }
    }
    
    return position;
  }
  
  /**
   * Get full telemetry data for Firebase
   */
  getTelemetryData() {
    const position = calculateRoadSnappedPosition(this.routeId, this.progress, this.direction);
    if (!position) return null;
    
    const route = getRouteById(this.routeId);
    const occupancyPercent = Math.round((this.passengers / this.capacity) * 100);
    
    return {
      vehicle_id: this.vehicleId,
      route_id: this.routeId,
      route_name: route?.name || 'Unknown Route',
      lat: position.lat,
      lon: position.lng,
      heading: position.heading,
      speed_kmph: position.speed,
      road_type: position.roadType,
      current_stop: position.currentStop,
      next_stop: position.nextStop,
      stop_index: position.stopIndex,
      progress: this.progress,
      direction: this.direction,
      passengers: this.passengers,
      capacity: this.capacity,
      seats_available: this.capacity - this.passengers,
      occupancy_percent: occupancyPercent,
      predicted_delay_seconds: Math.round(this.totalDelaySeconds),
      trip_count: this.tripCount,
      is_active: true,
      status: occupancyPercent > 90 ? 'crowded' : this.totalDelaySeconds > 300 ? 'delayed' : 'running',
      timestamp: Date.now(),
      last_update: Date.now()
    };
  }
}

/**
 * Fleet manager for multiple road-snapped buses
 */
export class RoadSnappedFleet {
  constructor() {
    this.buses = new Map();
    this.isRunning = false;
    this.updateInterval = null;
    this.speedMultiplier = 1;
    this.onUpdate = null;
  }
  
  /**
   * Initialize fleet with specified number of buses
   */
  initialize(busCount = 50) {
    this.buses.clear();
    const routeIds = Object.keys(VIJAYAWADA_ROUTES);
    
    for (let i = 0; i < busCount; i++) {
      const routeId = routeIds[i % routeIds.length];
      const vehicleId = `AP39TB${String(800 + i).padStart(3, '0')}`;
      const initialProgress = Math.random(); // Random starting position
      
      const bus = new RoadSnappedBus(vehicleId, routeId, initialProgress);
      
      // Add driver info
      bus.driverName = ['Ravi Kumar', 'Srinivas Rao', 'Venkata Ramana', 'Krishna Murthy',
        'Suresh Babu', 'Ramesh Chandra', 'Vijay Kumar', 'Mahesh Reddy'][i % 8];
      bus.driverPhone = `+91 98765${String(10000 + i).slice(-5)}`;
      
      this.buses.set(vehicleId, bus);
    }
    
    console.log(`🚌 Initialized ${busCount} road-snapped buses`);
    return this;
  }
  
  /**
   * Start simulation loop
   */
  start(updateIntervalMs = 2000) {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.updateInterval = setInterval(() => {
      this.updateAll();
    }, updateIntervalMs);
    
    console.log('▶️ Road-snapped simulation started');
    return this;
  }
  
  /**
   * Stop simulation
   */
  stop() {
    this.isRunning = false;
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
    console.log('⏹️ Road-snapped simulation stopped');
    return this;
  }
  
  /**
   * Set simulation speed
   */
  setSpeed(multiplier) {
    this.speedMultiplier = multiplier;
    return this;
  }
  
  /**
   * Update all buses
   */
  updateAll() {
    const telemetryData = {};
    
    this.buses.forEach((bus, vehicleId) => {
      bus.update(this.speedMultiplier);
      const data = bus.getTelemetryData();
      if (data) {
        data.driver_name = bus.driverName;
        data.driver_phone = bus.driverPhone;
        telemetryData[vehicleId] = data;
      }
    });
    
    // Callback for local state update
    if (this.onUpdate) {
      this.onUpdate(Object.values(telemetryData));
    }
    
    return telemetryData;
  }
  
  /**
   * Sync all buses to Firebase
   */
  async syncToFirebase() {
    const telemetryData = this.updateAll();
    
    try {
      await set(ref(db, 'live-telemetry'), telemetryData);
      console.log(`🔥 Synced ${Object.keys(telemetryData).length} buses to Firebase`);
      return true;
    } catch (error) {
      console.error('Firebase sync error:', error);
      return false;
    }
  }
  
  /**
   * Get all bus data
   */
  getAllBuses() {
    return Array.from(this.buses.values()).map(bus => bus.getTelemetryData());
  }
  
  /**
   * Get bus by ID
   */
  getBus(vehicleId) {
    return this.buses.get(vehicleId);
  }
  
  /**
   * Get stats
   */
  getStats() {
    const buses = this.getAllBuses();
    const active = buses.filter(b => b?.is_active).length;
    const delayed = buses.filter(b => b?.predicted_delay_seconds > 300).length;
    const crowded = buses.filter(b => b?.occupancy_percent > 85).length;
    const totalPassengers = buses.reduce((sum, b) => sum + (b?.passengers || 0), 0);
    const avgDelay = buses.length > 0 
      ? buses.reduce((sum, b) => sum + (b?.predicted_delay_seconds || 0), 0) / buses.length / 60
      : 0;
    
    return {
      total: buses.length,
      active,
      delayed,
      crowded,
      totalPassengers,
      avgDelayMinutes: avgDelay.toFixed(1),
      onTimePercent: buses.length > 0 ? Math.round(((buses.length - delayed) / buses.length) * 100) : 0
    };
  }
}

// Singleton instance
export const roadSnappedFleet = new RoadSnappedFleet();

export default {
  RoadSnappedBus,
  RoadSnappedFleet,
  roadSnappedFleet,
  calculateRoadSnappedPosition,
  calculateHeading,
  lerp,
  getSegmentSpeed
};
