import { Request, Response, NextFunction } from 'express';
import { AppError, successResponse } from '@fooddupe/utils';

// Mock data voor testing
const mockCategories = [
  { id: '1', name: 'Pizza\'s', slug: 'pizzas', sortOrder: 1 },
  { id: '2', name: 'Pasta', slug: 'pasta', sortOrder: 2 },
  { id: '3', name: 'Dranken', slug: 'drinks', sortOrder: 3 },
];

const mockProducts = [
  {
    id: '1',
    name: 'Margherita',
    description: 'Tomatensaus, mozzarella, verse basilicum',
    price: 12.50,
    isActive: true,
    isPopular: true,
    category: { id: '1', name: 'Pizza\'s', slug: 'pizzas' }
  },
  {
    id: '2',
    name: 'Pepperoni',
    description: 'Tomatensaus, mozzarella, pepperoni',
    price: 15.00,
    isActive: true,
    isPopular: false,
    category: { id: '1', name: 'Pizza\'s', slug: 'pizzas' }
  },
  {
    id: '3',
    name: 'Spaghetti Carbonara',
    description: 'Romige saus met spek, ei en parmezaanse kaas',
    price: 14.50,
    isActive: true,
    isPopular: true,
    category: { id: '2', name: 'Pasta', slug: 'pasta' }
  },
  {
    id: '4',
    name: 'Coca Cola',
    description: 'Frisdrank 330ml',
    price: 2.50,
    isActive: true,
    isPopular: true,
    category: { id: '3', name: 'Dranken', slug: 'drinks' }
  },
];

export class ProductController {
  
  // Get products grouped by category
  async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Getting products by category (MOCK DATA)');
      
      // Mock data response
      const categories = mockCategories.map(cat => ({
        ...cat,
        products: mockProducts.filter(p => p.category.id === cat.id)
      }));
      
      console.log(`📂 Found ${categories.length} categories with products`);
      
      res.json(successResponse(categories));
      
    } catch (error) {
      console.error('❌ Error getting products by category:', error);
      next(error);
    }
  }
  
  // Get all products
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Getting all products (MOCK DATA)');
      
      res.json(successResponse(mockProducts));
      
    } catch (error) {
      console.error('❌ Error getting products:', error);
      next(error);
    }
  }
  
  // Get categories
  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔍 Getting categories (MOCK DATA)');
      
      res.json(successResponse(mockCategories));
      
    } catch (error) {
      console.error('❌ Error getting categories:', error);
      next(error);
    }
  }
  
  // Get single product
  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = mockProducts.find(p => p.id === id);
      
      if (!product) {
        throw new AppError('Product not found', 404);
      }
      
      res.json(successResponse(product));
      
    } catch (error) {
      next(error);
    }
  }
}



// import { Request, Response, NextFunction } from 'express';
// import { PrismaClient } from '@fooddupe/database';
// import { AppError, successResponse } from '@fooddupe/utils';
// import { CreateProductRequest } from '@fooddupe/types';

// const prisma = new PrismaClient({
//   log: ['query', 'info', 'warn', 'error'],
// });

// export class ProductController {
  
//   // Get all products for a tenant
//   async getProducts(req: Request, res: Response, next: NextFunction) {
//     try {
//       console.log('🔍 Getting products for tenant:', req.tenant?.name);
      
//       const tenantId = req.tenant?.id;
      
//       if (!tenantId) {
//         throw new AppError('Tenant not found', 404);
//       }
      
//       const { categoryId, isActive, isPopular } = req.query;
      
//       const products = await prisma.product.findMany({
//         where: {
//           tenantId,
//           ...(categoryId && { categoryId: categoryId as string }),
//           ...(isActive !== undefined && { isActive: isActive === 'true' }),
//           ...(isPopular !== undefined && { isPopular: isPopular === 'true' }),
//         },
//         include: {
//           category: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },
//         },
//         orderBy: [
//           { sortOrder: 'asc' },
//           { name: 'asc' },
//         ],
//       });
      
//       console.log(`📦 Found ${products.length} products`);
      
//       res.json(successResponse(products));
      
//     } catch (error) {
//       console.error('❌ Error getting products:', error);
//       next(error);
//     }
//   }
  
//   // Get products grouped by category
//   async getProductsByCategory(req: Request, res: Response, next: NextFunction) {
//     try {
//       console.log('🔍 Getting products by category for tenant:', req.tenant?.name);
      
//       const tenantId = req.tenant?.id;
      
//       if (!tenantId) {
//         throw new AppError('Tenant not found', 404);
//       }
      
//       const categories = await prisma.category.findMany({
//         where: {
//           tenantId,
//           isActive: true,
//         },
//         include: {
//           products: {
//             where: {
//               isActive: true,
//             },
//             orderBy: [
//               { sortOrder: 'asc' },
//               { name: 'asc' },
//             ],
//           },
//         },
//         orderBy: { sortOrder: 'asc' },
//       });
      
//       console.log(`📂 Found ${categories.length} categories with products`);
      
//       res.json(successResponse(categories));
      
//     } catch (error) {
//       console.error('❌ Error getting products by category:', error);
//       next(error);
//     }
//   }
  
//   // Get single product
//   async getProduct(req: Request, res: Response, next: NextFunction) {
//     try {
//       const { id } = req.params;
//       const tenantId = req.tenant?.id;
      
//       if (!tenantId) {
//         throw new AppError('Tenant not found', 404);
//       }
      
//       const product = await prisma.product.findFirst({
//         where: {
//           id,
//           tenantId,
//         },
//         include: {
//           category: {
//             select: {
//               id: true,
//               name: true,
//               slug: true,
//             },
//           },
//         },
//       });
      
//       if (!product) {
//         throw new AppError('Product not found', 404);
//       }
      
//       res.json(successResponse(product));
      
//     } catch (error) {
//       next(error);
//     }
//   }
  
//   // Get categories
//   async getCategories(req: Request, res: Response, next: NextFunction) {
//     try {
//       console.log('🔍 Getting categories for tenant:', req.tenant?.name);
      
//       const tenantId = req.tenant?.id;
      
//       if (!tenantId) {
//         throw new AppError('Tenant not found', 404);
//       }
      
//       const categories = await prisma.category.findMany({
//         where: {
//           tenantId,
//           isActive: true,
//         },
//         orderBy: { sortOrder: 'asc' },
//       });
      
//       console.log(`📂 Found ${categories.length} categories`);
      
//       res.json(successResponse(categories));
      
//     } catch (error) {
//       console.error('❌ Error getting categories:', error);
//       next(error);
//     }
//   }
  
//   // Create product (Admin only) - PLACEHOLDER
//   async createProduct(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.json(successResponse(null, 'Create product - coming soon!'));
//     } catch (error) {
//       next(error);
//     }
//   }
  
//   // Update product - PLACEHOLDER  
//   async updateProduct(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.json(successResponse(null, 'Update product - coming soon!'));
//     } catch (error) {
//       next(error);
//     }
//   }
  
//   // Delete product - PLACEHOLDER
//   async deleteProduct(req: Request, res: Response, next: NextFunction) {
//     try {
//       res.json(successResponse(null, 'Delete product - coming soon!'));
//     } catch (error) {
//       next(error);
//     }
//   }
// }