import { Router } from 'express';
import { OrderController } from '../controllers/orderController';
import { authenticate, authorize, checkTenantAccess } from '../middleware/auth';
import { handleAsync } from '@fooddupe/utils';

const router = Router();
const orderController = new OrderController();

// Public routes
router.post('/', handleAsync(orderController.createOrder.bind(orderController)));
router.get('/track/:orderNumber', handleAsync(orderController.trackOrder.bind(orderController)));

// Protected routes (for restaurant staff)
// router.use(authenticate);
// router.use(checkTenantAccess);

router.get('/', handleAsync(orderController.getOrders.bind(orderController)));
router.get('/:id', handleAsync(orderController.getOrder.bind(orderController)));
router.put('/:id/status', handleAsync(orderController.updateOrderStatus.bind(orderController)));

export default router;