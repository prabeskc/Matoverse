const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * authMiddleware — Protects routes using Supabase Session tokens.
 * Extracts the Bearer token and verifies it via `supabase.auth.getUser()`.
 * Attaches the authenticated user details to `req.user` and `req.userId`.
 */
const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('No authentication token provided. Please log in.', 401)
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Authentication token is missing.', 401));
    }

    // Call Supabase API to fetch user details associated with the token.
    // This automatically verifies the JWT signature and checks expiry.
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return next(
        new AppError('Session expired or invalid token. Please log in again.', 401)
      );
    }

    // Attach user profile info
    req.user = user;
    req.userId = user.id; // Unique UUID from auth.users

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
