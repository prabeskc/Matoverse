const express = require('express');
const { getAllProducts, getProductById } = require('../controllers/productController');

const router = express.Router();

/**
 * GET /api/products
 * Public — Fetch all products.
 * Optional query filters:
 *   ?material=PETG
 *   ?category=Home+Decor
 *   ?highlight=true
 *   ?badge=Best+Seller
 *   ?inStock=true
 */
router.get('/', getAllProducts);

/**
 * GET /api/products/:id
 * Public — Fetch a single product by MongoDB _id.
 * Returns 404 if not found.
 */
router.get('/:id', getProductById);

module.exports = router;
