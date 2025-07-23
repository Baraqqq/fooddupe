import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { handleAsync } from '@fooddupe/utils';

const router = Router();
const authController = new AuthController();

// Public routes
router.post('/login', handleAsync(authController.login.bind(authController)));
router.post('/register', handleAsync(authController.register.bind(authController)));

// Protected routes
router.use(authenticate); // All routes below require authentication

router.get('/profile', handleAsync(authController.getProfile.bind(authController)));
router.put('/profile', handleAsync(authController.updateProfile.bind(authController)));
router.put('/change-password', handleAsync(authController.changePassword.bind(authController)));

export default router;