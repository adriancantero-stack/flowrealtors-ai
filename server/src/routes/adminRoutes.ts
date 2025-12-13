import { Router } from 'express';
import { getDashboardStats, getUsers, getUserDetails, getSystemLeads, adminAction, getGlobalSettings, saveGlobalSettings } from '../controllers/adminController';
import { listBrokers, createBroker, updateBroker, deleteBroker } from '../controllers/brokerController';
import { getLogs, getSystemStatus } from '../controllers/logsController';

import { exec } from 'child_process';

const router = Router();

// Middleware to check admin role (mocked for now, assuming all requests to /api/admin are authorized in dev)

// Dashboard
router.get('/dashboard', getDashboardStats);

// Leads
router.get('/leads', getSystemLeads);

// Brokers (Users)
router.get(['/brokers', '/brokers/'], listBrokers);
router.post(['/brokers', '/brokers/'], createBroker);
router.put(['/brokers/:id', '/brokers/:id/'], updateBroker);
router.delete(['/brokers/:id', '/brokers/:id/'], deleteBroker);

// Global Settings
router.get('/settings', getGlobalSettings);
router.post('/settings', saveGlobalSettings);

// Logs & Monitoring
router.get('/logs', getLogs);
router.get('/status', getSystemStatus);


// Legacy / Generic Actions
router.get('/users', getUsers); // Keep for compatibility if needed
router.get('/users/:id', getUserDetails);
router.post('/action', adminAction);

router.post('/run-migrations', async (req, res) => {
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
