import { Request, Response } from 'express';
import { User } from '../models/types';

// Mock in-memory user store
export const users: User[] = [];

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, account_type } = req.body;

        // Check if user exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const newUser: User = {
            id: Math.random().toString(36).substr(2, 9),
            name,
            email,
            password_hash: password, // In real app, hash this!
            account_type: account_type || 'realtor',
            role: 'realtor',
            created_at: new Date(),
            onboarding_completed: false
        };

        users.push(newUser);

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, email: newUser.email, name: newUser.name }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    // In a real application, you would fetch the user from a database
    // and apply updates, then save.
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    // Apply updates, ensuring not to update sensitive fields directly without validation
    // For simplicity, we'll allow updating name and account_type
    if (updates.name) {
        users[userIndex].name = updates.name;
    }
    if (updates.account_type) {
        users[userIndex].account_type = updates.account_type;
    }
    // Add more fields as needed, with proper validation

    res.json({
        message: 'Profile updated successfully',
        user: { id: users[userIndex].id, name: users[userIndex].name, email: users[userIndex].email, account_type: users[userIndex].account_type }
    });
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
