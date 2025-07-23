import { Request, Response, NextFunction } from 'express';
import { AppError } from '@fooddupe/utils';

export const tenantResolver = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🏢 Resolving tenant (MOCK MODE)...');
    
    // Get tenant from header or subdomain
    let tenantIdentifier = req.headers['x-tenant'] as string;
    
    // If no header, try to extract from host
    if (!tenantIdentifier && req.headers.host) {
      const host = req.headers.host;
      
      // Extract subdomain (pizzamario.localhost -> pizzamario)
      if (host.includes('.localhost') || host.includes('.fooddupe.')) {
        tenantIdentifier = host.split('.')[0];
      }
    }
    
    // For development: default to pizzamario if none found
    if (!tenantIdentifier) {
      tenantIdentifier = 'pizzamario';
      console.log('🔄 Using default tenant:', tenantIdentifier);
    }
    
    console.log('🔍 Tenant identifier:', tenantIdentifier);
    
    // Mock tenant data
    const tenant = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Pizza Mario',
      subdomain: 'pizzamario',
      status: 'ACTIVE'
    };
    
    console.log('✅ Mock tenant found:', tenant.name);
    
    // Add tenant to request
    req.tenant = tenant;
    
    next();
  } catch (error) {
    console.error('❌ Tenant resolver error:', error);
    next(error);
  }
};

// import { Request, Response, NextFunction } from 'express';
// import { PrismaClient } from '@fooddupe/database';
// import { AppError } from '@fooddupe/utils';

// const prisma = new PrismaClient({
//   log: ['error'],
// });

// declare global {
//   namespace Express {
//     interface Request {
//       tenant?: {
//         id: string;
//         name: string;
//         subdomain: string;
//         status: string;
//       };
//       io?: any;
//     }
//   }
// }

// export const tenantResolver = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     console.log('🏢 Resolving tenant...');
    
//     // Get tenant from header or subdomain
//     let tenantIdentifier = req.headers['x-tenant'] as string;
    
//     // If no header, try to extract from host
//     if (!tenantIdentifier && req.headers.host) {
//       const host = req.headers.host;
      
//       // Extract subdomain (pizzamario.localhost -> pizzamario)
//       if (host.includes('.localhost') || host.includes('.fooddupe.')) {
//         tenantIdentifier = host.split('.')[0];
//       }
//     }
    
//     // For development: allow bypassing tenant check for superadmin routes
//     if (req.path.startsWith('/superadmin') || !tenantIdentifier) {
//       console.log('⏭️ Skipping tenant check for:', req.path);
//       return next();
//     }
    
//     console.log('🔍 Looking for tenant:', tenantIdentifier);
    
//     // Find tenant by subdomain
//     const tenant = await prisma.tenant.findUnique({
//       where: { subdomain: tenantIdentifier },
//       select: {
//         id: true,
//         name: true,
//         subdomain: true,
//         status: true,
//       },
//     });
    
//     if (!tenant) {
//       console.log('❌ Tenant not found:', tenantIdentifier);
//       throw new AppError('Restaurant not found', 404, 'TENANT_NOT_FOUND');
//     }
    
//     if (tenant.status !== 'ACTIVE' && tenant.status !== 'TRIAL') {
//       console.log('⚠️ Tenant inactive:', tenantIdentifier);
//       throw new AppError('Restaurant is currently unavailable', 403, 'TENANT_INACTIVE');
//     }
    
//     console.log('✅ Tenant found:', tenant.name);
    
//     // Add tenant to request
//     req.tenant = tenant;
    
//     next();
//   } catch (error) {
//     console.error('❌ Tenant resolver error:', error);
//     next(error);
//   }
// };