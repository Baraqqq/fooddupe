'use client';

import { 
  BuildingStorefrontIcon,
  CurrencyEuroIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon, // Changed from TrendingUpIcon
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PlatformStatsProps {
  data: {
    totalTenants: number;
    activeTenants: number;
    trialTenants: number;
    totalRevenue: number;
    monthlyRevenue: number;
    totalOrders: number;
    monthlyOrders: number;
    avgRevenuePerTenant: number;
    growthRate: number;
    churnRate: number;
  };
}

export default function PlatformStats({ data }: PlatformStatsProps) {
  const stats = [
    {
      title: 'Totaal Restaurants',
      value: data.totalTenants.toString(),
      subtitle: `${data.activeTenants} actief, ${data.trialTenants} trial`,
      icon: BuildingStorefrontIcon,
      color: 'bg-blue-500',
      change: `+${data.growthRate}%`,
      changeType: 'positive' as const
    },
    {
      title: 'Maand Omzet',
      value: `€${data.monthlyRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
      subtitle: `${data.monthlyOrders} orders`,
      icon: CurrencyEuroIcon,
      color: 'bg-green-500',
      change: '+18%',
      changeType: 'positive' as const
    },
    {
      title: 'Totale Omzet',
      value: `€${data.totalRevenue.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
      subtitle: `${data.totalOrders} orders`,
      icon: ShoppingCartIcon,
      color: 'bg-purple-500',
      change: '+24%',
      changeType: 'positive' as const
    },
    {
      title: 'Gem. per Restaurant',
      value: `€${data.avgRevenuePerTenant.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`,
      subtitle: 'Per maand',
      icon: ArrowTrendingUpIcon, // Changed from TrendingUpIcon
      color: 'bg-orange-500',
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Actieve Gebruikers',
      value: data.activeTenants.toString(),
      subtitle: `${((data.activeTenants / data.totalTenants) * 100).toFixed(1)}% van totaal`,
      icon: UserGroupIcon,
      color: 'bg-indigo-500',
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Churn Rate',
      value: `${data.churnRate}%`,
      subtitle: 'Maandelijks verlies',
      icon: ExclamationTriangleIcon,
      color: 'bg-red-500',
      change: '-2%',
      changeType: 'negative' as const
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <div key={index} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-1">vs vorige maand</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}