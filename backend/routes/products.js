const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/free', productController.getFreeProducts);

// Protected routes
router.get('/', authMiddleware, productController.getMyProducts);
router.post('/', authMiddleware, productController.createProduct);
router.get('/:id', productController.getProduct);
router.put('/:id', authMiddleware, productController.updateProduct);
router.delete('/:id', authMiddleware, productController.deleteProduct);

module.exports = router;
