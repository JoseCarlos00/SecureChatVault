import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	secure: true,
});

export async function uploadToCloudService(file: Express.Multer.File | null): Promise<string | null> {
	console.log('Uploading file to cloud service:', file?.originalname);

	if (!file) return null;
	// This URL assumes you have a static file server setup in Express
	// serving the 'uploads' directory. e.g., app.use('/uploads', express.static('uploads'));
	const url = `https://localhost:3000/uploads/${file.originalname}`;
	return url;
}
