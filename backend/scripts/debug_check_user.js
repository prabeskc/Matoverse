const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Client } = require('pg');

const run = async () => {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  const res = await client.query(`
    SELECT p.id, p.name, u.email, p.role 
    FROM profiles p 
    JOIN auth.users u ON p.id = u.id;
  `);
  console.log('--- PROFILES AND ROLES ---');
  console.log(JSON.stringify(res.rows, null, 2));
  console.log('--------------------------');
  await client.end();
};

run().catch(console.error);
