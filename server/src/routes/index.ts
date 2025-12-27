import { Router } from 'express';
import healthRoutes from './health.routes';

const router = Router();

// Mount routes
router.use('/health', healthRoutes);

// Future routes will be added here:
// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/attendance', attendanceRoutes);

export default router;
