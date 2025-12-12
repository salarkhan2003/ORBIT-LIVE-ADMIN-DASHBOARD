"""
WebSocket Server for Real-time Data Feed
This module handles real-time updates for the APSRTC Admin Dashboard
"""

import asyncio
import json
import websockets
import threading
import time
from datetime import datetime
import random
from typing import Dict, Set

# Store connected clients
connected_clients: Set[websockets.WebSocketServerProtocol] = set()

# Mock data that would be updated from actual GPS feeds
mock_bus_data = [
    {
        "bus_id": "APSRTC001",
        "route": "Route 12",
        "location": {"lat": 16.5062, "lng": 80.6480},
        "status": "active",
        "occupancy": 67,
        "speed": 25.0,
        "direction": 45,
        "last_update": datetime.utcnow().isoformat()
    },
    {
        "bus_id": "APSRTC002",
        "route": "Route 15",
        "location": {"lat": 16.5119, "lng": 80.6332},
        "status": "delayed",
        "occupancy": 85,
        "speed": 15.0,
        "direction": 120,
        "last_update": datetime.utcnow().isoformat()
    }
]

async def register_client(websocket: websockets.WebSocketServerProtocol):
    """Register a new client connection"""
    connected_clients.add(websocket)
    print(f"Client connected. Total clients: {len(connected_clients)}")
    
    # Send initial data to the newly connected client
    try:
        initial_data = {
            "type": "initial_data",
            "buses": mock_bus_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        await websocket.send(json.dumps(initial_data))
    except websockets.exceptions.ConnectionClosed:
        pass

async def unregister_client(websocket: websockets.WebSocketServerProtocol):
    """Unregister a client connection"""
    connected_clients.discard(websocket)
    print(f"Client disconnected. Total clients: {len(connected_clients)}")

async def broadcast_data(data: dict):
    """Broadcast data to all connected clients"""
    if connected_clients:
        message = json.dumps(data)
        # Create a copy of the set to avoid modification during iteration
        clients_copy = connected_clients.copy()
        for client in clients_copy:
            try:
                await client.send(message)
            except websockets.exceptions.ConnectionClosed:
                await unregister_client(client)

async def handle_client(websocket: websockets.WebSocketServerProtocol, path: str):
    """Handle individual client connections"""
    await register_client(websocket)
    try:
        async for message in websocket:
            # Handle incoming messages from clients if needed
            data = json.loads(message)
            print(f"Received from client: {data}")
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        await unregister_client(websocket)

def update_mock_data():
    """Update mock data periodically to simulate real-time updates"""
    while True:
        # Update bus locations and statuses
        for bus in mock_bus_data:
            # Simulate movement
            bus["location"]["lat"] += random.uniform(-0.0001, 0.0001)
            bus["location"]["lng"] += random.uniform(-0.0001, 0.0001)
            
            # Simulate changing occupancy
            bus["occupancy"] = max(0, min(100, bus["occupancy"] + random.randint(-5, 5)))
            
            # Simulate changing speed
            bus["speed"] = max(0, bus["speed"] + random.uniform(-2, 2))
            
            # Update timestamp
            bus["last_update"] = datetime.utcnow().isoformat()
        
        # Prepare update message
        update_message = {
            "type": "bus_updates",
            "buses": mock_bus_data,
            "timestamp": datetime.utcnow().isoformat()
        }
        
        # Broadcast in a separate thread to avoid blocking
        asyncio.run_coroutine_threadsafe(
            broadcast_data(update_message),
            asyncio.get_event_loop()
        )
        
        # Wait before next update
        time.sleep(2)  # Update every 2 seconds

async def start_websocket_server():
    """Start the WebSocket server"""
    server = await websockets.serve(handle_client, "localhost", 8765)
    print("WebSocket server started on ws://localhost:8765")
    return server

def run_websocket_server():
    """Run the WebSocket server in a separate thread"""
    # Start the data update thread
    update_thread = threading.Thread(target=update_mock_data, daemon=True)
    update_thread.start()
    
    # Run the WebSocket server
    asyncio.run(start_websocket_server())

if __name__ == "__main__":
    run_websocket_server()