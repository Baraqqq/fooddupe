'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '@/lib/api';

interface ChartData {
  time: string;
  orders: number;
  revenue: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: ChartData;
  }>;
  label?: string;
}

export default function SalesChart() {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadChartData = async () => {
      try {
        setLoading(true);
        const response = await analyticsApi.getSalesData(period);
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
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{`Tijd: ${label}`}</p>
          <p className="text-red-600">
            {`Omzet: €${Number(payload[0].value).toFixed(2)}`}
          </p>
          <p className="text-blue-600">
            {`Orders: ${payload[0].payload.orders || 0}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Omzet Overzicht</h3>
        <div className="flex space-x-2">
          {[
            { key: 'today', label: 'Vandaag' },
            { key: 'week', label: 'Week' },
            { key: 'month', label: 'Maand' }
          ].map(item => (
            <button
              key={item.key}
              onClick={() => setPeriod(item.key as 'today' | 'week' | 'month')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                period === item.key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="time" 
                stroke="#666"
                fontSize={12}
              />
              <YAxis 
                stroke="#666"
                fontSize={12}
                tickFormatter={(value: number) => `€${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#dc2626" 
                strokeWidth={3}
                dot={{ fill: '#dc2626', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#dc2626', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>Geen data beschikbaar</p>
        </div>
      )}
    </div>
  );
}