const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 50, // Increased maximum number of clients for high traffic
  idleTimeoutMillis: 3600000, // Close idle clients after 1 hour (was 30s)
  connectionTimeoutMillis: 5000, // Return an error if a connection takes longer than 5 seconds
});

// Test the connection
pool.on('connect', () => {
  console.log('Successfully connected to the PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
