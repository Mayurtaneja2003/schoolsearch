
import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import db from '@/lib/db';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
	api: {
		bodyParser: false,
	},
};

function parseForm(req) {
	return new Promise((resolve, reject) => {
		const uploadDir = path.join(process.cwd(), 'public', 'schoolImages');
		try {
			if (!fs.existsSync(uploadDir)) {
				fs.mkdirSync(uploadDir, { recursive: true });
			}
		} catch (e) {
			return reject(new Error('Cannot prepare upload directory'));
		}
		const form = new IncomingForm({
			uploadDir,
			keepExtensions: true,
			multiples: false,
		});
		form.parse(req, (err, fields, files) => {
			if (err) return reject(err);
			resolve({ fields, files });
		});
	});
}

export default async function handler(req, res) {
	if (req.method === 'GET') {
		try {
			// Prevent client/proxy caching so new rows show immediately
			res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
			res.setHeader('Pragma', 'no-cache');
			res.setHeader('Expires', '0');
			const rows = await db.query(
				'SELECT id, name, address, city, state, contact, email, imagePath FROM schools ORDER BY id DESC'
			);
			return res.status(200).json({ success: true, data: rows });
		} catch (error) {
			return res.status(500).json({ success: false, message: 'DB error', error: String(error) });
		}
	}

	if (req.method === 'POST') {
		try {
			const { fields, files } = await parseForm(req);
			const name = String(fields.name || '').trim();
			const address = String(fields.address || '').trim();
			const city = String(fields.city || '').trim();
			const state = String(fields.state || '').trim();
			const contact = String(fields.contact || '').trim();
			const email = String(fields.email || '').trim();

			if (!name || !address || !city || !state || !contact || !email) {
				return res.status(400).json({ success: false, message: 'All fields are required.' });
			}
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			const contactRegex = /^\d{10}$/;
			if (!emailRegex.test(email)) {
				return res.status(400).json({ success: false, message: 'Invalid email format.' });
			}
			if (!contactRegex.test(contact)) {
				return res.status(400).json({ success: false, message: 'Contact must be 10 digits.' });
			}


			let imagePath = null;
			const imageFile = files?.image;
			if (imageFile) {
				const fileObj = Array.isArray(imageFile) ? imageFile[0] : imageFile;
				// Read file buffer
				const fileBuffer = fs.readFileSync(fileObj.filepath || fileObj.path);
				const fileStr = fileBuffer.toString('base64');
				const mimetype = fileObj.mimetype || 'image/jpeg';
				try {
					const uploadResponse = await cloudinary.uploader.upload(
						`data:${mimetype};base64,${fileStr}`,
						{ folder: 'schoolImages' }
					);
					imagePath = uploadResponse.secure_url;
				} catch (err) {
					// fallback: no imagePath
					imagePath = null;
				}
			}

			try {
				const result = await db.query(
					'INSERT INTO schools (name, address, city, state, contact, email, imagePath) VALUES (?, ?, ?, ?, ?, ?, ?)',
					[name, address, city, state, contact, email, imagePath]
				);
				return res.status(201).json({ success: true, id: result.insertId });
			} catch (dbErr) {
				// If table is missing, create it and retry once
				const code = dbErr?.code || '';
				if (code === 'ER_NO_SUCH_TABLE' || String(dbErr).includes('ER_NO_SUCH_TABLE')) {
					await db.query(`CREATE TABLE IF NOT EXISTS schools (
						id INT AUTO_INCREMENT PRIMARY KEY,
						name VARCHAR(255) NOT NULL,
						address VARCHAR(255) NOT NULL,
						city VARCHAR(100) NOT NULL,
						state VARCHAR(100) NOT NULL,
						contact VARCHAR(20) NOT NULL,
						email VARCHAR(255) NOT NULL,
						imagePath VARCHAR(500) NULL,
						createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
					)`);
					const result2 = await db.query(
						'INSERT INTO schools (name, address, city, state, contact, email, imagePath) VALUES (?, ?, ?, ?, ?, ?, ?)',
						[name, address, city, state, contact, email, imagePath]
					);
					return res.status(201).json({ success: true, id: result2.insertId });
				}
				return res.status(500).json({ success: false, message: 'Failed to create school', error: String(dbErr), code });
			}
		} catch (error) {
			return res.status(500).json({ success: false, message: 'Failed to parse form', error: String(error) });
		}
	}

	res.setHeader('Allow', ['GET', 'POST']);
	return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
}


