const mysql = require('mysql2/promise');

let pool;

async function ensureDatabaseAndPool() {
	const host = process.env.MYSQL_HOST || 'localhost';
	const user = process.env.MYSQL_USER || 'root';
	const password = process.env.MYSQL_PASSWORD || '';
	const database = process.env.MYSQL_DATABASE || 'school_manager';

	try {
		pool = mysql.createPool({
			host,
			user,
			password,
			database,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
		});
		// Test a simple query to verify DB exists
		await pool.query('SELECT 1');
		return pool;
	} catch (err) {
		// Unknown database → create it, then recreate pool
		if (err && (err.code === 'ER_BAD_DB_ERROR' || String(err).includes('ER_BAD_DB_ERROR'))) {
			const temp = await mysql.createConnection({ host, user, password });
			await temp.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
			await temp.end();
			// Recreate pool pointing to the database
			pool = mysql.createPool({
				host,
				user,
				password,
				database,
				waitForConnections: true,
				connectionLimit: 10,
				queueLimit: 0,
			});
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


