import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { authenticate, authorize, checkTenantAccess } from '../middleware/auth';
import { handleAsync } from '@fooddupe/utils';

const router = Router();
const productController = new ProductController();

// Public routes (for customer website)
router.get('/', handleAsync(productController.getProducts.bind(productController)));
router.get('/by-category', handleAsync(productController.getProductsByCategory.bind(productController)));
router.get('/categories', handleAsync(productController.getCategories.bind(productController)));
router.get('/:id', handleAsync(productController.getProduct.bind(productController)));

// Protected routes komen later
// router.use(authenticate);
// router.use(checkTenantAccess);

export default router;