import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List all brokers
export const listBrokers = async (req: Request, res: Response) => {
    try {
        const brokers = await prisma.user.findMany({
            where: { role: 'broker' },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { leads: true }
                }
            }
        });
        res.json(brokers);
    } catch (error) {
        console.error('Error listing brokers:', error);
        res.status(500).json({ error: 'Failed to fetch brokers' });
    }
};

// Create a new broker
export const createBroker = async (req: Request, res: Response) => {
    try {
        const { name, email, phone, city, state, photo_url, calendly_link, default_lang } = req.body;

        console.log('[CREATE BROKER] Request received for:', email);
        console.log('[CREATE BROKER] Payload:', JSON.stringify(req.body));

        if (!name || !email) {
            console.log('[CREATE BROKER] Validation failed: missing name or email');
            return res.status(400).json({ error: 'Name and Email are required' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        const broker = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                city,
                state,
                photo_url,
                calendly_link,
                default_lang: default_lang || 'pt',
                role: 'broker',
                status: 'active'
            }
        });

        res.status(201).json(broker);
    } catch (error: any) {
        console.error('[CREATE BROKER] Critical Error:', error);
        // Return specifics if possible (e.g. unique constraint)
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Este e-mail já está em uso.' });
        }
        res.status(500).json({ error: `Failed to create broker: ${error.message}` });
    }
};

// Update a broker
export const updateBroker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, city, state, photo_url, calendly_link, default_lang, status } = req.body;

        const broker = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                name,
                email,
                phone,
                city,
                state,
                photo_url,
                calendly_link,
                default_lang,
                status
            }
        });

        res.json(broker);
    } catch (error) {
        console.error('Error updating broker:', error);
        res.status(500).json({ error: 'Failed to update broker' });
    }
};

// Delete (or deactivate) a broker
export const deleteBroker = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete (set to inactive) or hard delete? User request implied Active/Inactive status managing.
        // But CRUD usually implies delete. I'll support hard delete for cleanup, but UI might prefer status toggle (update).
        // Let's implement hard delete here for the DELETE route.

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.json({ success: true, message: 'Broker deleted' });
    } catch (error) {
        console.error('Error deleting broker:', error);
        res.status(500).json({ error: 'Failed to delete broker' });
    }
};
