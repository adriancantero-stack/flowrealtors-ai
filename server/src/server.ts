import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Request, Response } from 'express';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: true, // Reflect request origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
