const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

// ─────────────────────────────────────────────────────────────────────────────
//  DASHBOARD STATS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/stats
 * Returns aggregate counts for the dashboard overview cards.
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      { count: totalProducts, error: pe },
      { count: totalOrders, error: oe },
      { count: totalQuotes, error: qe },
      { data: salesData, error: se },
    ] = await Promise.all([
      supabase.from('products').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase
        .from('quote_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Pending', 'Awaiting Review']),
      supabase.from('orders').select('total_price').neq('status', 'Cancelled'),
    ]);

    if (pe || oe || qe || se) {
      return next(new AppError('Failed to fetch dashboard statistics.', 500));
    }

    const totalSales = (salesData || []).reduce(
      (sum, o) => sum + Number(o.total_price || 0),
      0
    );

    res.status(200).json({
      status: 'success',
      data: {
        totalProducts: totalProducts || 0,
        totalOrders: totalOrders || 0,
        activeQuotes: totalQuotes || 0,
        totalSales: Math.round(totalSales),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  PRODUCTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/admin/products
 * Creates a new product record.
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      badge,
      material,
      leadTime,
      imageUrl,
      inStock,
      highlight,
      category,
    } = req.body;

    if (!title || !description || price === undefined) {
      return next(
        new AppError('title, description, and price are required.', 400)
      );
    }

    const numericPrice = Number(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return next(new AppError('price must be a non-negative number.', 400));
    }

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        title: title.trim(),
        description: description.trim(),
        price: numericPrice,
        original_price: originalPrice ? Number(originalPrice) : null,
        badge: badge ? badge.trim() : null,
        material: material || null,
        lead_time: leadTime ? leadTime.trim() : null,
        image_url: imageUrl ? imageUrl.trim() : null,
        in_stock: inStock !== undefined ? Boolean(inStock) : true,
        highlight: highlight !== undefined ? Boolean(highlight) : false,
        category: category ? category.trim() : null,
      })
      .select()
      .single();

    if (error) {
      return next(new AppError(error.message, 400));
    }

    console.log(`✅ [ADMIN] Product created: "${product.title}" (${product.id})`);

    res.status(201).json({
      status: 'success',
      message: `Product "${product.title}" created successfully.`,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/products/:id
 * Updates an existing product.
 */
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      'title', 'description', 'price', 'originalPrice',
      'badge', 'material', 'leadTime', 'imageUrl',
      'inStock', 'highlight', 'category',
    ];

    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title.trim();
    if (req.body.description !== undefined) updates.description = req.body.description.trim();
    if (req.body.price !== undefined) updates.price = Number(req.body.price);
    if (req.body.originalPrice !== undefined) updates.original_price = req.body.originalPrice ? Number(req.body.originalPrice) : null;
    if (req.body.badge !== undefined) updates.badge = req.body.badge ? req.body.badge.trim() : null;
    if (req.body.material !== undefined) updates.material = req.body.material || null;
    if (req.body.leadTime !== undefined) updates.lead_time = req.body.leadTime ? req.body.leadTime.trim() : null;
    if (req.body.imageUrl !== undefined) updates.image_url = req.body.imageUrl ? req.body.imageUrl.trim() : null;
    if (req.body.inStock !== undefined) updates.in_stock = Boolean(req.body.inStock);
    if (req.body.highlight !== undefined) updates.highlight = Boolean(req.body.highlight);
    if (req.body.category !== undefined) updates.category = req.body.category ? req.body.category.trim() : null;

    if (Object.keys(updates).length === 0) {
      return next(new AppError('No valid fields provided for update.', 400));
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(new AppError(error.message, 400));
    }
    if (!product) {
      return next(new AppError(`No product found with ID: ${id}`, 404));
    }

    console.log(`✏️  [ADMIN] Product updated: "${product.title}" (${product.id})`);

    res.status(200).json({
      status: 'success',
      message: `Product "${product.title}" updated successfully.`,
      data: { product },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/products/:id
 * Deletes a product.
 */
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('id, title')
      .eq('id', id)
      .single();

    if (fetchError || !product) {
      return next(new AppError(`No product found with ID: ${id}`, 404));
    }

    const { error } = await supabase.from('products').delete().eq('id', id);

    if (error) {
      return next(new AppError(error.message, 500));
    }

    console.log(`🗑️  [ADMIN] Product deleted: "${product.title}" (${id})`);

    res.status(200).json({
      status: 'success',
      message: `Product "${product.title}" deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────────────────────────────────────────

const ORDER_STATUSES = [
  'Pending',
  'Placed',
  'Processing',
  'Shipped',
  'Delivered',
  'Cancelled',
];

/**
 * GET /api/admin/orders
 * Returns ALL orders (across all users) ordered by newest first.
 */
const getAllOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/orders/:id/status
 * Updates the status of a specific order.
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !ORDER_STATUSES.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Allowed values: ${ORDER_STATUSES.join(', ')}.`,
          400
        )
      );
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(new AppError(error.message, 400));
    }
    if (!order) {
      return next(new AppError(`No order found with ID: ${id}`, 404));
    }

    console.log(`📦 [ADMIN] Order ${id} status → "${status}"`);

    res.status(200).json({
      status: 'success',
      message: `Order status updated to "${status}".`,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  QUOTES
// ─────────────────────────────────────────────────────────────────────────────

const QUOTE_STATUSES = ['Awaiting Review', 'Quoted', 'Rejected'];

/**
 * GET /api/admin/quotes
 * Returns ALL quote requests ordered by newest first.
 */
const getAllQuotesAdmin = async (req, res, next) => {
  try {
    const { data: quotes, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return next(new AppError(error.message, 400));
    }

    res.status(200).json({
      status: 'success',
      results: quotes.length,
      data: { quotes },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/quotes/:id/status
 * Updates the status of a quote request.
 */
const updateQuoteStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !QUOTE_STATUSES.includes(status)) {
      return next(
        new AppError(
          `Invalid status. Allowed values: ${QUOTE_STATUSES.join(', ')}.`,
          400
        )
      );
    }

    const { data: quote, error } = await supabase
      .from('quote_requests')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return next(new AppError(error.message, 400));
    }
    if (!quote) {
      return next(new AppError(`No quote found with ID: ${id}`, 404));
    }

    console.log(`📋 [ADMIN] Quote ${id} status → "${status}"`);

    res.status(200).json({
      status: 'success',
      message: `Quote status updated to "${status}".`,
      data: { quote },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllQuotesAdmin,
  updateQuoteStatus,
};
