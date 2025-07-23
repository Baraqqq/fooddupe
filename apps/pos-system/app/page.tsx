'use client';

import { useState, useEffect } from 'react';
import { orderApi, connectSocket } from '@/lib/api'; // Removed productApi (unused)
import OrdersList from '@/components/OrdersList';
import NewOrderScreen from '@/components/NewOrderScreen';
import OrderDetails from '@/components/OrderDetails';
import { 
  PlusIcon,
  ListBulletIcon,
  // Removed Cog6ToothIcon (unused)
} from '@heroicons/react/24/outline';

type View = 'orders' | 'new-order' | 'settings';

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
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
  }[];
  createdAt: string;
  notes?: string;
}

// Type for socket events
interface NewOrderEvent {
  orderId: string;
  orderNumber: string;
  total: number;
  type: string;
  estimatedTime?: number;
}

interface OrderStatusEvent {
  orderId: string;
  status: string;
  estimatedTime?: number;
}

export default function POSSystem() {
  const [currentView, setCurrentView] = useState<View>('new-order');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  // Removed unused 'loading' variable

  // Load orders
  useEffect(() => {
    loadOrders();
  }, []);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const socket = connectSocket();

    // Listen for new orders (Fixed type)
    socket.on('new-order', (data: NewOrderEvent) => {
      console.log('🔔 New order received:', data);
      loadOrders();
    });

    // Listen for order updates (Fixed type)
    socket.on('order-status-updated', (data: OrderStatusEvent) => {
      console.log('🔄 Order status updated:', data);
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, status: data.status, estimatedTime: data.estimatedTime }
          : order
      ));
    });

    return () => {
      socket.off('new-order');
      socket.off('order-status-updated');
    };
  }, []);

  const loadOrders = async () => {
    try {
      const response = await orderApi.getOrders();
      if (response.success) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleOrderCreated = (newOrder: Order) => {
    setOrders(prev => [newOrder, ...prev]);
    setCurrentView('orders');
    setSelectedOrder(newOrder);
  };

  const activeOrdersCount = orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🍕</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Pizza Mario POS</h1>
                <p className="text-sm text-gray-700">Restaurant Point of Sale</p>
              </div>
            </div>
            
            {/* Navigation */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentView('new-order')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'new-order'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-500 text-white hover:bg-green-600'
                }`}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Nieuwe Order</span>
              </button>
              
              <button
                onClick={() => setCurrentView('orders')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'orders'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
                <span>Orders ({activeOrdersCount})</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="h-[calc(100vh-80px)]">
        {currentView === 'orders' && (
          <div className="flex h-full">
            <OrdersList 
              orders={orders}
              selectedOrder={selectedOrder}
              onSelectOrder={setSelectedOrder}
              onOrdersUpdate={loadOrders}
            />
            <OrderDetails 
              order={selectedOrder}
              onOrderUpdate={loadOrders}
            />
          </div>
        )}
        
        {currentView === 'new-order' && (
          <NewOrderScreen 
            onOrderCreated={handleOrderCreated}
            onCancel={() => setCurrentView('orders')}
          />
        )}
      </div>
    </div>
  );
}