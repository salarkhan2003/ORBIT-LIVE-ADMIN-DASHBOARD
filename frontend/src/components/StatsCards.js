import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Bus, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Battery,
  Fuel,
  MapPin,
  Zap
} from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: 'On-time Performance',
      value: '94.2%',
      change: '+2.1%',
      changeType: 'positive',
      icon: Clock,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Schedule adherence',
      subStats: '3 delayed routes',
      kpi: 'otp'
    },
    {
      title: 'Average Delay',
      value: '8.2 min',
      change: '-1.8 min',
      changeType: 'positive',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      description: 'Per active bus',
      subStats: '15 severe delays',
      kpi: 'avg_delay'
    },
    {
      title: 'Fleet Utilization',
      value: '78.5%',
      change: '+3.2%',
      changeType: 'positive',
      icon: Bus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Active vehicles',
      subStats: '127 of 145 buses',
      kpi: 'fleet_utilization'
    },
    {
      title: 'Fuel Savings',
      value: '12.4%',
      change: '+1.5%',
      changeType: 'positive',
      icon: Fuel,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Projected vs baseline',
      subStats: '₹2.1L saved today',
      kpi: 'fuel_savings'
    },
    {
      title: 'Emission Reduction',
      value: '8.7 tons',
      change: '+0.9 tons',
      changeType: 'positive',
      icon: Zap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'CO2 equivalent',
      subStats: 'Daily average',
      kpi: 'emission_reduction'
    },
    {
      title: 'Active Passengers',
      value: '3,847',
      change: '+8.7%',
      changeType: 'positive',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      description: 'Current occupancy',
      subStats: '67% avg capacity',
      kpi: 'active_passengers'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2 w-full">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-hover hover:shadow-md transition-shadow">
            <CardHeader className="pb-1 pt-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`w-6 h-6 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-3 h-3 ${stat.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 pt-0">
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span>{stat.change}</span>
                {stat.changeType === 'positive' ? (
                  <TrendingUp className="w-3 h-3 ml-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 ml-1 text-red-500" />
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;