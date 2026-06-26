/**
 * add_quote_file_column.js — Migration Script
 * Connects to Supabase PostgreSQL and adds the `file_url` column to `quote_requests` table.
 */
require('dotenv').config();
const { Client } = require('pg');

const migrate = async () => {
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
    console.log('\n🛠️   Running migration to add file_url to quote_requests...');
    await client.connect();
    console.log('✅  Connected to database.');

    await client.query(`
      ALTER TABLE quote_requests 
      ADD COLUMN IF NOT EXISTS file_url TEXT;
    `);
    console.log('✅  Added "file_url" column to "quote_requests" table (if it did not exist).');

    await client.end();
    console.log('🎉  Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌  Migration failed:', error.message);
    console.error(error);
    try {
      await client.end();
    } catch (e) {}
    process.exit(1);
  }
};

migrate();
