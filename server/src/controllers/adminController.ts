import { Request, Response } from 'express';
import { users } from './authController';
import { leads } from './leadController';

// Admin Dashboard Stats
export const getDashboardStats = async (req: Request, res: Response) => {
    const totalRealtors = users.filter(u => u.role === 'realtor').length;
    const activeRealtors = users.filter(u => u.role === 'realtor' && u.onboarding_completed).length;

    const totalLeads = leads.length;
    const leadsToday = leads.filter(l => {
        const today = new Date();
        const leadDate = new Date(l.created_at);
        return leadDate.getDate() === today.getDate() &&
            leadDate.getMonth() === today.getMonth() &&
            leadDate.getFullYear() === today.getFullYear();
    }).length;

    const qualifiedLeads = leads.filter(l => l.status === 'qualified' || l.status === 'appointment_set').length;

    // Mock automation stats for now
    const automationStats = {
        executed: 1240,
        pending: 35,
        failed: 2
    };

    res.json({
        realtors: {
            total: totalRealtors,
            active: activeRealtors
        },
        leads: {
            total: totalLeads,
            today: leadsToday,
            conversion_rate: totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : 0
        },
        automations: automationStats,
        system_health: 'healthy'
    });
};

// User Management
export const getUsers = async (req: Request, res: Response) => {
    // Return safe user objects (no passwords)
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        created_at: u.created_at,
        onboarding_completed: u.onboarding_completed,
        plan: 'Pro Plan', // Mock plan
        status: 'active'   // Mock status
    }));
    res.json(safeUsers);
};

export const getUserDetails = async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = users.find(u => u.id === id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Mock additional details
    res.json({
        ...user,
        password_hash: undefined,
        stats: {
            leads_count: leads.filter(l => l.user_id === id).length,
            messages_sent: 450,
            last_active: new Date()
        }
    });
};

// System Monitoring
export const getSystemLeads = async (req: Request, res: Response) => {
    // Return all leads for admin review
    res.json(leads);
};

// Admin Actions
export const adminAction = async (req: Request, res: Response) => {
    const { action, targetId } = req.body;

    console.log(`[ADMIN ACTION] ${action} on ${targetId}`);

    // Mock actions
    switch (action) {
        case 'suspend_user':
            // In real app, update DB status
            break;
        case 'reset_onboarding':
            const user = users.find(u => u.id === targetId);
            if (user) user.onboarding_completed = false;
            break;
    }

    res.json({ success: true, message: `Action ${action} executed` });
};
