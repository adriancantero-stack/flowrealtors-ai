import { Request, Response } from 'express';
import { Lead } from '../models/types';

// Mock data
export let leads: Lead[] = [
    {
        id: '1',
        user_id: '1',
        name: 'John Doe',
        phone: '+15551234567',
        email: 'john@example.com',
        source: 'instagram',
        status: 'new',
        qualification_score: 40,
        tags: ['first-time-buyer'],
        conversation_history: ['Hi!', 'Hello, interested in buying?'],
        created_at: new Date()
    },
    {
        id: '2',
        user_id: '1',
        name: 'Jane Smith',
        phone: '+15559876543',
        source: 'whatsapp',
        status: 'qualified',
        qualification_score: 85,
        tags: ['investor', 'cash-buyer'],
        conversation_history: ['Price?', '500k'],
        created_at: new Date(Date.now() - 86400000)
    }
];

export const getLeads = async (req: Request, res: Response): Promise<void> => {
    // In real app, filter by req.user.id
    res.json(leads);
};

export const createLead = async (req: Request, res: Response): Promise<void> => {
    const { name, phone, source } = req.body;
    const newLead: Lead = {
        id: Math.random().toString(36).substr(2, 9),
        user_id: '1', // Mock user
        name,
        phone,
        source,
        status: 'new',
        qualification_score: 0,
        tags: [],
        conversation_history: [],
        created_at: new Date()
    };
    leads.push(newLead);
    res.status(201).json(newLead);
};

export const updateLead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const index = leads.findIndex(l => l.id === id);
    if (index === -1) {
        res.status(404).json({ message: 'Lead not found' });
        return;
    }
    leads[index] = { ...leads[index], ...req.body };
    res.json(leads[index]);
};

export const deleteLead = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    leads = leads.filter(l => l.id !== id);
    res.status(204).send();
};
