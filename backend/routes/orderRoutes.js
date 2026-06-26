const express = require('express');
const { placeOrder, getMyOrders, cancelOrder } = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/orders
 * Public — place an order. Optionally attaches a user ID if logged in.
 */
router.post('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authMiddleware(req, res, (err) => {
      if (err) req.userId = null;
      placeOrder(req, res, next);
    });
  }
  req.userId = null;
  return placeOrder(req, res, next);
});

/**
 * GET /api/orders/mine
 * Protected — get all orders for the logged-in user.
 */
router.get('/mine', authMiddleware, getMyOrders);

/**
 * PATCH /api/orders/:id/cancel
 * Protected — cancel an order within 30 minutes if still Pending.
 */
router.patch('/:id/cancel', authMiddleware, cancelOrder);

module.exports = router;
