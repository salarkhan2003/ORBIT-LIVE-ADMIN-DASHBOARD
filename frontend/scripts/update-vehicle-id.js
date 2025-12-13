/**
 * Script to update vehicle ID in Firebase Realtime Database
 * Usage: node scripts/update-vehicle-id.js
 */

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get, set, remove } = require('firebase/database');
require('dotenv').config();

// Firebase configuration
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

async function updateVehicleId(oldId, newId) {
  try {
    console.log(`🔄 Updating vehicle ID from "${oldId}" to "${newId}"`);
    
    // Get reference to live-telemetry
    const telemetryRef = ref(db, 'live-telemetry');
    const snapshot = await get(telemetryRef);
    
    if (!snapshot.exists()) {
      console.log('❌ No telemetry data found');
      return;
    }
    
    const data = snapshot.val();
    let vehicleFound = false;
    let vehicleKey = null;
    
    // Find the vehicle with the old ID
    for (const [key, vehicle] of Object.entries(data)) {
      if (vehicle && vehicle.vehicle_id === oldId) {
        vehicleFound = true;
        vehicleKey = key;
        console.log(`✅ Found vehicle "${oldId}" at key: ${key}`);
        
        // Update the vehicle_id field
        const updatedVehicle = {
          ...vehicle,
          vehicle_id: newId
        };
        
        // Set the updated vehicle data
        await set(ref(db, `live-telemetry/${key}`), updatedVehicle);
        console.log(`✅ Successfully updated vehicle ID to "${newId}"`);
        break;
      }
    }
    
    if (!vehicleFound) {
      console.log(`❌ Vehicle with ID "${oldId}" not found`);
      console.log('Available vehicles:');
      Object.values(data).forEach(vehicle => {
        if (vehicle && vehicle.vehicle_id) {
          console.log(`  - ${vehicle.vehicle_id}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Error updating vehicle ID:', error);
  }
}

// Run the update
updateVehicleId('NUCLEAR-TEST', 'APSRTC BUS 01')
  .then(() => {
    console.log('🎉 Update complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Update failed:', error);
    process.exit(1);
  });