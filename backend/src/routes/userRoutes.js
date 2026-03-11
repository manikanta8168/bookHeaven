import express from 'express';
import {
    authUser,
    registerUser,
    getUserProfile,
    updateUserProfile,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiters.js';
import { validateLogin, validateRegister } from '../middleware/validators.js';

const router = express.Router();

router.route('/').post(authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, authUser);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

export default router;
