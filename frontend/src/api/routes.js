import express from 'express';
import { createOrder, verifyPayment } from './razorpay.js';

const router = express.Router();

// Razorpay payment routes
router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);

export default router; 