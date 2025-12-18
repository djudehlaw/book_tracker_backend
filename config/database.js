const { Pool } = require('pg');

const pool = new Pool({
  host: 'dpg-d527opre5dus73eeubl0-a.oregon-postgres.render.com',
  port: 5432,
  user: 'book_tracker_t5co_user',
  password: 'JIF1tPVHGWIRknL24Z7hkll5jfcsT354',
  database: 'book_tracker_t5co',
  ssl: { rejectUnauthorized: false } // важно для Render
});

module.exports = pool;
