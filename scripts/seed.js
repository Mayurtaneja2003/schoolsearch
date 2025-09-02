/*
	Seed DB: creates database/table if missing and inserts a few rows.
*/
const mysql = require('mysql2/promise');

async function main() {
	const host = process.env.MYSQL_HOST || 'localhost';
	const user = process.env.MYSQL_USER || 'root';
	const password = process.env.MYSQL_PASSWORD || '';
	const database = process.env.MYSQL_DATABASE || 'school_manager';

	const conn = await mysql.createConnection({ host, user, password, multipleStatements: true });
	await conn.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
	await conn.changeUser({ database });
	await conn.query(`
		CREATE TABLE IF NOT EXISTS schools (
			id INT AUTO_INCREMENT PRIMARY KEY,
			name VARCHAR(255) NOT NULL,
			address VARCHAR(255) NOT NULL,
			city VARCHAR(100) NOT NULL,
			state VARCHAR(100) NOT NULL,
			contact VARCHAR(20) NOT NULL,
			email VARCHAR(255) NOT NULL,
			imagePath VARCHAR(500) NULL,
			createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		);
	`);

	// Reset table content on every seed run
	await conn.query('TRUNCATE TABLE schools');
	await conn.query(
			`INSERT INTO schools (name, address, city, state, contact, email, imagePath) VALUES
			(?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?), (?,?,?,?,?,?,?)`,
			[
				'Green Valley High', '123 Park Ave', 'Delhi', 'Delhi', '9999999999', 'gvh@example.com', '/schoolImages/Img1.webp',
				'Blue Ridge Public', '45 Lake Road', 'Mumbai', 'Maharashtra', '8888888888', 'brp@example.com', '/schoolImages/Img2.webp',
				'Sunrise Academy', '9 Hill Street', 'Pune', 'Maharashtra', '7777777777', 'sa@example.com', '/schoolImages/Img3.jpg',
				'Silver Oak International', '78 Elm Street', 'Bengaluru', 'Karnataka', '6666666666', 'soi@example.com', '/schoolImages/Img4.jpg',
				'Lotus Valley School', '22 MG Road', 'Gurgaon', 'Haryana', '9555555555', 'lvs@example.com', '/schoolImages/Img5.webp',
				'Heritage Public School', '5 River Lane', 'Chennai', 'Tamil Nadu', '9444444444', 'hps@example.com', '/schoolImages/Img6.webp',
				'Bright Future Academy', '14 Lake View', 'Kolkata', 'West Bengal', '9333333333', 'bfa@example.com', '/schoolImages/Img7.webp',
				'Royal Kids Academy', '9 Palace Road', 'Jaipur', 'Rajasthan', '9222222222', 'rka@example.com', '/schoolImages/Img8.webp',
				'Future Minds School', '3 Tech Park', 'Hyderabad', 'Telangana', '9111111111', 'fms@example.com', '/schoolImages/Img9.webp',
				'National Star School', '17 Freedom Street', 'Lucknow', 'Uttar Pradesh', '9000000000', 'nss@example.com', '/schoolImages/Img10.webp'
			]
		);
	console.log('Inserted sample schools.');

	await conn.end();
	console.log('Seeding complete.');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});


