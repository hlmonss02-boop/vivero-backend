// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => {
    console.log('PostgreSQL conectado 🌱');
  })
  .catch((err) => {
    console.log('Error conectando a PostgreSQL:', err);
  });

module.exports = pool;