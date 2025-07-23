import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

// ============================================
// PASSWORD UTILITIES
// ============================================

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

// ============================================
// JWT UTILITIES
// ============================================

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  locationId?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
};

// ============================================
// ORDER UTILITIES
// ============================================

export const generateOrderNumber = (tenantSubdomain: string): string => {
  const prefix = tenantSubdomain.substring(0, 3).toUpperCase();
  const timestamp = Date.now().toString().slice(-6);
  const random = nanoid(3).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
};

export const calculateOrderPricing = (
  subtotal: number,
  deliveryFee: number = 0,
  taxRate: number = 0.21
) => {
  const tax = (subtotal + deliveryFee) * taxRate;
  const total = subtotal + deliveryFee + tax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    deliveryFee: Math.round(deliveryFee * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
};

// ============================================
// VALIDATION UTILITIES
// ============================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  // Dutch phone number validation
  const phoneRegex = /^(\+31|0)[0-9]{9}$/;
  return phoneRegex.test(phone.replace(/[^+0-9]/g, ''));
};

export const isValidPostalCode = (postalCode: string): boolean => {
  // Dutch postal code validation
  const postalRegex = /^[1-9][0-9]{3}\s?[A-Z]{2}$/i;
  return postalRegex.test(postalCode);
};

export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ============================================
// ERROR HANDLING
// ============================================

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleAsync = (fn: Function) => {
  return (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// ============================================
// RESPONSE HELPERS
// ============================================

export const successResponse = <T>(data: T, message?: string) => {
  return {
    success: true,
    data,
    message,
  };
};

export const errorResponse = (message: string, code?: string) => {
  return {
    success: false,
    error: message,
    code,
  };
};

// ============================================
// TIME UTILITIES
// ============================================

export const addMinutes = (date: Date, minutes: number): Date => {
  return new Date(date.getTime() + minutes * 60000);
};

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('nl-NL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('nl-NL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// ============================================
// CURRENCY UTILITIES
// ============================================

export const formatCurrency = (amount: number, currency: string = 'EUR'): string => {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const centsToEuros = (cents: number): number => {
  return Math.round(cents) / 100;
};

export const eurosToCents = (euros: number): number => {
  return Math.round(euros * 100);
};