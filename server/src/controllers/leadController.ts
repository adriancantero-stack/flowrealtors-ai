import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getLeads = async (req: Request, res: Response): Promise<void> => {
    try {
        const leads = await prisma.lead.findMany({
            orderBy: { createdAt: 'desc' }
        });
        // Map Int ID to String ID if necessary for frontend
        const mappedLeads = leads.map(l => ({ ...l, id: l.id.toString() }));
        res.json(mappedLeads);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch leads' });
    }
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, phone, source } = req.body;
        const newLead = await prisma.lead.create({
            data: {
                name,
                phone,
                source,
                status: 'new',
                language: 'en'
            }
        });
        res.status(201).json({ ...newLead, id: newLead.id.toString() });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create lead' });
    }
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const leadId = parseInt(id);
        const updated = await prisma.lead.update({
            where: { id: leadId },
            data: req.body
        });
        res.json({ ...updated, id: updated.id.toString() });
    } catch (error) {
        res.status(404).json({ message: 'Lead not found or update failed' });
    }
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
        const leadId = parseInt(id);
        await prisma.lead.delete({
            where: { id: leadId }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete lead' });
    }
};
