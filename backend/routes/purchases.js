const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.get('/purchases', authMiddleware, purchaseController.getPurchases);
router.get('/sales', authMiddleware, purchaseController.getSales);
router.post('/', authMiddleware, purchaseController.createPurchase);
router.put('/:id/status', authMiddleware, purchaseController.updatePurchaseStatus);
router.post('/:id/review', authMiddleware, purchaseController.addReview);

module.exports = router;
