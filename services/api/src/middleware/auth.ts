import { Request, Response, NextFunction } from 'express';
import { verifyToken, AppError } from '@fooddupe/utils';
import { PrismaClient } from '@fooddupe/database';

const prisma = new PrismaClient();

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        tenantId?: string;
        locationId?: string;
      };
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token: string | undefined;
    
    // Get token from header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
      throw new AppError('Access denied. No token provided', 401, 'NO_TOKEN');
    }
    
    // Verify token
    const decoded = verifyToken(token);
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        tenantId: true,
        locationId: true,
        isActive: true,
      },
    });
    
    if (!user) {
      throw new AppError('User not found', 401, 'USER_NOT_FOUND');
    }
    
    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }
    
    // Add user to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError('Invalid token', 401, 'INVALID_TOKEN'));
    }
  }
};

// Role-based authorization
export const authorize = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Access denied. Please log in', 401));
    }
    
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Access denied. Insufficient permissions', 403));
    }
    
    next();
  };
};

// Tenant ownership check
export const checkTenantAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Access denied. Please log in', 401));
  }
  
  // SuperAdmin can access all tenants
  if (req.user.role === 'SUPERADMIN') {
    return next();
  }
  
  // Check if user belongs to the requested tenant
  if (req.tenant && req.user.tenantId !== req.tenant.id) {
    return next(new AppError('Access denied. You do not belong to this restaurant', 403));
  }
  
  next();
};