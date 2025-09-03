const mysql = require('mysql2/promise');
const fs = require('fs');

let pool;

async function ensureDatabaseAndPool() {
    const host = process.env.MYSQL_HOST || 'localhost';
    const user = process.env.MYSQL_USER || 'root';
    const password = process.env.MYSQL_PASSWORD || '';
    const database = process.env.MYSQL_DATABASE || 'school_manager';
    const port = process.env.MYSQL_PORT ? Number(process.env.MYSQL_PORT) : 3306;

    const config = {
        host,
        user,
        password,
        database,
        port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    };

    const isLocal = process.env.NODE_ENV !== 'production';

    // Add SSL if MYSQL_SSL_CA is set (for Aiven/Vercel)
    if (process.env.MYSQL_SSL_CA) {
        config.ssl = {
            ca: process.env.MYSQL_SSL_CA,
            rejectUnauthorized: !isLocal ? true : false, // disables only for local
        };
    }

    try {
        pool = mysql.createPool(config);
        await pool.query('SELECT 1');
        return pool;
    } catch (err) {
        if (err && (err.code === 'ER_BAD_DB_ERROR' || String(err).includes('ER_BAD_DB_ERROR'))) {
            const tempConfig = { ...config };
            delete tempConfig.database;
            const temp = await mysql.createConnection(tempConfig);
            await temp.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
            await temp.end();
            pool = mysql.createPool(config);
            return pool;
        }
        throw err;
    }
}

function getPool() {
    if (!pool) {
        // Lazily initialize; caller using query() will await it via ensureDatabaseAndPool
    }
    return pool;
}

async function query(sql, params) {
    if (!pool) {
        await ensureDatabaseAndPool();
    }
    const [rows] = await pool.execute(sql, params);
    return rows;
}

module.exports = { getPool, query };


