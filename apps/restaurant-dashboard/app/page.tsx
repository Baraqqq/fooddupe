'use client';

import { useState, useEffect } from 'react';
import { analyticsApi, orderApi, connectSocket } from '@/lib/api';
import DashboardStats from '@/components/DashboardStats';
import SalesChart from '@/components/SalesChart';
import RecentOrders from '@/components/RecentOrders';
import TopProducts from '@/components/TopProducts';
import { 
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CogIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

type View = 'dashboard' | 'orders' | 'menu' | 'settings';

interface DashboardData {
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  monthOrders: number;
  monthRevenue: number;
  avgOrderValue: number;
  topProducts: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: any[];
  hourlyStats: any[];
}

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

// Socket event types
interface NewOrderEvent {
  orderId: string;
  orderNumber: string;
  total: number;
  type: string;
}

interface OrderStatusEvent {
  orderId: string;
  status: string;
}

export default function RestaurantDashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [analyticsResponse, ordersResponse] = await Promise.all([
          analyticsApi.getOverview(),
          orderApi.getOrders()
        ]);

        if (analyticsResponse.success) {
          setDashboardData(analyticsResponse.data);
        }

        if (ordersResponse.success) {
          setOrders(ordersResponse.data);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Setup Socket.IO for real-time updates
  useEffect(() => {
    const socket = connectSocket();

    socket.on('new-order', (data: NewOrderEvent) => {
      console.log('🔔 New order received:', data);
      // Reload data when new order comes in
      loadOrders();
    });

    socket.on('order-status-updated', (data: OrderStatusEvent) => {
      console.log('🔄 Order status updated:', data);
      setOrders(prev => prev.map(order => 
        order.id === data.orderId 
          ? { ...order, status: data.status }
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

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: ChartBarIcon },
    { id: 'orders', name: 'Orders', icon: ClipboardDocumentListIcon },
    { id: 'menu', name: 'Menu', icon: Bars3Icon },
    { id: 'settings', name: 'Instellingen', icon: CogIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className={`bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? 'w-64' : 'w-16'
      }`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🍕</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">Pizza Mario</h1>
                <p className="text-xs text-gray-600">Restaurant Dashboard</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-8">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id as View)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-50 ${
                currentView === item.id
                  ? 'bg-red-50 border-r-4 border-red-600 text-red-600'
                  : 'text-gray-700'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {sidebarOpen && <span className="ml-3">{item.name}</span>}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {navigation.find(n => n.id === currentView)?.name || 'Dashboard'}
              </h2>
              <p className="text-gray-600">
                {currentView === 'dashboard' && 'Overzicht van je restaurant'}
                {currentView === 'orders' && 'Beheer al je orders'}
                {currentView === 'menu' && 'Beheer je menu en producten'}
                {currentView === 'settings' && 'Restaurant instellingen'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Vandaag</p>
                <p className="font-bold text-green-600">
                  €{dashboardData?.todayRevenue.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {currentView === 'dashboard' && dashboardData && (
            <div className="space-y-6">
              <DashboardStats data={dashboardData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SalesChart />
                <TopProducts products={dashboardData.topProducts} />
              </div>
              <RecentOrders orders={orders.slice(0, 5)} />
            </div>
          )}

          {currentView === 'orders' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Order Management</h3>
              <p className="text-gray-600">Order management interface coming soon...</p>
              <div className="mt-4 space-y-2">
                {orders.slice(0, 10).map(order => (
                  <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="font-medium">{order.orderNumber}</span>
                    <span className="text-sm text-gray-600">{order.customerName}</span>
                    <span className="font-bold text-green-600">€{order.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentView === 'menu' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Menu Management</h3>
              <p className="text-gray-600">Menu management interface coming soon...</p>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Restaurant Settings</h3>
              <p className="text-gray-600">Settings interface coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}