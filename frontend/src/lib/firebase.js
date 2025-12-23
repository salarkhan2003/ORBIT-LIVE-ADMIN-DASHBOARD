/**
 * Firebase Configuration for APSRTC Live Tracking
 * Project: orbit-live-3836f
 * Realtime DB: https://orbit-live-3836f-default-rtdb.firebaseio.com
 *
 * Data Paths:
 * - /live-telemetry/{vehicleId} - Live GPS data from drivers
 * - /emergencies/{incidentId} - Emergency alerts
 * - /incidents/{incidentId} - All incidents
 * - /passes/{passId} - Passenger pass applications
 * - /payments/{paymentId} - Payment transactions
 * - /drivers/{driverId} - Driver profiles
 * - /vehicles/{vehicleId} - Vehicle profiles
 * - /routes/{routeId} - Route definitions
 * - /trips/{tripId} - Trip summaries
 * - /messages/{vehicleId} - Messages to drivers
 */

import { initializeApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  set,
  update,
  push,
  remove,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp
} from 'firebase/database';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Export Firebase instances and functions
export {
  app,
  db,
  ref,
  onValue,
  set,
  update,
  push,
  remove,
  query,
  orderByChild,
  limitToLast,
  serverTimestamp
};
