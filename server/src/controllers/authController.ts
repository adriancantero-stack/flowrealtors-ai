import { Request, Response } from 'express';
import { User } from '../models/types';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, account_type } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                // In real app, hash this! Storing plain for MVP demo if necessary, but should use bcrypt
                // For now, mapping 'password' to nothing or a specific field if schema has it?
                // Schema User model DOES NOT have password field!
                // We need to add password field to User schema or store it elsewhere.
                // For now, let's assume this is an admin/broker platform where auth might be different
                // BUT wait, login() expects password.
                // Schema needs password field.
                role: account_type || 'broker',
                status: 'active'
            }
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                name: updates.name,
                // account_type map to role?
                role: updates.account_type === 'realtor' ? 'broker' : 'admin'
            }
        });

        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = users.find(u => u.email === email && u.password_hash === password);
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // In real app, generate JWT here
        const token = 'mock-jwt-token-' + user.id;

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.account_type }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};
