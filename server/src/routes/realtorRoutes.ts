
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

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

        // 2. Fetch Summary Data (Mocked/Real)
        // In future: Check if req.user.id === realtor.id (Authorization)

        const leadsCount = await prisma.lead.count({
            where: { brokerId: realtor.id }
        });

        const newLeadsCount = await prisma.lead.count({
            where: { brokerId: realtor.id, status: 'new' }
        });

        res.json({
            realtor: {
                id: realtor.id,
                name: realtor.name,
                slug: realtor.slug,
                photo_url: realtor.photo_url
            },
            stats: {
                total_leads: leadsCount,
                new_leads: newLeadsCount,
                conversion_rate: '0%', // Placeholder
                active_automations: 0
            }
        });

    } catch (error) {
        console.error('Error fetching realtor summary:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

export default router;
