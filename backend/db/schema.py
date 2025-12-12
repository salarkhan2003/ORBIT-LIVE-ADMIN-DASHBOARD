"""
Database Schema for APSRTC Admin Dashboard
This script defines the MongoDB collections and their schemas
"""

from pymongo import MongoClient
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Database connection
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "apsrtc_dashboard")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Collection schemas and indexes

def setup_database():
    """Setup all collections with proper indexes"""
    
    # Buses collection
    buses_collection = db.buses
    buses_collection.create_index("bus_id", unique=True)
    buses_collection.create_index("route")
    buses_collection.create_index("status")
    buses_collection.create_index("last_update")
    
    # Sample bus document
    sample_bus = {
        "bus_id": "APSRTC001",
        "route": "Route 12",
        "location": {
            "lat": 16.5062,
            "lng": 80.6480,
            "address": "Vijayawada Railway Station"
        },
        "status": "active",  # active, delayed, emergency, inactive
        "occupancy": 67,
        "driver": "Rajesh Kumar",
        "next_stop": "Benz Circle",
        "delay": 0,
        "speed": 25.0,
        "direction": 45,
        "last_update": datetime.utcnow()
    }
    
    # Stops collection
    stops_collection = db.stops
    stops_collection.create_index("stop_id", unique=True)
    stops_collection.create_index("location")
    
    # Sample stop document
    sample_stop = {
        "stop_id": "STOP001",
        "name": "Benz Circle",
        "location": {
            "lat": 16.5062,
            "lng": 80.6480,
            "address": "Benz Circle, Vijayawada"
        },
        "crowd_level": 85
    }
    
    # Routes collection
    routes_collection = db.routes
    routes_collection.create_index("route_id", unique=True)
    routes_collection.create_index("name")
    
    # Sample route document
    sample_route = {
        "route_id": "ROUTE12",
        "name": "Route 12",
        "points": [[16.5062, 80.6480], [16.5089, 80.6256], [16.5119, 80.6332]],
        "stops": ["STOP001", "STOP002", "STOP003"]
    }
    
    # Delay predictions collection
    delay_predictions_collection = db.delay_predictions
    delay_predictions_collection.create_index("bus_id")
    delay_predictions_collection.create_index("route")
    delay_predictions_collection.create_index("timestamp")
    
    # Sample delay prediction document
    sample_delay_prediction = {
        "bus_id": "APSRTC002",
        "route": "Route 15",
        "depot": "Vijayawada Depot A",
        "delay": 18,
        "confidence": 92,
        "cause": "Congestion",
        "location": "MG Road, Vijayawada",
        "next_stop": "Governorpet",
        "eta": "15:45",
        "occupancy": 85,
        "timestamp": datetime.utcnow()
    }
    
    # Demand forecast collection
    demand_forecast_collection = db.demand_forecast
    demand_forecast_collection.create_index("route")
    demand_forecast_collection.create_index("time_slot")
    demand_forecast_collection.create_index("timestamp")
    
    # Sample demand forecast document
    sample_demand_forecast = {
        "route": "Route 12",
        "time_slot": "16:00-16:30",
        "demand": 120,
        "capacity": 150,
        "load_percentage": 80,
        "timestamp": datetime.utcnow()
    }
    
    # Anomalies collection
    anomalies_collection = db.anomalies
    anomalies_collection.create_index("bus_id")
    anomalies_collection.create_index("status")
    anomalies_collection.create_index("severity")
    anomalies_collection.create_index("timestamp")
    
    # Sample anomaly document
    sample_anomaly = {
        "bus_id": "APSRTC002",
        "route": "Route 15",
        "status": "overcrowded",  # overcrowded, underutilized
        "severity": "high",  # high, medium, low
        "occupancy": 95,
        "threshold": 85,
        "location": "MG Road, Vijayawada",
        "timestamp": datetime.utcnow(),
        "mitigation": "Add vehicle",
        "reported_by": "System",
        "resolved": False,
        "notes": []
    }
    
    # Recommendations collection
    recommendations_collection = db.recommendations
    recommendations_collection.create_index("priority")
    recommendations_collection.create_index("applied")
    recommendations_collection.create_index("timestamp")
    
    # Sample recommendation document
    sample_recommendation = {
        "title": "Add 1 bus to Route 12",
        "description": "Add one additional bus to Route 12 from 17:00–19:00 to reduce average delay on route by 12%",
        "kpi_impact": {
            "otp": "+12%",
            "delay": "-8 min",
            "occupancy": "-15%"
        },
        "confidence": 92,
        "priority": "high",
        "rationale": "Predicted delay due to recurring congestion at Benz Circle between 17:00–18:00 based on last 30 days",
        "simulation_applied": False,
        "applied": False,
        "timestamp": datetime.utcnow()
    }
    
    # Alerts collection
    alerts_collection = db.alerts
    alerts_collection.create_index("bus_id")
    alerts_collection.create_index("type")
    alerts_collection.create_index("status")
    alerts_collection.create_index("priority")
    alerts_collection.create_index("timestamp")
    
    # Sample alert document
    sample_alert = {
        "type": "emergency",  # emergency, delay, violation, maintenance, crowd, schedule
        "title": "Medical Emergency",
        "message": "Passenger requires medical assistance",
        "bus_id": "APSRTC003",
        "route": "Route 28",
        "location": "Visakhapatnam Port",
        "timestamp": datetime.utcnow(),
        "status": "active",  # active, acknowledged, resolved
        "priority": "high",  # high, medium, low
        "assigned_to": "Emergency Team Alpha",
        "escalation": "SMS → WhatsApp → Call",
        "acknowledged": False,
        "resolved": False
    }
    
    # Drivers collection
    drivers_collection = db.drivers
    drivers_collection.create_index("driver_id", unique=True)
    drivers_collection.create_index("employee_id", unique=True)
    drivers_collection.create_index("route")
    drivers_collection.create_index("depot")
    drivers_collection.create_index("status")
    
    # Sample driver document
    sample_driver = {
        "driver_id": "DRV001",
        "employee_id": "EMP1001",
        "name": "Rajesh Kumar",
        "route": "Route 12",
        "depot": "Vijayawada Depot A",
        "kpi": {
            "on_time_adherence": 96.5,
            "avg_dwell_time": 42,
            "schedule_compliance": 98.2,
            "safety_score": 92,
            "customer_rating": 4.7
        },
        "status": "excellent",  # excellent, good, needs_improvement
        "last_violation": None,
        "total_trips": 127,
        "rating": 4.7,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    # Audit logs collection
    audit_logs_collection = db.audit_logs
    audit_logs_collection.create_index("user")
    audit_logs_collection.create_index("action")
    audit_logs_collection.create_index("timestamp")
    
    # Sample audit log document
    sample_audit_log = {
        "user": "admin_user",
        "action": "Exported passenger data",
        "resource": "Route 12 passenger manifest",
        "timestamp": datetime.utcnow(),
        "ip_address": "192.168.1.105",
        "anonymized": True
    }
    
    print("Database schema setup completed successfully!")
    print(f"Database: {DB_NAME}")
    print("Collections created:")
    print("- buses")
    print("- stops")
    print("- routes")
    print("- delay_predictions")
    print("- demand_forecast")
    print("- anomalies")
    print("- recommendations")
    print("- alerts")
    print("- drivers")
    print("- audit_logs")

def insert_sample_data():
    """Insert sample data for testing"""
    # This function would insert sample data for development/testing purposes
    pass

if __name__ == "__main__":
    setup_database()