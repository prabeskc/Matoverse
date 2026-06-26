const express = require('express');
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /api/auth/signup
 * Public — Register a new user account.
 * Body: { name, email, password }
 * Returns: { token, user }
 */
router.post('/signup', signup);

/**
 * POST /api/auth/login
 * Public — Authenticate existing user.
 * Body: { email, password }
 * Returns: { token, user }
 */
router.post('/login', login);

/**
 * GET /api/auth/me
 * Protected — Returns the currently authenticated user's profile.
 * Header: Authorization: Bearer <token>
 */
router.get('/me', authMiddleware, getMe);

/**
 * PATCH /api/auth/profile
 * Protected — Update the authenticated user's phone number and/or delivery address.
 * Header: Authorization: Bearer <token>
 * Body: { phone?, address? }
 * Returns: { user: { id, name, avatar, phone, address } }
 */
router.patch('/profile', authMiddleware, updateProfile);

module.exports = router;
