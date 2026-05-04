//POST /api/profile
//GET /api/profile/:userId
//PUT /api/profile/:userId
//PUT /api/profile/:userId/change-password

import express from 'express';
import { createProfile, editProfile, changePassword } from '../controller/profile.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';
const router = express.Router();

router.post('/create-profile', createProfile);
router.put('/edit-profile', authMiddleware, editProfile);
router.put('/change-password', authMiddleware, changePassword);

export default router;

