import { Router } from 'express';
import { handleAsync } from '@fooddupe/utils';

const router = Router();

// Placeholder routes - we bouwen deze later uit
router.get('/', handleAsync(async (req, res) => {
  res.json({
    success: true,
    message: 'Tenants endpoint - coming soon!',
    data: []
  });
}));

export default router;