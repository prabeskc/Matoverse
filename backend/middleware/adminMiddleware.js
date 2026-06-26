const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

/**
 * adminMiddleware — Must be used AFTER authMiddleware.
 * Fetches the authenticated user's role from the profiles table.
 * Rejects the request with 403 if the role is not 'admin'.
 */
const adminMiddleware = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('Not authenticated.', 401));
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return next(new AppError('Could not verify admin privileges.', 403));
    }

    if (profile.role !== 'admin') {
      return next(
        new AppError('Access denied. Admin privileges required.', 403)
      );
    }

    // Attach role to req.user for downstream use
    req.user.role = profile.role;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = adminMiddleware;
