const { Pool } = require('pg');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'subscription_tracker_db',
    password: 'postmanpat',
    port: 5432, // default PostgreSQL port
});

module.exports = pool;