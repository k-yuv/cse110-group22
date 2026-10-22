import { Pool } from 'pg';

// This Database Config File Was Created By Claude

const isProduction = (process.env.NODE_ENV === 'production');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  // Long-running local server: 10 connections.
  // Serverless Vercel instance: start with 1.
  max: Number(process.env.DB_POOL_MAX || (isProduction ? 1 : 10)),

  // Require encrypted connections to the production database.
  // Currently enables TLS encryption but does not verify frontend server certificate
  // To tighten security, we will need to do some configuration within Supabase
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false,
});

// Only runs if an idle connection dies unexpectedly, which tests can't trigger.
/* v8 ignore next -- @preserve */
pool.on('error', (err) => {
  console.error('Unexpected PostgreSQL pool error:', err);
});

export default pool;
