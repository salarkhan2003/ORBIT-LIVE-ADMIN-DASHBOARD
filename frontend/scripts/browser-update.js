/**
 * Browser Console Script to Update Vehicle ID
 * 
 * Instructions:
 * 1. Open your React app in the browser
 * 2. Open Developer Tools (F12)
 * 3. Go to Console tab
 * 4. Copy and paste this entire script
 * 5. Press Enter to run
 */

// Function to update vehicle ID using existing Firebase connection
async function updateVehicleIdInBrowser(oldId, newId) {
  try {
    // Import Firebase functions (assuming they're available globally)
    const { ref, get, set } = window.firebase || await import('firebase/database');
    
    // Get the database instance from your app
    const db = window.db || (await import('../src/lib/firebase')).db;
    
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
    
    // Find and update the vehicle with the old ID
    for (const [key, vehicle] of Object.entries(data)) {
      if (vehicle && vehicle.vehicle_id === oldId) {
        vehicleFound = true;
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
updateVehicleIdInBrowser('NUCLEAR-TEST', 'APSRTC BUS 01');