const express = require('express');
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All cart routes require authentication
router.use(authMiddleware);

/**
 * GET /api/cart
 * Protected — Get the authenticated user's cart with populated product details.
 */
router.get('/', getCart);

/**
 * POST /api/cart/add
 * Protected — Add a product to cart or increment its quantity.
 * Body: { productId: string, quantity?: number }
 */
router.post('/add', addToCart);

/**
 * PUT /api/cart/update
 * Protected — Update the quantity of a specific cart item.
 * Setting quantity to 0 removes the item.
 * Body: { productId: string, quantity: number }
 */
router.put('/update', updateCartItem);

/**
 * DELETE /api/cart/remove/:productId
 * Protected — Remove a specific product from the cart entirely.
 * Params: productId (MongoDB ObjectId of the product)
 */
router.delete('/remove/:productId', removeFromCart);

/**
 * DELETE /api/cart/clear
 * Protected — Remove all items from the cart (e.g., after checkout).
 */
router.delete('/clear', clearCart);

module.exports = router;
