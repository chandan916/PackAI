import { Router } from 'express';
import { OptimizeController } from '../controllers/optimize.controller';

const router = Router();

router.post('/optimize', OptimizeController.optimize);
router.get('/optimizations', OptimizeController.getHistory);
router.get('/optimizations/:id', OptimizeController.getById);
router.get('/presets', OptimizeController.getPresets);

export default router;
