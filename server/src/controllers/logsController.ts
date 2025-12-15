import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getLogs = async (req: Request, res: Response) => {
    try {
        const { type, limit } = req.query;

        const take = limit ? parseInt(limit as string) : 50;
        const filter = type ? { type: type as string } : {};

        const logs = await prisma.systemLog.findMany({
            where: filter,
            orderBy: { createdAt: 'desc' },
            take: take
        });

        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch logs' });
    }
};

export const getSystemStatus = async (req: Request, res: Response) => {
    try {
        // Quick DB check
        await prisma.$queryRaw`SELECT 1`;

        // In a real app we'd ping external services too
        const health = {
            db: 'connected',
            server: 'online',
            timestamp: new Date().toISOString()
        };

        res.json(health);
    } catch (error) {
        res.status(503).json({
            db: 'disconnected',
            server: 'online',
            error: JSON.stringify(error)
        });
    }
};
