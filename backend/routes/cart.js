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

// DELETE routes for RESTful API
router.delete('/', authMiddleware, cartController.clearCart);
router.delete('/:itemId', authMiddleware, (req, res) => {
  req.body.itemId = req.params.itemId;
  cartController.removeFromCart(req, res);
});

// PUT route for updating quantity
router.put('/:itemId', authMiddleware, (req, res) => {
  req.body.itemId = req.params.itemId;
  cartController.updateQuantity(req, res);
});

module.exports = router;
