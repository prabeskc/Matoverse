require('dotenv').config();
const { Client } = require('pg');

async function run() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('YOUR_DATABASE_PASSWORD')) {
    console.error('❌ Error: DATABASE_URL not set in .env.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('🔌 Connecting to Supabase database...');
    await client.connect();
    console.log('✅ Connected successfully.');

    // 1. Add items_summary to orders table if not exists
    console.log('🛠️ Adding "items_summary" column to "orders" table...');
    await client.query(`
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_summary TEXT;
    `);
    console.log('✅ Column check done.');

    // 2. Create order_items table
    console.log('🛠️ Creating "order_items" table if it doesn\'t exist...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE SET NULL,
        product_name TEXT NOT NULL,
        unit_price NUMERIC NOT NULL CHECK (unit_price >= 0),
        quantity INTEGER NOT NULL CHECK (quantity >= 1),
        subtotal NUMERIC NOT NULL CHECK (subtotal >= 0),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('✅ Table "order_items" check done.');

    // 3. Get all products for lookup mapping
    console.log('📦 Loading products from database for lookup...');
    const prodRes = await client.query('SELECT id, title FROM products');
    const productLookup = {};
    prodRes.rows.forEach((p) => {
      productLookup[p.id.toLowerCase()] = p.title;
    });
    console.log(`✅ Loaded ${prodRes.rows.length} product(s) for name resolution.`);

    // 4. Fetch existing orders
    console.log('🛒 Loading existing orders to backfill...');
    const orderRes = await client.query('SELECT * FROM orders');
    console.log(`✅ Loaded ${orderRes.rows.length} order(s).`);

    for (const order of orderRes.rows) {
      console.log(`\n🔄 Processing Order: ${order.id} (Customer: ${order.customer_name})`);

      let items = [];
      if (typeof order.items === 'string') {
        try {
          items = JSON.parse(order.items);
        } catch (e) {
          console.error(`   ❌ Failed to parse items JSON string for order ${order.id}`);
          continue;
        }
      } else if (Array.isArray(order.items)) {
        items = order.items;
      } else if (order.items && typeof order.items === 'object') {
        items = [order.items];
      }

      if (!Array.isArray(items) || items.length === 0) {
        console.log('   ⚠️ No items found or invalid format.');
        continue;
      }

      // Update names in JSONB items if missing, using the lookup
      let nameUpdated = false;
      const updatedItems = items.map((item) => {
        const id = item.productId || item.product_id;
        let name = item.name;

        if (!name) {
          if (id && productLookup[id.toLowerCase()]) {
            name = productLookup[id.toLowerCase()];
            console.log(`   ✏️ Resolved missing item name: ID ${id} -> "${name}"`);
            nameUpdated = true;
          } else {
            name = 'Unknown Product';
            console.log(`   ⚠️ Could not resolve name for product ID ${id}. Fallback to "Unknown Product"`);
            nameUpdated = true;
          }
        }

        return {
          ...item,
          name,
          // Ensure subtotal and price exist
          price: Number(item.price || item.unit_price || 0),
          quantity: Number(item.quantity || 1),
          subtotal: Number(item.subtotal || (item.price || 0) * (item.quantity || 1)),
          productId: id,
        };
      });

      // Generate items_summary (e.g. "Coil Lamp x 1, NFC Tags x 2")
      const summaryList = updatedItems.map((item) => `${item.name} x ${item.quantity}`);
      const itemsSummary = summaryList.join(', ');
      console.log(`   📝 Generated summary: "${itemsSummary}"`);

      // Update orders table with items_summary and updated items JSONB
      await client.query(
        'UPDATE orders SET items = $1, items_summary = $2 WHERE id = $3',
        [JSON.stringify(updatedItems), itemsSummary, order.id]
      );
      console.log('   ✅ Saved updated order record.');

      // Clear existing order_items for this order to prevent duplicates if running migration multiple times
      await client.query('DELETE FROM order_items WHERE order_id = $1', [order.id]);

      // Insert items into order_items table
      for (const item of updatedItems) {
        const productId = item.productId || null;
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            order.id,
            productId,
            item.name,
            item.price,
            item.quantity,
            item.subtotal,
          ]
        );
      }
      console.log(`   ✅ Inserted ${updatedItems.length} row(s) into "order_items" table.`);
    }

    console.log('\n🎉 Order schema update and migration backfill completed successfully!');
    await client.end();
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
}

run();
