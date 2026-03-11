import express from 'express';
import {
    createCollabRequest,
    getCollabRequests,
    updateCollabRequest,
} from '../controllers/collabController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { validateCollabPayload } from '../middleware/validators.js';

const router = express.Router();

router.route('/').post(validateCollabPayload, createCollabRequest).get(protect, admin, getCollabRequests);
router.route('/:id').put(protect, admin, updateCollabRequest);

export default router;
