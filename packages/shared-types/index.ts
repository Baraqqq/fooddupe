// Re-export database types
export * from '@fooddupe/database';

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  tenantSubdomain?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    tenantId?: string;
    locationId?: string;
  };
  token: string;
  tenant?: {
    id: string;
    name: string;
    subdomain: string;
  };
}

// Order types
export interface CreateOrderRequest {
  items: {
    productId: string;
    quantity: number;
    notes?: string;
  }[];
  type: 'DELIVERY' | 'PICKUP';
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  paymentMethod: 'CASH' | 'CARD' | 'IDEAL' | 'PAYPAL';
  cashAmount?: number;
  notes?: string;
  scheduledFor?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  estimatedTime?: number;
  paymentUrl?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: 'CONFIRMED' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';
  estimatedTime?: number;
  notes?: string;
}

// Product types
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  isActive?: boolean;
  isPopular?: boolean;
}

// Generic API response
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// JWT Payload
export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  locationId?: string;
  iat?: number;
  exp?: number;
}

// WebSocket Events
export interface SocketEvents {
  // Order events
  'order:created': { orderId: string; tenantId: string; order: OrderResponse };
  'order:updated': { orderId: string; status: string; tenantId: string };
  'order:cancelled': { orderId: string; tenantId: string };
  
  // Kitchen events
  'kitchen:new-order': { order: OrderResponse };
  'kitchen:order-ready': { orderId: string; orderNumber: string };
  
  // POS events
  'pos:order-update': { orderId: string; status: string };
  'pos:new-order': { order: OrderResponse };
  
  // Customer events
  'customer:order-status': { orderId: string; status: string; message: string };
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

// Tenant types
export interface CreateTenantRequest {
  name: string;
  subdomain: string;
  email: string;
  phone?: string;
  plan: string;
  ownerDetails: {
    firstName: string;
    lastName: string;
    password: string;
  };
}

export interface TenantSettingsRequest {
  currency?: string;
  timezone?: string;
  deliveryFee?: number;
  freeDeliveryThreshold?: number;
  taxRate?: number;
  primaryColor?: string;
  accentColor?: string;
  enableDelivery?: boolean;
  enablePickup?: boolean;
  enableOnlinePayment?: boolean;
  enableCashPayment?: boolean;
}