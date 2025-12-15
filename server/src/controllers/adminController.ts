import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

// Admin Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalLeads = await prisma.lead.count();
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const leadsToday = await prisma.lead.count({
            where: { createdAt: { gte: startOfDay } }
        });

        const qualifiedLeads = await prisma.lead.count({
            where: { status: { in: ['qualified', 'appointment_set'] } }
        });

        const totalBrokers = await prisma.user.count({ where: { role: 'broker' } });
        const activeBrokers = await prisma.user.count({ where: { role: 'broker', status: 'active' } });

        res.json({
            realtors: { total: totalBrokers, active: activeBrokers },
            leads: {
                total: totalLeads,
                today: leadsToday,
                conversion_rate: totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : 0
            },
            system_health: 'healthy'
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};

// User Management
export const getUsers = async (req: Request, res: Response) => {
    // Mock users for now
    res.json([]);
};

export const getUserDetails = async (req: Request, res: Response) => {
    res.status(404).json({ error: 'User not found' });
};

// Leads Management (Filtered)
export const getSystemLeads = async (req: Request, res: Response) => {
    try {
        const { status, brokerId, dateFrom, dateTo } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (brokerId) where.brokerId = parseInt(brokerId as string);
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) where.createdAt.gte = new Date(dateFrom as string);
            if (dateTo) where.createdAt.lte = new Date(dateTo as string);
        }

        const leads = await prisma.lead.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: { broker: true }, // Include assigned broker details
            take: 100
        });
        res.json(leads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

// Global Settings
export const getGlobalSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.saaSSettings.findFirst();
        res.json(settings || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

export const saveGlobalSettings = async (req: Request, res: Response) => {
    try {
        const { platform_name, base_domain, logo_url, active_languages } = req.body;

        // Update first record or create
        const first = await prisma.saaSSettings.findFirst();

        let settings;
        if (first) {
            settings = await prisma.saaSSettings.update({
                where: { id: first.id },
                data: { platform_name, base_domain, logo_url, active_languages }
            });
        } else {
            settings = await prisma.saaSSettings.create({
                data: { platform_name, base_domain, logo_url, active_languages }
            });
        }
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save settings' });
    }
};

// Admin Actions
export const adminAction = async (req: Request, res: Response) => {
    const { action, targetId } = req.body;
    console.log(`[ADMIN ACTION] ${action} on ${targetId}`);
    res.json({ success: true, message: `Action ${action} executed` });
};
