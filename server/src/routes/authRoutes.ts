import { Router } from 'express';
import { register, login, updateProfile, getProfile } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile/:userId', updateProfile);
router.get('/me', getProfile); // Fetch own profile

export default router;
