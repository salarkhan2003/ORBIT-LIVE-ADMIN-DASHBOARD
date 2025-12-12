import React from 'react';
import StatsCards from './StatsCards';
import CentralLiveMap from './CentralLiveMap';
import DelayPredictionPanel from './DelayPredictionPanel';
import DemandForecast from './DemandForecast';
import LoadAnomalyDetection from './LoadAnomalyDetection';
import RecommendationEngine from './RecommendationEngine';

const OverviewDashboard = () => {
  return (
    <div className="space-y-4 w-full">
      {/* KPI Tiles - Full width row */}
      <div className="w-full">
        <StatsCards />
      </div>

      {/* Main Content - Responsive grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full">
        {/* Left Column - Map (takes 7 columns on large screens) */}
        <div className="lg:col-span-7 w-full h-[600px]">
          <CentralLiveMap />
        </div>

        {/* Right Column - Panels (takes 5 columns on large screens) */}
        <div className="lg:col-span-5 space-y-4 w-full">
          {/* Delay Prediction Panel */}
          <div className="w-full">
            <DelayPredictionPanel />
          </div>

          {/* Load Anomaly Detection */}
          <div className="w-full">
            <LoadAnomalyDetection />
          </div>
        </div>
      </div>

      {/* Full Width Section - Optimization & Simulation */}
      <div className="w-full">
        <RecommendationEngine />
      </div>

      {/* Bottom Section - Demand Forecast */}
      <div className="w-full">
        <DemandForecast />
      </div>
    </div>
  );
};

export default OverviewDashboard;