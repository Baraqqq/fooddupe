'use client';

import { useState } from 'react';
import { ClockIcon } from '@heroicons/react/24/outline';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  type: string;
  total: number;
  customerName: string;
  customerPhone: string;
  deliveryAddress?: string;
  estimatedTime?: number;
  items: any[];
  createdAt: string;
  notes?: string;
}

interface OrdersListProps {
  orders: Order[];
  selectedOrder: Order | null;
  onSelectOrder: (order: Order) => void;
  onOrdersUpdate: () => void;
}

const ORDER_STATUSES = {
  PENDING: { label: 'Nieuw', color: 'bg-yellow-500' },
  CONFIRMED: { label: 'Bevestigd', color: 'bg-blue-500' },
  PREPARING: { label: 'In Bereiding', color: 'bg-orange-500' },
  READY: { label: 'Klaar', color: 'bg-green-500' },
  COMPLETED: { label: 'Afgerond', color: 'bg-gray-500' },
  CANCELLED: { label: 'Geannuleerd', color: 'bg-red-500' },
};

export default function OrdersList({ orders, selectedOrder, onSelectOrder, onOrdersUpdate }: OrdersListProps) {
  const [filter, setFilter] = useState<string>('active');

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return !['COMPLETED', 'CANCELLED'].includes(order.status);
    }
    if (filter === 'completed') {
      return ['COMPLETED', 'CANCELLED'].includes(order.status);
    }
    return true;
  });

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const orderTime = new Date(dateString);
    const diffMs = now.getTime() - orderTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Nu';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    return `${diffHours}u ${diffMins % 60}m`;
  };

  return (
    <div className="w-1/2 bg-white border-r overflow-y-auto">
      {/* Filter Tabs */}
      <div className="border-b bg-gray-50">
        <div className="flex">
          {[
            { key: 'active', label: 'Actief', count: orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length },
            { key: 'completed', label: 'Afgerond', count: orders.filter(o => ['COMPLETED', 'CANCELLED'].includes(o.status)).length },
            { key: 'all', label: 'Alle', count: orders.length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-6 py-4 text-sm font-medium border-b-2 ${
                filter === tab.key
                  ? 'border-red-600 text-red-600 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      <div className="divide-y">
        {filteredOrders.map(order => (
          <div
            key={order.id}
            onClick={() => onSelectOrder(order)}
            className={`p-4 cursor-pointer hover:bg-gray-50 ${
              selectedOrder?.id === order.id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg">{order.orderNumber}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                  ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.color || 'bg-gray-500'
                }`}>
                  {ORDER_STATUSES[order.status as keyof typeof ORDER_STATUSES]?.label || order.status}
                </span>
              </div>
              <span className="text-sm text-gray-500">{getTimeAgo(order.createdAt)}</span>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{order.customerName}</span>
              <span className="font-bold text-red-600">€{order.total.toFixed(2)}</span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded text-xs ${
                order.type === 'DELIVERY' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}>
                {order.type === 'DELIVERY' ? 'Bezorging' : 'Afhalen'}
              </span>
              <span>{order.items.length} items</span>
              {order.estimatedTime && (
                <span className="flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  {order.estimatedTime}m
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <p>Geen orders gevonden</p>
        </div>
      )}
    </div>
  );
}