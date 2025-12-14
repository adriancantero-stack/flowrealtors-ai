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

// Root Ping
app.get('/ping', (req, res) => res.send('pong'));

// Version Check
app.get('/api/version', (req, res) => res.json({ version: 'v2.27', type: 'CORS_UNLOCKED', env: process.env.NODE_ENV }));

// System Fix (Bypassing /api prefix to rule out prefix issues)
const systemFixHandler = async (req: Request, res: Response) => {
    console.log('[SYSTEM_FIX] Triggered');
    res.header('Access-Control-Allow-Origin', '*');

    // Check Env
    const env = { ...process.env };
    if (env.DATABASE_URL && !env.DATABASE_URL.includes('pgbouncer=true')) {
        env.DATABASE_URL += (env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true';
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

app.use(cors({
    origin: true, // Reflect request origin
    credentials: true,
    // Let CORS default to allowing all standard methods/headers to avoid 405 issues
}));
app.get('/api/health', (req, res) => res.status(200).send('OK')); // Health check for Railway

// Robust CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins for now to unblock
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    credentials: true
}));

app.options('*', cors()); // Enable pre-flight for all routes

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

import path from 'path';

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
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        console.log('Running database migrations...');

        // Fix for "prepared statement s0 already exists" with PgBouncer
        const env = { ...process.env };
        if (env.DATABASE_URL && !env.DATABASE_URL.includes('pgbouncer=true')) {
            console.log('Appending pgbouncer=true to DATABASE_URL for migration...');
            env.DATABASE_URL += (env.DATABASE_URL.includes('?') ? '&' : '?') + 'pgbouncer=true';
        }

        // Using exec to run the command
        const { exec } = require('child_process');
        exec('npx prisma db push --accept-data-loss', { env }, (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`Migration Error: ${error.message}`);
                return;
            }
            if (stderr) console.error(`Migration Stderr: ${stderr}`);
            console.log(`Migration Stdout: ${stdout}`);
            console.log('Database migration completed successfully.');
        });
    }
    */
});
