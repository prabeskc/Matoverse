const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllQuotesAdmin,
  updateQuoteStatus,
} = require('../controllers/adminController');

const router = express.Router();

// All routes below require: valid auth token + admin role
router.use(authMiddleware, adminMiddleware);

// ─── Dashboard ────────────────────────────────────────────────
router.get('/stats', getDashboardStats);

// ─── Products ─────────────────────────────────────────────────
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ─── Orders ───────────────────────────────────────────────────
router.get('/orders', getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

// ─── Quotes ───────────────────────────────────────────────────
router.get('/quotes', getAllQuotesAdmin);
router.put('/quotes/:id/status', updateQuoteStatus);

module.exports = router;
