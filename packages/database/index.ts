export * from './generated/client';
export { PrismaClient } from './generated/client';

// Re-export commonly used types
export type {
  Tenant,
  TenantSettings,
  User,
  Location,
  Category,
  Product,
  Customer,
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  OrderSource,
  PaymentMethod,
  PaymentStatus,
  UserRole,
  TenantStatus,
} from './generated/client';