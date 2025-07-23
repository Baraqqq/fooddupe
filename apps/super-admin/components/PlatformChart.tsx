'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { superAdminApi } from '@/lib/api';

interface ChartData {
  period: string;
  tenants: number;
  revenue: number;
  orders: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData;
  }>;
  label?: string;
}

export default function PlatformChart() {
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const response = await superAdminApi.getAnalytics(period);
        if (response.success) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to load chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChartData();
  }, [period]);

  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{`Periode: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              {`Restaurants: ${data.tenants}`}
            </p>
            <p className="text-green-600">
              {`Omzet: €${Number(data.revenue).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}`}
            </p>
            <p className="text-purple-600">
              {`Orders: ${data.orders.toLocaleString()}`}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <h3 className="text-lg font-semibold text-gray-900">Platform Analytics</h3>
        
        <div className="flex space-x-2">
          {/* Period Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Maand' },
              { key: 'quarter', label: 'Kwartaal' }
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setPeriod(item.key as 'week' | 'month' | 'quarter')}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  period === item.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Chart Type Selector */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📈 Lijn
            </button>
            <button
              onClick={() => setChartType('bar')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                chartType === 'bar'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📊 Balken
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-80 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  stroke="#666"
                  fontSize={12}
                />
                {/* LEFT Y-AXIS for Revenue */}
                <YAxis 
                  yAxisId="left"
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value: number) => `€${(value / 1000).toFixed(0)}k`}
                />
                {/* RIGHT Y-AXIS for Tenants */}
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value: number) => `${value}`}
                />
                <Tooltip content={<CustomTooltip />} />
                {/* Revenue Line - Left Axis */}
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  dot={{ fill: '#22c55e', strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 7, stroke: '#22c55e', strokeWidth: 2 }}
                />
                {/* Tenants Line - Right Axis */}
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="tenants" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="period" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#666"
                  fontSize={12}
                  tickFormatter={(value: number) => `€${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="revenue" 
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center text-gray-500">
          <p>Geen data beschikbaar</p>
        </div>
      )}

      {/* Legend */}
      <div className="flex justify-center mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Omzet (Links)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Restaurants (Rechts)</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-purple-500 rounded mr-2"></div>
          <span className="text-sm text-gray-600">Orders</span>
        </div>
      </div>
    </div>
  );
}