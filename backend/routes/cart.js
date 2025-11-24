const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.get('/', authMiddleware, cartController.getCart);
router.post('/add', authMiddleware, cartController.addToCart);
router.post('/remove', authMiddleware, cartController.removeFromCart);
router.post('/clear', authMiddleware, cartController.clearCart);
router.post('/update-quantity', authMiddleware, cartController.updateQuantity);

module.exports = router;
