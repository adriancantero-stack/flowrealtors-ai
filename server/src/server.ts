console.log(`[${new Date().toISOString()}] STARTING SERVER PROCESS...`);
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Global Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

app.use(cors({
    origin: true, // Reflect request origin
    credentials: true,
    // Let CORS default to allowing all standard methods/headers to avoid 405 issues
}));
app.options(/.*/, cors()); // Enable pre-flight with RegExp for Express 5 compatibility
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

// Handle React Routing (Catch-all)
// Handle React Routing (Catch-all)
// Using RegExp to avoid Express 5 string path parser issues
app.get(/.*/, (req: Request, res: Response) => {
    // If request is for API, return 404 (don't serve HTML)
    if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);

    // Auto-run migrations in production
    // Auto-run migrations in production
    if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
        console.log('Running database migrations...');
        // Using exec to run the command
        const { exec } = require('child_process');
        exec('npx prisma db push --accept-data-loss', (error: any, stdout: any, stderr: any) => {
            if (error) {
                console.error(`Migration Error: ${error.message}`);
                return;
            }
            if (stderr) console.error(`Migration Stderr: ${stderr}`);
            console.log(`Migration Stdout: ${stdout}`);
            console.log('Database migration completed successfully.');
        });
    }
});
