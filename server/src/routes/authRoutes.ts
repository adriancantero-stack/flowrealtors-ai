import { Router } from 'express';
import { register, login, updateProfile } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile/:userId', updateProfile);

export default router;
