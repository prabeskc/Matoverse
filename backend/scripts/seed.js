/**
 * seed.js — Database Seed Script for Supabase PostgreSQL
 * Populates the products table with initial catalog items.
 */
require('dotenv').config();
const { Client } = require('pg');

const seedProducts = [
  {
    title: 'Coil Lamp',
    description:
      'Modern spiral design with elegant diffusion. Heat-resistant translucent PETG material. Integrated routing channel for cables.',
    price: 2499,
    original_price: 2999,
    badge: 'Best Seller',
    material: 'Translucent PETG',
    lead_time: '3–5 days',
    image_url: '/images/coil_lamp.png',
    category: 'Home Decor',
    highlight: true,
    in_stock: true,
  },
  {
    title: 'NFC Tags',
    description:
      'Custom keychains with embedded NFC chips. Program link-sharing & smart actions. Printed in ultra-durable TPU & PLA+.',
    price: 499,
    original_price: null,
    badge: 'Popular',
    material: 'Tough PLA+ / TPU',
    lead_time: '1–2 days',
    image_url: '/images/nfc_tags.png',
    category: 'Accessories',
    highlight: true,
    in_stock: true,
  },
  {
    title: 'BMW Lamp',
    description:
      'Illuminated stand or wall-mount BMW logo. Perfect for garages and bedside tables. Pre-installed high-output LED lights.',
    price: 3499,
    original_price: 3999,
    badge: 'Featured',
    material: 'PLA+ / PETG',
    lead_time: '4–6 days',
    image_url: '/images/bmw_lamp.png',
    category: 'Automotive',
    highlight: true,
    in_stock: true,
  },
];

const seedDatabase = async () => {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl || dbUrl.includes('YOUR_DATABASE_PASSWORD')) {
    console.error('❌  Error: DATABASE_URL not set or still contains placeholder password.');
    process.exit(1);
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log('\n🌱  Matoverse — Seeding Supabase Database...');
    await client.connect();

    const shouldDelete = process.argv.includes('--delete');
    if (shouldDelete) {
      await client.query('DELETE FROM products');
      console.log('🗑️   Wiped existing records in "products" table.');
    } else {
      // Check if products exist to prevent duplicates
      const checkRes = await client.query('SELECT COUNT(*) FROM products');
      const count = parseInt(checkRes.rows[0].count, 10);
      if (count > 0) {
        console.log(`\n⚠️   Database already has ${count} product(s). Seeding skipped.`);
        console.log('   Use `npm run seed -- --delete` to wipe and re-seed.\n');
        await client.end();
        process.exit(0);
      }
    }

    console.log('📦  Inserting seed products...');
    for (const product of seedProducts) {
      await client.query(
        `INSERT INTO products 
         (title, description, price, original_price, badge, material, lead_time, image_url, category, highlight, in_stock) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          product.title,
          product.description,
          product.price,
          product.original_price,
          product.badge,
          product.material,
          product.lead_time,
          product.image_url,
          product.category,
          product.highlight,
          product.in_stock,
        ]
      );
      console.log(`   + Seeded: ${product.title}`);
    }

    console.log('\n🎉  Seeding complete!');
    await client.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌  Seed failed:', error.message);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
};

seedDatabase();
