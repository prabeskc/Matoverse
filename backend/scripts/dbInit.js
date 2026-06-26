/**
 * dbInit.js — Database Initialization Script
 * Connects to Supabase Postgres via the DATABASE_URL and creates the database schema.
 */
require('dotenv').config();
const { Client } = require('pg');

const initSchema = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('YOUR_DATABASE_PASSWORD')) {
    console.error('❌  Error: DATABASE_URL not set or still contains placeholder password.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false, // Required for secure remote connection to Supabase
    },
  });

  try {
    console.log('\n🛠️   Initializing Supabase Database Schema...');
    await client.connect();
    console.log('✅  Connected to PostgreSQL database.');

    // 1. Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC NOT NULL CHECK (price >= 0),
        original_price NUMERIC CHECK (original_price >= 0),
        badge TEXT CHECK (badge IN ('Best Seller', 'Popular', 'Featured', 'New', 'Sale')),
        material TEXT NOT NULL,
        lead_time TEXT NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        highlight BOOLEAN DEFAULT false,
        in_stock BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('✅  Created "products" table.');

    // 2. Profiles Table (linking custom fields to Supabase auth.users)
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('✅  Created "profiles" table.');

    // 3. Cart Items Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
        UNIQUE(user_id, product_id)
      );
    `);
    console.log('✅  Created "cart_items" table (relational user cart).');

    // 4. Quote Requests Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS quote_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        file_url TEXT,
        status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Reviewed', 'Quoted', 'Resolved', 'Rejected')),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      );
    `);
    console.log('✅  Created "quote_requests" table.');

    console.log('\n🎉  Database schema initialization complete!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌  Database initialization failed:', error.message);
    console.error(error);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
};

initSchema();
