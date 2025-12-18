import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { User } from '../models/types'; // Keep for type reference if needed, though Prisma generates its own

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, account_type } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        // Generate Slug
        let slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        // Append random string to ensure uniqueness locally (in real app, use loop check)
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password_hash: password, // In real app, hash this!
                role: account_type || 'broker',
                status: 'active',
                slug: slug
            }
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, email: newUser.email, name: newUser.name, slug: newUser.slug }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Server error', error });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    const { userId } = req.params;
    const updates = req.body;

    // Validate if userId is valid number
    const id = parseInt(userId);
    if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }

    try {
        console.log(`[UpdateProfile] ID: ${id}, Updates:`, updates);

        const existingUser = await prisma.user.findUnique({ where: { id } });
        if (!existingUser) {
            console.warn(`[UpdateProfile] User ${id} not found`);
            return res.status(404).json({ message: 'User not found' });
        }

        const dataToUpdate: any = {
            name: updates.name,
            phone: updates.phone,
            city: updates.city,
            state: updates.state,
            photo_url: updates.photo_url,
            // Only update slug if it is provided and valid (non-empty)
            ...(updates.slug ? { slug: updates.slug } : {})
        };

        // Only update role if explicitly requested (e.g. by admin or initial setup)
        // Otherwise preserve existing role
        if (updates.account_type) {
            dataToUpdate.role = updates.account_type === 'realtor' ? 'broker' : 'admin';
        }

        console.log('[UpdateProfile] Prisma Data:', dataToUpdate);

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate
        });

        console.log('[UpdateProfile] Success:', updatedUser.id);
        res.json({
            message: 'Profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        // Simple password check (plain text for MVP/demo as set in register)
        if (!user || user.password_hash !== password) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        // In real app, generate JWT here
        const token = 'mock-jwt-token-' + user.id;

        res.json({
            message: 'Login successful',
            token,
            user: { id: user.id, email: user.email, name: user.name, role: user.role, slug: user.slug }
        });
    } catch (error: any) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error: ' + (error.message || JSON.stringify(error)), error });
    }
};


export const getProfile = async (req: Request, res: Response) => {
    // req.user is populated by middleware
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
        let dbUser = await prisma.user.findUnique({ where: { id: user.id } });

        // Auto-generate slug if missing
        if (dbUser && !dbUser.slug) {
            const slugBase = dbUser.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            const slug = `${slugBase}-${dbUser.id}`; // Simple unique slug
            dbUser = await prisma.user.update({
                where: { id: user.id },
                data: { slug }
            });
        }

        res.json(dbUser);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
};
