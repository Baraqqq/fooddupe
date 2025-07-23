'use client';

import { 
  CurrencyEuroIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';

interface DashboardStatsProps {
  data: {
    todayOrders: number;
    todayRevenue: number;
    weekOrders: number;
    weekRevenue: number;
    monthOrders: number;
    monthRevenue: number;
    avgOrderValue: number;
  };
}

export default function DashboardStats({ data }: DashboardStatsProps) {
  const stats = [
    {
      title: 'Vandaag Omzet',
      value: `€${data.todayRevenue.toFixed(2)}`,
      subtitle: `${data.todayOrders} orders`,
      icon: 'CurrencyEuroIcon',
      color: 'bg-green-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Week Omzet',
      value: `€${data.weekRevenue.toFixed(2)}`,
      subtitle: `${data.weekOrders} orders`,
      icon: 'CalendarDaysIcon',
      color: 'bg-blue-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'Maand Omzet',
      value: `€${data.monthRevenue.toFixed(2)}`,
      subtitle: `${data.monthOrders} orders`,
      icon: 'TrendingUpIcon',
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      title: 'Gem. Order Waarde',
      value: `€${data.avgOrderValue.toFixed(2)}`,
      subtitle: 'Per bestelling',
      icon: 'ShoppingBagIcon',
      color: 'bg-orange-500',
      change: '+3%',
      changeType: 'positive'
    },
  ];

  // Icon mapping object
  const iconMap = {
    CurrencyEuroIcon,
    CalendarDaysIcon,
    TrendingUpIcon,
    ShoppingBagIcon,
  };

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    if (!IconComponent) return null;
    return <IconComponent className="w-6 h-6 text-white" />;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              {renderIcon(stat.icon)}
            </div>
          </div>
          <div className="mt-4">
            <span className={`text-sm font-medium ${
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change} vs vorige week
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}