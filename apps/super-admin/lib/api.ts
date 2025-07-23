import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Mock data for now - later will be real API calls
// Update superAdminApi to use real endpoints
export const superAdminApi = {
  // Get platform overview - NOW USES REAL API
  getPlatformOverview: () => 
    api.get('/analytics/platform').then(res => res.data),

  // Get analytics data - NOW USES REAL API
  getAnalytics: (period: 'week' | 'month' | 'quarter') => 
    api.get(`/analytics/platform/sales/${period}`).then(res => res.data),

  // Keep existing tenant management functions...
  getTenants: () => {
    return Promise.resolve({
      success: true,
      data: [
        {
          id: '1',
          name: 'Pizza Mario',
          subdomain: 'pizzamario',
          email: 'owner@pizzamario.nl',
          phone: '036-841-4025',
          status: 'ACTIVE',
          plan: 'professional',
          monthlyRevenue: 3842.75,
          totalOrders: 189,
          createdAt: '2024-01-15T10:30:00Z',
          trialEndsAt: null,
          owner: {
            firstName: 'Mario',
            lastName: 'Rossi',
            email: 'mario@pizzamario.nl'
          }
        }
      ]
    });
  },

  // Rest stays the same...
  createTenant: (tenantData: any) => {
    console.log('Creating tenant:', tenantData);
    return Promise.resolve({
      success: true,
      data: {
        id: Date.now().toString(),
        ...tenantData,
        createdAt: new Date().toISOString(),
        status: 'TRIAL',
        trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    });
  },

  updateTenant: (tenantId: string, updateData: any) => {
    console.log('Updating tenant:', tenantId, updateData);
    return Promise.resolve({
      success: true,
      data: { ...updateData, id: tenantId }
    });
  },

  deleteTenant: (tenantId: string) => {
    console.log('Deleting tenant:', tenantId);
    return Promise.resolve({
      success: true,
      message: 'Tenant deleted successfully'
    });
  }
};

export default api;