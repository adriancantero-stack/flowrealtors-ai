import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Check for required credentials
const isCloudinaryConfigured = () => {
    return process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET;
};

// Configure Cloudinary (Safe Init)
if (isCloudinaryConfigured()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
} else {
    console.warn('⚠️ Cloudinary not configured. Uploads will fail.');
}

// Configure Multer Storage with Cloudinary
const storage = isCloudinaryConfigured()
    ? new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'flowrealtors/profiles',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            public_id: (req: any, file: any) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                return `profile-${uniqueSuffix}`;
            }
        } as any
    })
    : multer.diskStorage({}); // Fallback dummy to prevent crash on init, but route will block it.

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Route: POST /api/upload
router.post('/', (req: Request, res: Response, next: NextFunction) => {
    if (!isCloudinaryConfigured()) {
        console.error('Upload attempt failed: Missing Cloudinary Credentials');
        return res.status(500).json({
            error: 'Server Storage Not Configured (Missing Cloudinary Keys)',
            details: 'Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET to env.'
        });
    }

    // Wrap multer middleware to catch errors
    const uploadSingle = upload.single('file');

    uploadSingle(req, res, (err: any) => {
        if (err) {
            console.error('Multer/Cloudinary Error:', err);
            // Handle Multer specific errors
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ error: `Upload Error: ${err.message}` });
            }
            // Handle Cloudinary/Other errors
            return res.status(500).json({ error: 'Image Upload Failed', details: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Cloudinary returns the URL in file.path
        res.json({
            url: req.file.path,
            filename: req.file.filename
        });
    });
});

export default router;
