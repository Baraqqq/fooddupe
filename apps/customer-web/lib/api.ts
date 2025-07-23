import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add tenant header for all requests
api.interceptors.request.use((config) => {
  // Extract subdomain from window location (pizzamario.localhost)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.includes('.localhost') || hostname.includes('.fooddupe.')) {
      const subdomain = hostname.split('.')[0];
      config.headers['X-Tenant'] = subdomain;
    } else {
      // For development, default to pizzamario
      config.headers['X-Tenant'] = 'pizzamario';
    }
  }
  
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API functions
export const productApi = {
  getProducts: () => 
    api.get('/products').then(res => res.data),
  
  getProductsByCategory: () => 
    api.get('/products/by-category').then(res => res.data),
  
  getCategories: () => 
    api.get('/products/categories').then(res => res.data),
  
  getProduct: (id: string) => 
    api.get(`/products/${id}`).then(res => res.data),
};

export const orderApi = {
  createOrder: (orderData: any) =>
    api.post('/orders', orderData).then(res => res.data),
  
  trackOrder: (orderNumber: string) =>
    api.get(`/orders/track/${orderNumber}`).then(res => res.data),
  
  getOrders: () =>
    api.get('/orders').then(res => res.data),
};

export const authApi = {
  login: (email: string, password: string, tenantSubdomain?: string) =>
    api.post('/auth/login', { email, password, tenantSubdomain }).then(res => res.data),
  
  register: (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) =>
    api.post('/auth/register', userData).then(res => res.data),
  
  getProfile: (token: string) =>
    api.get('/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data),
};

export default api;