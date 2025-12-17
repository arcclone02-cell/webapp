const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

// POST: Tạo URL thanh toán VNPay
router.post('/create-payment-url', authMiddleware, paymentController.createPaymentUrl);

// GET: Callback từ VNPay sau khi thanh toán (Return URL)
router.get('/vnpay-return', paymentController.handlePaymentReturn);

// POST: IPN từ VNPay (Instant Payment Notification)
router.post('/vnpay-notify', paymentController.handlePaymentNotify);

module.exports = router;
