import express from 'express';
import { getApps, getMyApps, installApp, removeApp, seedApps } from '../controllers/app.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getApps);
router.post('/seed', seedApps); // Open for dev convenience

router.get('/my', protect, getMyApps);
router.post('/install/:id', protect, installApp);
router.delete('/install/:id', protect, removeApp);

export default router;
