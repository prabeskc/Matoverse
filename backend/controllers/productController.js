const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

// ─── Controller: GET /api/products ───────────────────────────────────────────
const getAllProducts = async (req, res, next) => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply optional filter parameters
    if (req.query.material) {
      query = query.eq('material', req.query.material);
    }
    if (req.query.category) {
      query = query.eq('category', req.query.category);
    }
    if (req.query.highlight) {
      query = query.eq('highlight', req.query.highlight === 'true');
    }
    if (req.query.badge) {
      query = query.eq('badge', req.query.badge);
    }
    if (req.query.inStock) {
      query = query.eq('in_stock', req.query.inStock !== 'false');
    }

    const { data: products, error } = await query;

    if (error) {
      return next(new AppError(error.message, 400));
    }

    res.status(200).json({
      status: 'success',
      results: products.length,
      data: { products },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: GET /api/products/:id ───────────────────────────────────────
const getProductById = async (req, res, next) => {
  try {
    // Validate UUID format before querying to avoid DB query exceptions
    const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!uuidRegex.test(req.params.id)) {
      return next(new AppError('Invalid product ID format.', 400));
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error || !product) {
      return next(new AppError(`No product found with ID: ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: 'success',
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllProducts, getProductById };
