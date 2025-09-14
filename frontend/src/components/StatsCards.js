import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Bus, 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Clock,
  Battery,
  MapPin
} from 'lucide-react';

const StatsCards = () => {
  const stats = [
    {
      title: 'Active Buses',
      value: '127',
      change: '+5.2%',
      changeType: 'positive',
      icon: Bus,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'Currently operating',
      subStats: '145 total fleet'
    },
    {
      title: 'Daily Revenue',
      value: '₹4.2L',
      change: '+12.3%',
      changeType: 'positive',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Today\'s earnings',
      subStats: '8,450 tickets sold'
    },
    {
      title: 'Active Passengers',
      value: '3,847',
      change: '+8.7%',
      changeType: 'positive',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'Current occupancy',
      subStats: '67% avg capacity'
    },
    {
      title: 'On-Time Performance',
      value: '94.2%',
      change: '-1.2%',
      changeType: 'negative',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Schedule adherence',
      subStats: '3 delayed routes'
    },
    {
      title: 'Emergency Alerts',
      value: '2',
      change: '-50%',
      changeType: 'positive',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      description: 'Active incidents',
      subStats: '5 resolved today'
    },
    {
      title: 'Fuel Efficiency',
      value: '8.2km/L',
      change: '+3.1%',
      changeType: 'positive',
      icon: Battery,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      description: 'Fleet average',
      subStats: '12% cost savings'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <Badge 
                  variant={stat.changeType === 'positive' ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
              <div className="space-y-1 mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">{stat.title}</h3>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.description}</p>
                <p className="text-xs text-muted-foreground">{stat.subStats}</p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsCards;