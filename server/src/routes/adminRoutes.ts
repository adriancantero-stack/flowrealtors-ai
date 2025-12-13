import { Router } from 'express';
import { getDashboardStats, getUsers, getUserDetails, getSystemLeads, adminAction, getGlobalSettings, saveGlobalSettings } from '../controllers/adminController';
import { listBrokers, createBroker, updateBroker, deleteBroker } from '../controllers/brokerController';
import { getLogs, getSystemStatus } from '../controllers/logsController';

import { exec } from 'child_process';

const router = Router();

// Middleware to check admin role (mocked for now, assuming all requests to /api/admin are authorized in dev)
router.use((req, res, next) => {
    console.log(`[ADMIN ROUTER] ${req.method} ${req.url}`);
    next();
});

// Admin Stats
router.get('/dashboard', getDashboardStats);

// Leads
router.get('/leads', getSystemLeads);

// Brokers (Users)
// Brokers (Users) - Explicit CORS and Logging
import cors from 'cors';

router.all('/brokers', (req, res, next) => {
    console.log(`[ADMIN_DEBUG] /brokers matched. Method: ${req.method}`);
    next();
});

router.options('/brokers', cors()); // Force pre-flight handling
router.get('/brokers', cors(), listBrokers);
router.post('/brokers', cors(), createBroker);

router.put('/brokers/:id', updateBroker);
router.delete('/brokers/:id', deleteBroker);

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

// Manual Migration - Explicit CORS
router.options('/run-migrations', cors());
router.post('/run-migrations', cors(), async (req, res) => {
    console.log('[ADMIN_DEBUG] /run-migrations called');

    // Fix for PgBouncer
    const env = { ...process.env };
    if (env.DATABASE_URL && !env.DATABASE_URL.includes('pgbouncer=true')) {
        console.log('Appending pgbouncer=true to DATABASE_URL for manual migration...');
        env.DATABASE_URL += (env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true';
    }

    try {
        /*
        exec('npx prisma db push --accept-data-loss', { env }, (error: any, stdout: any, stderr: any) => {
            console.log('[ADMIN_DEBUG] Exec finished');
            if (error) {
                console.error(`Migration Error: ${error.message}`);
                // Ensure we haven't sent headers yet
                if (!res.headersSent) return res.status(500).json({ success: false, error: error.message });
            }
            if (stderr) console.error(`Migration Stderr: ${stderr}`);
            console.log(`Migration Stdout: ${stdout}`);
            
            if (!res.headersSent) res.json({ success: true, output: stdout || 'No output' });
        });
        */
        // Use spawn for better reliability? Or just wrap in Promise
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        console.log('[ADMIN_DEBUG] Starting execPromise...');
        const { stdout, stderr } = await execPromise('npx prisma db push --accept-data-loss', { env });
        console.log('[ADMIN_DEBUG] execPromise completed.');
        console.log('STDOUT:', stdout);
        if (stderr) console.log('STDERR:', stderr);

        res.json({ success: true, output: stdout });

    } catch (error: any) {
        console.error('[ADMIN_DEBUG] Migration Exception:', error);
        res.status(500).json({ success: false, error: error.message || String(error) });
    }
});

export default router;
