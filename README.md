# 🚌 ORBIT LIVE - Admin Dashboard

<div align="center">

![ORBIT LIVE](https://img.shields.io/badge/ORBIT-LIVE-blue?style=for-the-badge&logo=bus&logoColor=white)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

**AI-Powered Real-Time Fleet Management System for APSRTC**

[Live Demo](https://your-vercel-url.vercel.app) • [Documentation](#documentation) • [Features](#features)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Screenshots](#screenshots)
- [Contributing](#contributing)

---

## 🎯 Overview

**ORBIT LIVE** is a comprehensive, AI-powered admin dashboard designed for APSRTC (Andhra Pradesh State Road Transport Corporation) to revolutionize fleet management, route optimization, and real-time operations monitoring.

### 🌟 What Makes ORBIT LIVE Special?

- **Real-Time Fleet Tracking** - Monitor 1000+ buses across Andhra Pradesh in real-time
- **AI-Powered Recommendations** - Smart optimization suggestions based on historical data and ML predictions
- **Predictive Analytics** - Delay prediction, demand forecasting, and anomaly detection
- **What-If Simulations** - Test scenarios before implementing changes
- **Multi-Role Access** - Tailored dashboards for Route Planners, Control Room Staff, and Depot Officials

---

## ✨ Key Features

### 🗺️ **Central Live Map**
- Real-time GPS tracking of entire fleet
- Color-coded bus status indicators
- Route visualization with traffic overlays
- Interactive map controls with clustering

### 📊 **Optimization Recommendations Engine**
- AI-generated actionable recommendations
- KPI impact predictions (OTP, Delay, Occupancy)
- Confidence scoring for each recommendation
- One-click simulation and application
- Historical rationale for transparency

### 🔮 **Predictive Analytics**
- **Delay Prediction**: ML-based delay forecasting for routes
- **Demand Forecast**: Passenger demand prediction by time and route
- **Load Anomaly Detection**: Real-time overcrowding alerts
- **Crowd Analytics**: Heatmaps and trend analysis

### 🎮 **What-If Simulator**
- Test operational changes before implementation
- Scenario modeling (surge demand, accidents, weather)
- Resource impact analysis
- Before/after KPI comparisons

### 📈 **Comprehensive Dashboards**
- **Overview Dashboard**: High-level KPIs and system health
- **Route Management**: Route planning and optimization
- **Fleet Management**: Vehicle tracking and maintenance
- **Staff Management**: Driver KPIs and scheduling
- **Reports & Analytics**: Custom reports and data exports

### 🔔 **Real-Time Alerts & Notifications**
- Critical event notifications
- Delay alerts with severity levels
- Maintenance reminders
- Emergency management system

### 🌐 **Multi-Language Support**
- English, Telugu, Hindi, Tamil, Kannada
- Accessibility features (WCAG 2.1 compliant)
- Screen reader support

---

## 🛠️ Tech Stack

### Frontend
```
React 18.2.0          - UI Framework
Tailwind CSS 3.4      - Styling
shadcn/ui             - Component Library
Lucide React          - Icons
React Router DOM 7.5  - Routing
Axios                 - HTTP Client
React Hook Form       - Form Management
Zod                   - Schema Validation
```

### Backend
```
Python 3.11+          - Backend Language
Flask                 - Web Framework
SQLite                - Database
WebSocket             - Real-time Communication
```

### DevOps & Deployment
```
Vercel                - Frontend Hosting
Git                   - Version Control
npm/pip               - Package Management
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ORBIT LIVE SYSTEM                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Frontend   │◄──►│   Backend    │◄──►│   Database   │ │
│  │   (React)    │    │   (Flask)    │    │   (SQLite)   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                    │                              │
│         │                    │                              │
│  ┌──────▼────────────────────▼──────────────────────────┐  │
│  │           Real-Time WebSocket Layer                   │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AI/ML Services                           │  │
│  │  • Delay Prediction  • Demand Forecasting             │  │
│  │  • Anomaly Detection • Recommendation Engine          │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 14.x or higher
- Python 3.11 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/ORBIT-LIVE-ADMIN-DASHBOARD.git
cd ORBIT-LIVE-ADMIN-DASHBOARD
```

2. **Install Frontend Dependencies**
```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**
```bash
cd ../backend
pip install -r requirements.txt
```

4. **Set up Environment Variables**

Create `.env` files in both frontend and backend directories:

**Frontend (.env)**
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

**Backend (.env)**
```env
FLASK_APP=server.py
FLASK_ENV=development
DATABASE_URL=sqlite:///orbit.db
SECRET_KEY=your-secret-key-here
```

5. **Run the Application**

**Terminal 1 - Backend:**
```bash
cd backend
python server.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at `http://localhost:3000`

---

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [Vercel Dashboard](https://vercel.com)
- Import your GitHub repository
- Vercel will automatically detect the configuration

3. **Configure Build Settings**
- Build Command: `npm run build` (already configured in `vercel.json`)
- Output Directory: `frontend/build`
- Install Command: `npm install --prefix frontend`

4. **Deploy**
- Click "Deploy"
- Your app will be live at `https://your-project.vercel.app`

### Environment Variables on Vercel

Add these in Vercel Dashboard → Settings → Environment Variables:
```
REACT_APP_API_URL=your-backend-url
REACT_APP_WS_URL=your-websocket-url
```

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](https://via.placeholder.com/800x400?text=Dashboard+Overview)

### Optimization Recommendations
![Recommendations](https://via.placeholder.com/800x400?text=Optimization+Recommendations)

### Live Fleet Map
![Fleet Map](https://via.placeholder.com/800x400?text=Live+Fleet+Map)

### What-If Simulator
![Simulator](https://via.placeholder.com/800x400?text=What-If+Simulator)

---

## 📚 Documentation

### Project Structure
```
ORBIT-LIVE-ADMIN-DASHBOARD/
├── frontend/                 # React frontend application
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── ui/         # shadcn/ui components
│   │   │   ├── Dashboard.js
│   │   │   ├── RecommendationEngine.js
│   │   │   ├── WhatIfSimulator.js
│   │   │   └── ...
│   │   ├── contexts/        # React contexts
│   │   ├── hooks/           # Custom hooks
│   │   ├── lib/             # Utilities
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
├── backend/                  # Python Flask backend
│   ├── api/                 # API routes
│   ├── db/                  # Database schemas
│   ├── websocket/           # WebSocket server
│   ├── privacy/             # Compliance modules
│   ├── server.py
│   └── requirements.txt
├── vercel.json              # Vercel configuration
├── package.json             # Root package.json
└── README.md
```

### Key Components

#### Optimization Recommendations Engine
Located at: `frontend/src/components/RecommendationEngine.js`

Features:
- AI-generated recommendations with confidence scores
- KPI impact visualization (OTP, Delay, Occupancy)
- Simulation preview before applying changes
- Color-coded priority badges
- One-click apply functionality

#### What-If Simulator
Located at: `frontend/src/components/WhatIfSimulator.js`

Features:
- Scenario configuration interface
- Predefined scenario templates
- Real-time simulation results
- Resource impact analysis
- Before/after KPI comparisons

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style

- Follow ESLint configuration for JavaScript
- Use PEP 8 for Python code
- Write meaningful commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

- **Project Lead** - System Architecture & Design
- **Frontend Team** - React Development & UI/UX
- **Backend Team** - API Development & Database
- **ML Team** - Predictive Models & AI Features

---

## 📞 Support

For support, email support@orbitlive.com or join our Slack channel.

---

## 🙏 Acknowledgments

- APSRTC for project requirements and domain expertise
- shadcn/ui for the beautiful component library
- Lucide for the icon set
- Vercel for hosting platform

---

<div align="center">

**Made with ❤️ for APSRTC**

[⬆ Back to Top](#-orbit-live---admin-dashboard)

</div>
