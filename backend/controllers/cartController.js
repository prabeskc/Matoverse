const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

// ─── Helper: Format Cart to match expected Frontend Shape ──────────────────────
/**
 * Formats relational SQL cart items into the nested document structure that
 * the React frontend contexts expect, ensuring backward compatibility.
 */
const formatCartResponse = (userId, sqlItems) => {
  const items = sqlItems.map((item) => ({
    productId: {
      id: item.products.id,
      _id: item.products.id, // Support both styles
      title: item.products.title,
      price: Number(item.products.price),
      originalPrice: item.products.original_price ? Number(item.products.original_price) : null,
      badge: item.products.badge,
      imageUrl: item.products.image_url,
      material: item.products.material,
      leadTime: item.products.lead_time,
      category: item.products.category,
      inStock: item.products.in_stock,
    },
    quantity: item.quantity,
  }));

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return {
    userId,
    items,
    itemCount,
  };
};

// Helper to validate UUIDs
const isUUID = (str) => {
  const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
  return uuidRegex.test(str);
};

// ─── Controller: GET /api/cart ────────────────────────────────────────────────
const getCart = async (req, res, next) => {
  try {
    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.userId);

    if (error) {
      return next(new AppError(error.message, 400));
    }

    const cart = formatCartResponse(req.userId, cartItems || []);

    res.status(200).json({
      status: 'success',
      data: { cart },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: POST /api/cart/add ──────────────────────────────────────────
const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return next(new AppError('productId is required.', 400));
    }
    if (!isUUID(productId)) {
      return next(new AppError('Invalid product ID format.', 400));
    }
    if (quantity < 1 || !Number.isInteger(Number(quantity))) {
      return next(new AppError('Quantity must be a positive integer.', 400));
    }

    // 1. Verify the product exists and is in stock
    const { data: product, error: prodError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (prodError || !product) {
      return next(new AppError('No product found with that ID.', 404));
    }
    if (!product.in_stock) {
      return next(new AppError(`"${product.title}" is currently out of stock.`, 400));
    }

    // 2. Performupsert log: Check if user already has this product in cart
    const { data: existingItem, error: existError } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('user_id', req.userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (existingItem) {
      // Increment quantity
      const { error: updateError } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + Number(quantity) })
        .eq('id', existingItem.id);

      if (updateError) return next(new AppError(updateError.message, 500));
    } else {
      // Add new cart item row
      const { error: insertError } = await supabase
        .from('cart_items')
        .insert({
          user_id: req.userId,
          product_id: productId,
          quantity: Number(quantity),
        });

      if (insertError) return next(new AppError(insertError.message, 500));
    }

    // 3. Fetch all current cart items populated with product details to respond
    const { data: updatedCartItems, error: cartError } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.userId);

    if (cartError) return next(new AppError(cartError.message, 500));

    res.status(200).json({
      status: 'success',
      message: `"${product.title}" added to cart.`,
      data: { cart: formatCartResponse(req.userId, updatedCartItems || []) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: PUT /api/cart/update ────────────────────────────────────────
const updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || quantity === undefined) {
      return next(new AppError('productId and quantity are required.', 400));
    }
    if (!isUUID(productId)) {
      return next(new AppError('Invalid product ID format.', 400));
    }
    if (quantity < 0) {
      return next(new AppError('Quantity cannot be negative.', 400));
    }

    // Check if the item exists in the cart
    const { data: cartItem, error: checkError } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', req.userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (!cartItem) {
      return next(new AppError('This product is not in your cart.', 404));
    }

    if (Number(quantity) === 0) {
      // Remove item
      await supabase.from('cart_items').delete().eq('id', cartItem.id);
    } else {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: Number(quantity) })
        .eq('id', cartItem.id);
    }

    // Fetch and return updated cart
    const { data: updatedCartItems } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.userId);

    res.status(200).json({
      status: 'success',
      message: 'Cart updated.',
      data: { cart: formatCartResponse(req.userId, updatedCartItems || []) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: DELETE /api/cart/remove/:productId ──────────────────────────
const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;

    if (!isUUID(productId)) {
      return next(new AppError('Invalid product ID format.', 400));
    }

    const { data: cartItem } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', req.userId)
      .eq('product_id', productId)
      .maybeSingle();

    if (!cartItem) {
      return next(new AppError('This product is not in your cart.', 404));
    }

    await supabase.from('cart_items').delete().eq('id', cartItem.id);

    // Fetch and return updated cart
    const { data: updatedCartItems } = await supabase
      .from('cart_items')
      .select('*, products(*)')
      .eq('user_id', req.userId);

    res.status(200).json({
      status: 'success',
      message: 'Item removed from cart.',
      data: { cart: formatCartResponse(req.userId, updatedCartItems || []) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: DELETE /api/cart/clear ──────────────────────────────────────
const clearCart = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', req.userId);

    if (error) {
      return next(new AppError(error.message, 500));
    }

    res.status(200).json({
      status: 'success',
      message: 'Cart cleared.',
      data: {
        cart: {
          userId: req.userId,
          items: [],
          itemCount: 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
