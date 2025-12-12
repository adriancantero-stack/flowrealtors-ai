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

app.get('/', (req: Request, res: Response) => {
    res.send('FlowRealtor API is running');
});

import { exec } from 'child_process';

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);

    // Auto-run migrations in production
    // if (process.env.NODE_ENV === 'production' || process.env.RAILWAY_ENVIRONMENT) {
    //     console.log('Running database migrations...');
    //     exec('npx prisma db push --accept-data-loss', (error, stdout, stderr) => {
    //         if (error) {
    //             console.error(`Migration Error: ${error.message}`);
    //             return;
    //         }
    //         if (stderr) console.error(`Migration Stderr: ${stderr}`);
    //         console.log(`Migration Stdout: ${stdout}`);
    //         console.log('Database migration completed successfully.');
    //     });
    // }
});
