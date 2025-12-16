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

// GET /:slug/leads/:id - Get lead details
router.get('/:slug/leads/:id', async (req, res) => {
    try {
        const { slug, id } = req.params;
        const leadId = parseInt(id);

        console.log(`[DEBUG] Fetching Lead: slug=${slug}, id=${id}, parsedId=${leadId}`);
        // @ts-ignore
        console.log(`[DEBUG] Current User: id=${req.user?.id}, slug=${req.user?.slug}, role=${req.user?.role}`);

        // Security Check 1: Verify slug belongs to logged user (or is admin)
        // @ts-ignore
        if (req.user.slug !== slug && req.user.role !== 'admin') {
            console.warn(`[DEBUG] Slug Mismatch: param=${slug} != token=${(req as any).user.slug}`);
            return res.status(403).json({ error: 'Unauthorized access to this realtor space' });
        }

        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                messages: {
                    take: 1, // Just to check if exist, full history in separate endpoint
                    orderBy: { timestamp: 'desc' }
                }
            }
        });

        if (!lead) {
            console.warn(`[DEBUG] Lead NOT FOUND in DB: id=${leadId}`);
            return res.status(404).json({ error: 'Lead not found' });
        }

        console.log(`[DEBUG] Lead Found: id=${lead.id}, brokerId=${lead.brokerId}`);

        // Security Check 2: Verify lead belongs to the realtor
        // @ts-ignore
        if (lead.brokerId !== req.user.id && req.user.role !== 'admin') {
            console.warn(`[DEBUG] Ownership Fail: lead.brokerId=${lead.brokerId} != user.id=${(req as any).user.id}`);
            return res.status(403).json({ error: 'Unauthorized access to this lead' });
        }

        res.json(lead);
    } catch (error) {
        console.error('Error fetching lead details:', error);
        res.status(500).json({ error: 'Failed to fetch lead details' });
    }
});

// PATCH /:slug/leads/:id - Update lead details
router.patch('/:slug/leads/:id', async (req, res) => {
    try {
        const { slug, id } = req.params;
        const leadId = parseInt(id);
        const { status, notes, score, next_action_at } = req.body;

        // Security Check 1
        // @ts-ignore
        if (req.user.slug !== slug && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access to this realtor space' });
        }

        // Check existence and ownership
        const existingLead = await prisma.lead.findUnique({ where: { id: leadId } });

        if (!existingLead) return res.status(404).json({ error: 'Lead not found' });

        // Security Check 2
        // @ts-ignore
        if (existingLead.brokerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access to this lead' });
        }

        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                status: status ?? undefined,
                notes: notes ?? undefined,
                score: score ? parseInt(score) : undefined,
                next_action_at: next_action_at ? new Date(next_action_at) : undefined
            }
        });

        res.json(updatedLead);
    } catch (error) {
        console.error('Error updating lead:', error);
        res.status(500).json({ error: 'Failed to update lead' });
    }
});

// GET /:slug/leads/:id/messages - Get lead messages history
router.get('/:slug/leads/:id/messages', async (req, res) => {
    try {
        const { slug, id } = req.params;
        const leadId = parseInt(id);

        // Security Check 1
        // @ts-ignore
        if (req.user.slug !== slug && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access to this realtor space' });
        }

        // Verify lead ownership
        const lead = await prisma.lead.findUnique({ where: { id: leadId } });
        if (!lead) return res.status(404).json({ error: 'Lead not found' });

        // @ts-ignore
        if (lead.brokerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized access to this lead' });
        }

        const messages = await prisma.leadMessage.findMany({
            where: { leadId: leadId },
            orderBy: { timestamp: 'asc' }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

export default router;
