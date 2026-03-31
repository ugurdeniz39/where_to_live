const { Pool } = require('pg');

let _pool = null;

/**
 * Returns a pg Pool if DATABASE_URL is set, otherwise null.
 * Null → graceful fallback to JSON/file storage.
 * Compatible with Neon PostgreSQL (and any standard PostgreSQL).
 */
function getDB() {
    if (_pool) return _pool;
    const url = process.env.DATABASE_URL;
    if (!url) return null;
    _pool = new Pool({
        connectionString: url,
        ssl: { rejectUnauthorized: false }, // required for Neon
        max: 3, // serverless: keep pool small
        idleTimeoutMillis: 10000,
        connectionTimeoutMillis: 5000
    });
    return _pool;
}

module.exports = { getDB };
