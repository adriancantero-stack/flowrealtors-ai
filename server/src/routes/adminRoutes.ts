import { Router } from 'express';
import { getDashboardStats, getUsers, getUserDetails, getSystemLeads, adminAction } from '../controllers/adminController';

const router = Router();

// Middleware to check admin role (mocked for now, assuming all requests to /api/admin are authorized in dev)
// In prod, this would verify req.user.role === 'admin'

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.get('/users/:id', getUserDetails);
router.get('/leads', getSystemLeads);
router.post('/action', adminAction);

export default router;
