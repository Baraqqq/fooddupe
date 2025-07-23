'use client';

import { useState, useEffect } from 'react';
import { superAdminApi } from '@/lib/api';
import PlatformStats from '@/components/PlatformStats';
import TenantsTable from '@/components/TenantsTable';
import PlatformChart from '@/components/PlatformChart';
import CreateTenantModal from '@/components/CreateTenantModal';
import { 
  ChartBarIcon,
  BuildingStorefrontIcon,
  CogIcon,
  UserGroupIcon,
  PlusIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';

type View = 'dashboard' | 'tenants' | 'analytics' | 'settings';

interface PlatformData {
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
}

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
  plan: string;
  monthlyRevenue: number;
  totalOrders: number;
  createdAt: string;
  trialEndsAt?: string;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function SuperAdminDashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [platformData, setPlatformData] = useState<PlatformData | null>(null);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load platform data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [overviewResponse, tenantsResponse] = await Promise.all([
          superAdminApi.getPlatformOverview(),
          superAdminApi.getTenants()
        ]);

        if (overviewResponse.success) {
          setPlatformData(overviewResponse.data);
        }

        if (tenantsResponse.success) {
          setTenants(tenantsResponse.data);
        }
      } catch (error) {
        console.error('Failed to load platform data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleCreateTenant = async (tenantData: any) => {
    try {
      const response = await superAdminApi.createTenant(tenantData);
      if (response.success) {
        setTenants(prev => [response.data, ...prev]);
        setShowCreateModal(false);
        // Show success message
        alert('Restaurant succesvol aangemaakt!');
      }
    } catch (error) {
      console.error('Failed to create tenant:', error);
      alert('Kon restaurant niet aanmaken');
    }
  };

  const navigation = [
    { id: 'dashboard', name: 'Platform Overview', icon: ChartBarIcon },
    { id: 'tenants', name: 'Restaurants', icon: BuildingStorefrontIcon },
    { id: 'analytics', name: 'Analytics', icon: UserGroupIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">🏢</span>
            </div>
            {sidebarOpen && (
              <div>
                <h1 className="font-bold text-gray-900">FoodDupe</h1>
                <p className="text-xs text-gray-600">Super Admin</p>
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
                  ? 'bg-blue-50 border-r-4 border-blue-600 text-blue-600'
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
                {currentView === 'dashboard' && 'FoodDupe SaaS Platform overzicht'}
                {currentView === 'tenants' && 'Beheer alle restaurants op het platform'}
                {currentView === 'analytics' && 'Platform analytics en rapportage'}
                {currentView === 'settings' && 'Platform instellingen en configuratie'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentView === 'tenants' && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>Nieuw Restaurant</span>
                </button>
              )}
              
              <div className="text-right">
                <p className="text-sm text-gray-600">Totale Omzet</p>
                <p className="font-bold text-green-600">
                  €{platformData?.totalRevenue.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {currentView === 'dashboard' && platformData && (
            <div className="space-y-6">
              <PlatformStats data={platformData} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PlatformChart />
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {tenants.slice(0, 5).map(tenant => (
                      <div key={tenant.id} className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{tenant.name}</p>
                          <p className="text-sm text-gray-500">{tenant.subdomain}.fooddupe.nl</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tenant.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                          tenant.status === 'TRIAL' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {tenant.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentView === 'tenants' && (
            <TenantsTable 
              tenants={tenants} 
              onUpdate={setTenants}
            />
          )}

          {currentView === 'analytics' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Analytics</h3>
              <p className="text-gray-600">Advanced analytics coming soon...</p>
            </div>
          )}

          {currentView === 'settings' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Settings</h3>
              <p className="text-gray-600">Platform configuration coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Tenant Modal */}
      <CreateTenantModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTenant}
      />
    </div>
  );
}