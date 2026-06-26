const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

// ─── Controller: POST /api/orders ────────────────────────────────────────────
const placeOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      notes,
      items,        // Array of { productId, name, price, quantity }
      totalPrice,
    } = req.body;

    // ── Validation ────────────────────────────────────────────────────────────
    if (!customerName || !customerPhone || !deliveryAddress) {
      return next(new AppError('Name, phone number, and delivery address are required.', 400));
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one item.', 400));
    }
    if (!totalPrice || Number(totalPrice) <= 0) {
      return next(new AppError('Total price is invalid.', 400));
    }

    // ── Fetch DB names for validation / fallback ─────────────────────────────
    const productIds = items.map(item => item.productId).filter(Boolean);
    let productMap = {};
    if (productIds.length > 0) {
      const { data: productsData } = await supabase
        .from('products')
        .select('id, title')
        .in('id', productIds);
      if (productsData) {
        productsData.forEach(p => {
          productMap[p.id.toLowerCase()] = p.title;
        });
      }
    }

    // Enrich items with name from DB if missing or format properly
    const enrichedItems = items.map((item) => {
      const id = item.productId || item.product_id;
      const dbName = id ? productMap[id.toLowerCase()] : null;
      return {
        productId: id,
        name: (item.name || dbName || 'Unknown Product').trim(),
        price: Number(item.price || 0),
        quantity: Number(item.quantity || 1),
        subtotal: Number(item.subtotal || (item.price || 0) * (item.quantity || 1)),
      };
    });

    // Generate human-readable items summary
    const itemsSummary = enrichedItems.map(item => `${item.name} x ${item.quantity}`).join(', ');

    // ── Insert order into Supabase ────────────────────────────────────────────
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        customer_name: customerName.trim(),
        customer_email: customerEmail ? customerEmail.trim().toLowerCase() : null,
        customer_phone: customerPhone.trim(),
        delivery_address: deliveryAddress.trim(),
        notes: notes ? notes.trim() : null,
        items: enrichedItems,
        items_summary: itemsSummary,
        total_price: Number(totalPrice),
        user_id: req.userId || null,  // Attach user ID if authenticated (optional)
        status: 'Pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Order insert error:', error);
      return next(new AppError(error.message, 500));
    }

    // ── Insert items into order_items table ──────────────────────────────────
    const orderItemsRows = enrichedItems.map((item) => ({
      order_id: order.id,
      product_id: item.productId || null,
      product_name: item.name,
      unit_price: item.price,
      quantity: item.quantity,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsRows);

    if (itemsError) {
      console.error('Order items insert error:', itemsError);
    }

    // ── Log order summary to server console ──────────────────────────────────
    const border = '─'.repeat(55);
    console.log('\n');
    console.log('🛒  [NEW ORDER] Order Placed Successfully');
    console.log(border);
    console.log(`  Order ID:    ${order.id}`);
    console.log(`  Customer:    ${order.customer_name}`);
    console.log(`  Phone:       ${order.customer_phone}`);
    console.log(`  Email:       ${order.customer_email || 'N/A'}`);
    console.log(`  Address:     ${order.delivery_address}`);
    console.log(`  Total:       Rs. ${order.total_price}`);
    console.log(`  Items:       ${order.items.length} product(s)`);
    order.items.forEach((item) => {
      console.log(`    → ${item.name} × ${item.quantity}  (Rs. ${item.price} each)`);
    });
    console.log(`  Status:      ${order.status}`);
    console.log(`  Time:        ${new Date(order.created_at).toLocaleString('en-NP', { timeZone: 'Asia/Kathmandu' })} NPT`);
    console.log(border);
    console.log('\n');

    res.status(201).json({
      status: 'success',
      message: `Order placed! We will contact ${order.customer_name} at ${order.customer_phone} to confirm details.`,
      data: {
        orderId: order.id,
        customerName: order.customer_name,
        customerPhone: order.customer_phone,
        status: order.status,
        totalPrice: order.total_price,
        itemCount: order.items.length,
        placedAt: order.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Controller: GET /api/orders ─────────────────────────────────────────────
// Protected — returns orders for the authenticated user
const getMyOrders = async (req, res, next) => {
  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', req.userId)
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

// ─── Controller: PATCH /api/orders/:id/cancel ────────────────────────────────
// Protected — cancels an order if within 30 minutes of placement and still Pending
const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch the order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, user_id, created_at, customer_name')
      .eq('id', id)
      .single();

    if (fetchError || !order) {
      return next(new AppError('Order not found.', 404));
    }

    // Must belong to the requesting user
    if (order.user_id !== req.userId) {
      return next(new AppError('You are not authorised to cancel this order.', 403));
    }

    // Must still be Pending
    if (order.status !== 'Pending') {
      return next(new AppError(`Cannot cancel an order with status "${order.status}".`, 400));
    }

    // Must be within 30 minutes
    const placedAt = new Date(order.created_at);
    const now = new Date();
    const diffMs = now - placedAt;
    const THIRTY_MIN_MS = 30 * 60 * 1000;

    if (diffMs > THIRTY_MIN_MS) {
      return next(new AppError('Cancellation window has passed. Orders can only be cancelled within 30 minutes of placement.', 400));
    }

    // Update status
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ status: 'Cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return next(new AppError(updateError.message, 500));
    }

    console.log(`\n❌ [ORDER CANCELLED] ${updated.id} — ${order.customer_name}\n`);

    res.status(200).json({
      status: 'success',
      message: 'Order cancelled successfully.',
      data: { orderId: updated.id, status: updated.status },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { placeOrder, getMyOrders, cancelOrder };
