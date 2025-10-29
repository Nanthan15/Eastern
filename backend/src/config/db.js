import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

// Create a pool with Neon pooling endpoint
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Use the Pooling URL from Neon
  ssl: { rejectUnauthorized: false },
  
});

// Listen for unexpected errors on idle clients
pool.on('error', (err) => {
  console.error('❌ Unexpected DB error', err);
  // Optional: add alerting/logging here
});

// Optional helper: query with retry on failure
export async function queryWithRetry(text, params = [], retries = 5) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn(`⚠️ Query failed, retrying (${i + 1}/${retries})`, err.message);
      await new Promise(res => setTimeout(res, 1000)); // wait 1 second
    }
  }
  throw new Error('Max retries reached for query');
}

// Test initial connection (optional)
(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL (Neon.tech) at', res.rows[0].now);
  } catch (err) {
    console.error('❌ Initial DB connection failed', err);
  }
})();

export default pool;
