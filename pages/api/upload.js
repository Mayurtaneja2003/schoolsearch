import nextConnect from "next-connect";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer setup for file upload
const upload = multer({ storage: multer.memoryStorage() });

const apiRoute = nextConnect();

apiRoute.use(upload.single("file"));

apiRoute.post(async (req, res) => {
  try {
    const fileStr = req.file.buffer.toString("base64");
    const uploadResponse = await cloudinary.uploader.upload(
      `data:${req.file.mimetype};base64,${fileStr}`,
      { folder: "schoolImages" }
    );
    res.status(200).json({ url: uploadResponse.secure_url });
  } catch (error) {
    res.status(500).json({ error: "Image upload failed", details: error.message });
  }
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false,
  },
};