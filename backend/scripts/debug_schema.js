const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

async function run() {
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // Products schema
  const p = await client.query(
    "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'products' ORDER BY ordinal_position"
  );
  console.log('=== PRODUCTS COLUMNS ===');
  p.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable}, default: ${r.column_default})`));

  // Orders schema
  const o = await client.query(
    "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'orders' ORDER BY ordinal_position"
  );
  console.log('\n=== ORDERS COLUMNS ===');
  o.rows.forEach(r => console.log(`  ${r.column_name}: ${r.data_type} (nullable: ${r.is_nullable}, default: ${r.column_default})`));

  // Orders check constraints (for status enum)
  const c = await client.query(
    "SELECT conname, consrc FROM pg_constraint JOIN pg_class ON pg_constraint.conrelid = pg_class.oid WHERE pg_class.relname = 'orders' AND contype = 'c'"
  );
  console.log('\n=== ORDERS CHECK CONSTRAINTS ===');
  c.rows.forEach(r => console.log(`  ${r.conname}: ${r.consrc}`));

  // Products check constraints (for status enum)
  const c2 = await client.query(
    "SELECT conname, consrc FROM pg_constraint JOIN pg_class ON pg_constraint.conrelid = pg_class.oid WHERE pg_class.relname = 'products' AND contype = 'c'"
  );
  console.log('\n=== PRODUCTS CHECK CONSTRAINTS ===');
  c2.rows.forEach(r => console.log(`  ${r.conname}: ${r.conname}: ${r.consrc}`));

  await client.end();
}
run().catch(console.error);
