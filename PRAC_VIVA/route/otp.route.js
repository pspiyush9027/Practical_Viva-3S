import express from 'express';
import { sendResetOtp } from '../controller/otp.controller.js';

const router = express.Router();

router.post('/send-reset-otp', sendResetOtp);

export default router;
