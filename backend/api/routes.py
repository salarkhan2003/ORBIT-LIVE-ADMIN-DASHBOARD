from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter(prefix="/api")

# Data Models
class BusLocation(BaseModel):
    lat: float
    lng: float
    address: str

class Bus(BaseModel):
    id: str
    route: str
    location: BusLocation
    status: str  # active, delayed, emergency, inactive
    occupancy: int
    driver: str
    next_stop: str
    delay: int
    last_update: datetime
    speed: float = 0.0
    direction: int = 0

class Stop(BaseModel):
    id: str
    name: str
    location: BusLocation
    crowd_level: int  # 0-100

class Route(BaseModel):
    id: str
    name: str
    points: List[List[float]]  # List of [lat, lng] coordinates

class DelayPrediction(BaseModel):
    bus_id: str
    route: str
    depot: str
    delay: int
    confidence: int
    cause: str
    location: str
    next_stop: str
    eta: str
    occupancy: int

class DemandForecast(BaseModel):
    time: str
    demand: int
    capacity: int
    load: int

class Anomaly(BaseModel):
    id: str
    bus_id: str
    route: str
    status: str  # overcrowded, underutilized
    severity: str  # high, medium, low
    occupancy: int
    threshold: int
    location: str
    timestamp: datetime
    mitigation: str
    reported_by: str
    resolved: bool

class Recommendation(BaseModel):
    id: str
    title: str
    description: str
    kpi_impact: dict
    confidence: int
    priority: str
    rationale: str
    simulation_applied: bool
    applied: bool

class Alert(BaseModel):
    id: str
    type: str  # emergency, delay, violation, maintenance, crowd, schedule
    title: str
    message: str
    bus_id: str
    route: str
    location: str
    timestamp: datetime
    status: str  # active, acknowledged, resolved
    priority: str  # high, medium, low
    assigned_to: str
    escalation: str
    acknowledged: bool

class KPI(BaseModel):
    title: str
    value: str
    change: str
    change_type: str  # positive, negative
    description: str
    sub_stats: str

class Driver(BaseModel):
    id: str
    name: str
    employee_id: str
    route: str
    depot: str
    kpi: dict
    status: str  # excellent, good, needs_improvement
    last_violation: Optional[str]
    total_trips: int
    rating: float

# Mock data storage
buses_data = [
    Bus(
        id="APSRTC001",
        route="Route 12",
        location=BusLocation(lat=16.5062, lng=80.6480, address="Vijayawada Railway Station"),
        status="active",
        occupancy=67,
        driver="Rajesh Kumar",
        next_stop="Benz Circle",
        delay=0,
        last_update=datetime.now(),
        speed=25.0,
        direction=45
    ),
    Bus(
        id="APSRTC002",
        route="Route 15",
        location=BusLocation(lat=16.5119, lng=80.6332, address="MG Road, Vijayawada"),
        status="delayed",
        occupancy=85,
        driver="Suresh Singh",
        next_stop="Governorpet",
        delay=8,
        last_update=datetime.now(),
        speed=15.0,
        direction=120
    )
]

stops_data = [
    Stop(
        id="STOP001",
        name="Benz Circle",
        location=BusLocation(lat=16.5062, lng=80.6480, address="Benz Circle, Vijayawada"),
        crowd_level=85
    )
]

routes_data = [
    Route(
        id="ROUTE12",
        name="Route 12",
        points=[[16.5062, 80.6480], [16.5089, 80.6256], [16.5119, 80.6332]]
    )
]

delay_predictions_data = [
    DelayPrediction(
        bus_id="APSRTC002",
        route="Route 15",
        depot="Vijayawada Depot A",
        delay=18,
        confidence=92,
        cause="Congestion",
        location="MG Road, Vijayawada",
        next_stop="Governorpet",
        eta="15:45",
        occupancy=85
    )
]

demand_forecast_data = [
    DemandForecast(time="16:00", demand=120, capacity=150, load=80),
    DemandForecast(time="16:30", demand=145, capacity=150, load=97)
]

anomalies_data = [
    Anomaly(
        id="ANOM001",
        bus_id="APSRTC002",
        route="Route 15",
        status="overcrowded",
        severity="high",
        occupancy=95,
        threshold=85,
        location="MG Road, Vijayawada",
        timestamp=datetime.now(),
        mitigation="Add vehicle",
        reported_by="System",
        resolved=False
    )
]

recommendations_data = [
    Recommendation(
        id="REC001",
        title="Add 1 bus to Route 12",
        description="Add one additional bus to Route 12 from 17:00–19:00 to reduce average delay on route by 12%",
        kpi_impact={"otp": "+12%", "delay": "-8 min", "occupancy": "-15%"},
        confidence=92,
        priority="high",
        rationale="Predicted delay due to recurring congestion at Benz Circle between 17:00–18:00 based on last 30 days",
        simulation_applied=False,
        applied=False
    )
]

alerts_data = [
    Alert(
        id="ALERT001",
        type="emergency",
        title="Medical Emergency",
        message="Passenger requires medical assistance",
        bus_id="APSRTC003",
        route="Route 28",
        location="Visakhapatnam Port",
        timestamp=datetime.now(),
        status="active",
        priority="high",
        assigned_to="Emergency Team Alpha",
        escalation="SMS → WhatsApp → Call",
        acknowledged=False
    )
]

kpis_data = [
    KPI(
        title="On-time Performance",
        value="94.2%",
        change="+2.1%",
        change_type="positive",
        description="Schedule adherence",
        sub_stats="3 delayed routes"
    )
]

drivers_data = [
    Driver(
        id="DRV001",
        name="Rajesh Kumar",
        employee_id="EMP1001",
        route="Route 12",
        depot="Vijayawada Depot A",
        kpi={
            "on_time_adherence": 96.5,
            "avg_dwell_time": 42,
            "schedule_compliance": 98.2,
            "safety_score": 92,
            "customer_rating": 4.7
        },
        status="excellent",
        last_violation=None,
        total_trips=127,
        rating=4.7
    )
]

# API Routes
@router.get("/buses")
async def get_buses(status: Optional[str] = None):
    """Get all buses or filter by status"""
    if status:
        return [bus for bus in buses_data if bus.status == status]
    return buses_data

@router.get("/buses/{bus_id}")
async def get_bus(bus_id: str):
    """Get specific bus by ID"""
    bus = next((bus for bus in buses_data if bus.id == bus_id), None)
    if not bus:
        raise HTTPException(status_code=404, detail="Bus not found")
    return bus

@router.get("/stops")
async def get_stops():
    """Get all stops"""
    return stops_data

@router.get("/routes")
async def get_routes():
    """Get all routes"""
    return routes_data

@router.get("/delay-predictions")
async def get_delay_predictions():
    """Get delay predictions"""
    return delay_predictions_data

@router.get("/demand-forecast")
async def get_demand_forecast():
    """Get demand forecast"""
    return demand_forecast_data

@router.get("/anomalies")
async def get_anomalies():
    """Get load anomalies"""
    return anomalies_data

@router.get("/recommendations")
async def get_recommendations():
    """Get optimization recommendations"""
    return recommendations_data

@router.get("/alerts")
async def get_alerts(status: Optional[str] = None):
    """Get alerts or filter by status"""
    if status:
        return [alert for alert in alerts_data if alert.status == status]
    return alerts_data

@router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    for alert in alerts_data:
        if alert.id == alert_id:
            alert.acknowledged = True
            alert.status = "acknowledged"
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.put("/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str):
    """Resolve an alert"""
    for alert in alerts_data:
        if alert.id == alert_id:
            alert.status = "resolved"
            return alert
    raise HTTPException(status_code=404, detail="Alert not found")

@router.get("/kpis")
async def get_kpis():
    """Get KPIs"""
    return kpis_data

@router.get("/drivers")
async def get_drivers(status: Optional[str] = None):
    """Get all drivers or filter by status"""
    if status:
        return [driver for driver in drivers_data if driver.status == status]
    return drivers_data

@router.get("/drivers/{driver_id}")
async def get_driver(driver_id: str):
    """Get specific driver by ID"""
    driver = next((driver for driver in drivers_data if driver.id == driver_id), None)
    if not driver:
        raise HTTPException(status_code=404, detail="Driver not found")
    return driver

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now()}