import { Request, Response } from 'express';
import { AutomationService } from '../services/automationService';

export const getSettings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const settings = await AutomationService.getSettings(userId);
    res.json(settings);
};

export const updateSettings = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const settings = await AutomationService.updateSettings(userId, req.body);
    res.json(settings);
};

export const triggerScheduler = async (req: Request, res: Response) => {
    // Dev endpoint to force run the scheduler
    await AutomationService.runScheduler();
    res.json({ message: 'Scheduler triggered' });
};
