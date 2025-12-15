import { Router } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

// GET /api/realtors/:slug/summary
router.get('/:slug/summary', async (req, res) => {
    try {
        const { slug } = req.params;

        // 1. Validate Realtor Exists
        const realtor = await prisma.user.findUnique({
            where: { slug }
        });

        if (!realtor) {
            return res.status(404).json({ error: 'Realtor not found' });
        }

        // 2. Fetch Real Stats
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const [totalLeads, newLeadsToday, qualifiedLeads, hotLeads] = await Promise.all([
            prisma.lead.count({ where: { brokerId: realtor.id } }),
            prisma.lead.count({ where: { brokerId: realtor.id, createdAt: { gte: startOfDay } } }),
            prisma.lead.count({ where: { brokerId: realtor.id, status: { in: ['Qualified', 'In Qualification'] } } }),
            prisma.lead.count({ where: { brokerId: realtor.id, status: 'Hot' } })
        ]);

        res.json({
            realtor: {
                id: realtor.id,
                name: realtor.name,
                slug: realtor.slug,
                photo_url: realtor.photo_url
            },
            stats: {
                total_leads: totalLeads,
                new_leads: newLeadsToday,
                qualified_leads: qualifiedLeads,
                hot_leads: hotLeads,
                pending_followups: 0 // Placeholder for now
            }
        });

    } catch (error) {
        console.error('Error fetching realtor summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// GET /api/realtors/:slug/leads
router.get('/:slug/leads', async (req, res) => {
    try {
        const { slug } = req.params;
        const page = parseInt(req.query.page as string) || 1;
        const pageSize = parseInt(req.query.pageSize as string) || 10;
        const status = req.query.status as string;
        const search = req.query.q as string;

        // 1. Validate Realtor
        const realtor = await prisma.user.findUnique({ where: { slug } });
        if (!realtor) return res.status(404).json({ error: 'Realtor not found' });

        // 2. Build Query
        const where: any = { brokerId: realtor.id };

        if (status && status !== 'All') {
            where.status = status;
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } }
            ];
        }

        // 3. Execute Query
        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                skip: (page - 1) * pageSize,
                take: pageSize,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.lead.count({ where })
        ]);

        res.json({
            items: leads,
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize)
        });

    } catch (error) {
        console.error('Error fetching leads:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
