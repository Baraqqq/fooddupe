import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@fooddupe/database';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  AppError,
  successResponse,
  isValidEmail 
} from '@fooddupe/utils';
import { LoginRequest, RegisterRequest, AuthResponse } from '@fooddupe/types';

const prisma = new PrismaClient();

export class AuthController {
  
  // Login
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, tenantSubdomain }: LoginRequest = req.body;
      
      // Validation
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }
      
      if (!isValidEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }
      
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              status: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      
      if (!user) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // Check password
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }
      
      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Account is deactivated', 401);
      }
      
      // For non-superadmin users, check tenant
      if (user.role !== 'SUPERADMIN') {
        if (!user.tenant) {
          throw new AppError('No restaurant associated with account', 400);
        }
        
        if (user.tenant.status !== 'ACTIVE' && user.tenant.status !== 'TRIAL') {
          throw new AppError('Restaurant account is suspended', 403);
        }
        
        // If tenantSubdomain is provided, verify it matches
        if (tenantSubdomain && user.tenant.subdomain !== tenantSubdomain) {
          throw new AppError('Invalid restaurant', 400);
        }
      }
      
      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId || undefined,
        locationId: user.locationId || undefined,
      });
      
      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
      
      // Prepare response
      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          tenantId: user.tenantId || undefined,
          locationId: user.locationId || undefined,
        },
        token,
        tenant: user.tenant ? {
          id: user.tenant.id,
          name: user.tenant.name,
          subdomain: user.tenant.subdomain,
        } : undefined,
      };
      
      res.json(successResponse(authResponse, 'Login successful'));
      
    } catch (error) {
      next(error);
    }
  }
  
  // Register (for customers via website)
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { firstName, lastName, email, password, phone }: RegisterRequest = req.body;
      
      // Validation
      if (!firstName || !lastName || !email || !password) {
        throw new AppError('All fields are required', 400);
      }
      
      if (!isValidEmail(email)) {
        throw new AppError('Invalid email format', 400);
      }
      
      if (password.length < 6) {
        throw new AppError('Password must be at least 6 characters', 400);
      }
      
      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        throw new AppError('User with this email already exists', 400);
      }
      
      // Hash password
      const passwordHash = await hashPassword(password);
      
      // Create user (no tenant - this is for customers)
      const user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName,
          passwordHash,
          role: 'EMPLOYEE', // Default role for registered users
        },
      });
      
      // Generate token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });
      
      const authResponse: AuthResponse = {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      };
      
      res.status(201).json(successResponse(authResponse, 'Registration successful'));
      
    } catch (error) {
      next(error);
    }
  }
  
  // Get current user profile
  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not found', 404);
      }
      
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              subdomain: true,
              status: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              address: true,
            },
          },
        },
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      const profile = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        tenant: user.tenant,
        location: user.location,
      };
      
      res.json(successResponse(profile));
      
    } catch (error) {
      next(error);
    }
  }
  
  // Update profile
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not found', 404);
      }
      
      const { firstName, lastName, phone } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          ...(firstName && { firstName }),
          ...(lastName && { lastName }),
        },
      });
      
      res.json(successResponse(updatedUser, 'Profile updated successfully'));
      
    } catch (error) {
      next(error);
    }
  }
  
  // Change password
  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new AppError('User not found', 404);
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400);
      }
      
      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters', 400);
      }
      
      // Get user with password
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
      });
      
      if (!user) {
        throw new AppError('User not found', 404);
      }
      
      // Verify current password
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }
      
      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);
      
      // Update password
      await prisma.user.update({
        where: { id: req.user.id },
        data: { passwordHash: newPasswordHash },
      });
      
      res.json(successResponse(null, 'Password changed successfully'));
      
    } catch (error) {
      next(error);
    }
  }
}