import React, { useState } from 'react';
import { ref, get, set, remove } from 'firebase/database';
import { db } from '../lib/firebase';
import { Button } from './ui/button';

const DatabaseCleaner = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [duplicates, setDuplicates] = useState([]);

  const findDuplicates = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const telemetryRef = ref(db, 'live-telemetry');
      const snapshot = await get(telemetryRef);
      
      if (!snapshot.exists()) {
        setMessage('❌ No telemetry data found');
        return;
      }
      
      const data = snapshot.val();
      const vehicleGroups = {};
      
      // Group by vehicle_id
      Object.entries(data).forEach(([key, vehicle]) => {
        if (vehicle && vehicle.vehicle_id) {
          const id = vehicle.vehicle_id;
          if (!vehicleGroups[id]) {
            vehicleGroups[id] = [];
          }
          vehicleGroups[id].push({ key, ...vehicle });
        }
      });
      
      // Find duplicates
      const duplicateGroups = Object.entries(vehicleGroups)
        .filter(([id, vehicles]) => vehicles.length > 1);
      
      setDuplicates(duplicateGroups);
      
      if (duplicateGroups.length === 0) {
        setMessage('✅ No duplicates found!');
      } else {
        setMessage(`🔍 Found ${duplicateGroups.length} vehicle(s) with duplicates`);
      }
      
    } catch (error) {
      console.error('Error finding duplicates:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const cleanDuplicates = async () => {
    setLoading(true);
    
    try {
      let removedCount = 0;
      
      for (const [vehicleId, vehicles] of duplicates) {
        // Sort by timestamp (newest first) or by key if no timestamp
        vehicles.sort((a, b) => {
          if (a.timestamp && b.timestamp) {
            return b.timestamp - a.timestamp;
          }
          return b.key.localeCompare(a.key);
        });
        
        // Keep the first (newest) entry, remove the rest
        for (let i = 1; i < vehicles.length; i++) {
          await remove(ref(db, `live-telemetry/${vehicles[i].key}`));
          removedCount++;
          console.log(`🗑️ Removed duplicate entry for ${vehicleId}: ${vehicles[i].key}`);
        }
      }
      
      setMessage(`✅ Cleaned up ${removedCount} duplicate entries`);
      setDuplicates([]);
      
    } catch (error) {
      console.error('Error cleaning duplicates:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'white', 
      padding: '20px', 
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 1000,
      minWidth: '350px',
      maxHeight: '400px',
      overflow: 'auto'
    }}>
      <h3>Database Cleaner</h3>
      
      <div style={{ marginBottom: '10px' }}>
        <Button 
          onClick={findDuplicates} 
          disabled={loading}
          style={{ marginRight: '10px' }}
        >
          {loading ? 'Scanning...' : 'Find Duplicates'}
        </Button>
        
        {duplicates.length > 0 && (
          <Button 
            onClick={cleanDuplicates} 
            disabled={loading}
            variant="destructive"
          >
            Clean Duplicates
          </Button>
        )}
      </div>
      
      {message && (
        <div style={{ 
          padding: '10px', 
          background: message.includes('✅') ? '#d4edda' : message.includes('🔍') ? '#fff3cd' : '#f8d7da',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : message.includes('🔍') ? '#ffeaa7' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '14px',
          marginBottom: '10px'
        }}>
          {message}
        </div>
      )}
      
      {duplicates.length > 0 && (
        <div>
          <h4>Duplicate Vehicles:</h4>
          {duplicates.map(([vehicleId, vehicles]) => (
            <div key={vehicleId} style={{ 
              margin: '5px 0', 
              padding: '5px', 
              background: '#f8f9fa',
              borderRadius: '4px',
              fontSize: '12px'
            }}>
              <strong>{vehicleId}</strong> ({vehicles.length} entries)
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                {vehicles.map((v, i) => (
                  <li key={v.key} style={{ color: i === 0 ? 'green' : 'red' }}>
                    {v.key} {i === 0 ? '(keep)' : '(remove)'}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DatabaseCleaner;