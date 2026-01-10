import { Router } from 'express';
import organizationController from '../controllers/organizationController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// All organization routes require Super Admin role
router.use(authenticate, authorize(UserRole.SUPER_ADMIN));

// Organization CRUD routes
router.post('/', organizationController.createOrganization);
router.get('/', organizationController.getAllOrganizations);
router.get('/:id', organizationController.getOrganizationById);
router.put('/:id', organizationController.updateOrganization);
router.delete('/:id', organizationController.deleteOrganization);

// Organization stats and settings
router.get('/:id/stats', organizationController.getOrganizationStats);
router.get('/:id/settings', organizationController.getOrganizationSettings);

export default router;
