import React, { useState } from 'react';
import { ref, get, set } from 'firebase/database';
import { db } from '../lib/firebase';
import { Button } from './ui/button';

const VehicleIdUpdater = () => {
  const [oldId, setOldId] = useState('NUCLEAR-TEST');
  const [newId, setNewId] = useState('APSRTC BUS 01');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const updateVehicleId = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      console.log(`🔄 Updating vehicle ID from "${oldId}" to "${newId}"`);
      
      // Get reference to live-telemetry
      const telemetryRef = ref(db, 'live-telemetry');
      const snapshot = await get(telemetryRef);
      
      if (!snapshot.exists()) {
        setMessage('❌ No telemetry data found');
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
          setMessage(`✅ Successfully updated vehicle ID to "${newId}"`);
          break;
        }
      }
      
      if (!vehicleFound) {
        const availableVehicles = Object.values(data)
          .filter(v => v && v.vehicle_id)
          .map(v => v.vehicle_id)
          .join(', ');
        setMessage(`❌ Vehicle "${oldId}" not found. Available: ${availableVehicles}`);
      }
      
    } catch (error) {
      console.error('❌ Error updating vehicle ID:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '300px'
    }}>
      <h3>Vehicle ID Updater</h3>
      <div style={{ marginBottom: '10px' }}>
        <label>Old ID:</label>
        <input 
          type="text" 
          value={oldId} 
          onChange={(e) => setOldId(e.target.value)}
          style={{ width: '100%', padding: '5px', margin: '5px 0' }}
        />
      </div>
      <div style={{ marginBottom: '10px' }}>
        <label>New ID:</label>
        <input 
          type="text" 
          value={newId} 
          onChange={(e) => setNewId(e.target.value)}
          style={{ width: '100%', padding: '5px', margin: '5px 0' }}
        />
      </div>
      <Button 
        onClick={updateVehicleId} 
        disabled={loading || !oldId || !newId}
        style={{ width: '100%', marginBottom: '10px' }}
      >
        {loading ? 'Updating...' : 'Update Vehicle ID'}
      </Button>
      {message && (
        <div style={{ 
          padding: '10px', 
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}
    </div>
  );
};

export default VehicleIdUpdater;