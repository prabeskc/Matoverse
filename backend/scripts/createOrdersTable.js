require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  await client.connect();
  console.log('✅ Connected to DB');

  await client.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      customer_name TEXT NOT NULL,
      customer_email TEXT,
      customer_phone TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      notes TEXT,
      items JSONB NOT NULL,
      total_price NUMERIC NOT NULL CHECK (total_price >= 0),
      status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Printing', 'Shipped', 'Delivered', 'Cancelled')),
      user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
    );
  `);

  console.log('✅ orders table created!');
  await client.end();
  process.exit(0);
}

run().catch((e) => {
  console.error('❌ Error:', e.message);
  client.end();
  process.exit(1);
});
