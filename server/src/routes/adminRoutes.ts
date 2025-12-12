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
router.post('/run-migrations', async (req, res) => {
    const { exec } = require('child_process');
    console.log('Manual migration triggered...');
    exec('npx prisma db push --accept-data-loss', (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`Migration Error: ${error.message}`);
            return res.status(500).json({ success: false, error: error.message });
        }
        if (stderr) console.error(`Migration Stderr: ${stderr}`);
        console.log(`Migration Stdout: ${stdout}`);
        res.json({ success: true, output: stdout });
    });
});

export default router;
