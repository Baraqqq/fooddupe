import axios from 'axios';
import io, { Socket } from 'socket.io-client';

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
  // For POS, always use pizzamario tenant
  config.headers['X-Tenant'] = 'pizzamario';
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
export const orderApi = {
  // Get orders
  getOrders: (status?: string) => {
    const params = status ? { status } : {};
    return api.get('/orders', { params }).then(res => res.data);
  },
  
  // Create new order (MISSING FUNCTION - ADDED)
  createOrder: (orderData: any) =>
    api.post('/orders', orderData).then(res => res.data),
  
  // Update order status
  updateOrderStatus: (orderId: string, status: string, estimatedTime?: number) =>
    api.put(`/orders/${orderId}/status`, { status, estimatedTime }).then(res => res.data),
  
  // Get single order
  getOrder: (orderId: string) =>
    api.get(`/orders/${orderId}`).then(res => res.data),
  
  // Track order
  trackOrder: (orderNumber: string) =>
    api.get(`/orders/track/${orderNumber}`).then(res => res.data),
};

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

// Socket.IO client
let socket: Socket | null = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(API_URL);
    
    socket.on('connect', () => {
      console.log('🔌 POS connected to server');
      // Join tenant room for real-time updates
      socket?.emit('join-tenant', 'pizzamario');
    });
    
    socket.on('disconnect', () => {
      console.log('🔌 POS disconnected from server');
    });
  }
  
  return socket;
};

export const getSocket = () => socket;

export default api;