const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log('✅ Connected to DB');

  // 1. Fix orders status CHECK constraint to include all admin statuses
  console.log('🛠️  Updating orders status CHECK constraint...');
  await client.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;`);
  await client.query(`
    ALTER TABLE orders 
    ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('Pending', 'Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'));
  `);
  console.log('✅ Orders status constraint updated.');

  // 2. Make products.category nullable (so admin can create without it)
  console.log('🛠️  Making products.category nullable...');
  await client.query(`ALTER TABLE products ALTER COLUMN category DROP NOT NULL;`);
  await client.query(`ALTER TABLE products ALTER COLUMN category SET DEFAULT NULL;`);
  console.log('✅ products.category is now nullable.');

  await client.end();
  console.log('\n🎉 Database fixes applied successfully!');
}

run().catch(e => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
