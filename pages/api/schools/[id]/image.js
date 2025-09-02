import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';
import db from '@/lib/db';

export const config = {
	api: {
		bodyParser: false,
	},
};

function parseForm(req) {
	return new Promise((resolve, reject) => {
		const uploadDir = path.join(process.cwd(), 'public', 'schoolImages');
		try {
			if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
		} catch (e) {
			return reject(new Error('Cannot prepare upload directory'));
		}
		const form = new IncomingForm({ uploadDir, keepExtensions: true, multiples: false });
		form.parse(req, (err, fields, files) => {
			if (err) return reject(err);
			resolve({ fields, files });
		});
	});
}

export default async function handler(req, res) {
	const { id } = req.query;
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
	}
	try {
		const { files } = await parseForm(req);
		const imageFile = files?.image;
		if (!imageFile) return res.status(400).json({ success: false, message: 'Image file is required' });
		const fileObj = Array.isArray(imageFile) ? imageFile[0] : imageFile;
		const relative = path.join('schoolImages', path.basename(fileObj.filepath || fileObj.path || fileObj.newFilename || fileObj.originalFilename));
		const imagePath = `/${relative.replace(/\\/g, '/')}`;
		await db.query('UPDATE schools SET imagePath = ? WHERE id = ?', [imagePath, id]);
		return res.status(200).json({ success: true, imagePath });
	} catch (error) {
		return res.status(500).json({ success: false, message: 'Failed to update image', error: String(error) });
	}
}


