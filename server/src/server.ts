console.log(`[${new Date().toISOString()}] STARTING SERVER PROCESS... v2.21 (FULL RESTORE)`);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Request Logger with detail
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl || req.url}`);
    next();
});

// MANUAL CORS SAFE MODE (v2.32) - MOVED TO TOP
// Must be before any routes!
app.use((req, res, next) => {
    // Allow everyone
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');

    // Handle Preflight immediately
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }

    next();
});

// MOCK AUTH MIDDLEWARE (Verification Fix)
// Populates req.user based on Authorization header or slug match (insecure fallback for dev)
app.use(async (req: any, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer mock-jwt-token-')) {
        const userId = parseInt(authHeader.split('mock-jwt-token-')[1]);
        if (!isNaN(userId)) {
            const user = await import('./lib/prisma').then(m => m.prisma.user.findUnique({ where: { id: userId } }));
            if (user) {
                req.user = user;
                console.log(`[Auth] Authenticated User: ${user.email} (${user.role})`);
            }
        }
    }

    // Fallback REMOVED for Security.
    // Clients MUST send Authorization header now.
    /*
    if (!req.user && req.path.includes('/leads') && process.env.NODE_ENV !== 'production') {
        // ... (removed insecure logic)
    }
    */
    next();
});

// Root Ping
app.get('/ping', (req, res) => res.send('pong'));

// Version Check
app.get('/api/version', (req, res) => res.json({ version: 'v2.40-debug', type: 'ADMIN_FIX', env: process.env.NODE_ENV }));

// System Fix (Bypassing /api prefix to rule out prefix issues)
const systemFixHandler = async (req: Request, res: Response) => {
    console.log('[SYSTEM_FIX] Triggered');
    res.header('Access-Control-Allow-Origin', '*');

    // Check Env
    const env = { ...process.env };

    // FIX: Force PgBouncer mode + Disable Statement Cache
    // This resolves "prepared statement s1 already exists" error
    if (env.DATABASE_URL) {
        const urlObj = new URL(env.DATABASE_URL);
        urlObj.searchParams.set('pgbouncer', 'true');
        urlObj.searchParams.set('statement_cache_size', '0'); // CRITICAL for Railway PgBouncer
        env.DATABASE_URL = urlObj.toString();
        console.log('[SYSTEM_FIX] Modified DB URL for Migration (Params only):', urlObj.search);
    }

    try {
        const { exec } = require('child_process');
        const util = require('util');
        const execPromise = util.promisify(exec);

        const { stdout, stderr } = await execPromise('npx prisma db push --accept-data-loss', { env });
        console.log('[SYSTEM_FIX] Success:', stdout);
        res.json({ success: true, output: stdout });
    } catch (error: any) {
        console.error('[SYSTEM_FIX] Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

app.all('/_system/fix-db', systemFixHandler);
// Keep old one too just in case
app.all('/api/run-migrations', systemFixHandler);

// app.options(/.*/, cors()); // REMOVED caused crash/timeout

app.use(express.json());

import authRoutes from './routes/authRoutes';
import leadRoutes from './routes/leadRoutes';
import aiRoutes from './routes/aiRoutes';
import integrationRoutes from './routes/integrationRoutes';
import automationRoutes from './routes/automationRoutes';
import funnelRoutes from './routes/funnelRoutes';
import adminRoutes from './routes/adminRoutes';
import whatsappRoutes from './routes/whatsappRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/automation', automationRoutes);
app.use('/api/funnel', funnelRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/whatsapp', whatsappRoutes);
import realtorRoutes from './routes/realtorRoutes';
app.use('/api/realtors', realtorRoutes);

import devRoutes from './routes/devRoutes';
app.use('/api/dev', devRoutes);

import path from 'path';

import uploadRoutes from './routes/uploadRoutes';
app.use('/api/upload', uploadRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/health', (req: Request, res: Response) => {
    res.send('FlowRealtor API is running');
});

// Emergency Migration Endpoint (Direct in server.ts)
// Using require to avoid top-level import issues if not needed
// Old location removed

// Duplicate removed

// Handle React Routing (Catch-all)
// Handle React Routing (Catch-all)
// Using RegExp to avoid Express 5 string path parser issues
// React Catch-all REMOVED for debugging v2.14

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);

    // Auto-run migrations in production
    // TEMPORARILY DISABLED TO PREVENT CRASH LOOP
    /*
    // Auto-run migrations in production (Safe Mode)
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        try {
            console.log('Attempting auto-migration...');
            const env = { ...process.env };
            
            // Safe URL parsing
            if (env.DATABASE_URL && env.DATABASE_URL.startsWith('postgres')) {
                try {
                    const urlObj = new URL(env.DATABASE_URL);
                    urlObj.searchParams.set('pgbouncer', 'true');
                    urlObj.searchParams.set('statement_cache_size', '0');
                    env.DATABASE_URL = urlObj.toString();
                } catch (urlErr) {
                    console.error('Migration URL Parse Error (Skipping PgBouncer fix):', urlErr);
                }
            }

            // Using exec to run the command
            const { exec } = require('child_process');
            exec('npx prisma db push --accept-data-loss', { env }, (error: any, stdout: any, stderr: any) => {
                if (error) {
                    console.error(`Migration Failed (Non-fatal): ${error.message}`);
                    return;
                }
                if (stderr) console.error(`Migration Stderr: ${stderr}`);
                console.log(`Migration Stdout: ${stdout}`);
            });
        } catch (err) {
            console.error('Auto-migration CRITIAL ERROR (Server continues):', err);
        }
    }
    */
});
