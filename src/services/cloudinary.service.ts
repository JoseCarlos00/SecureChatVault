import { v2 as cloudinary, UploadApiOptions } from "cloudinary";
import path from 'path';

cloudinary.config({
	secure: true,
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface ResponseApi {
	url: string;
	filename: string;
}

export async function uploadToCloudService(file: Express.Multer.File | null): Promise<ResponseApi | null> {
	try {
		console.log('Uploading file to cloud service:', file?.originalname);

		if (!file) return null;

		// Obtener el public_id a partir del nombre original sin la extensión
		const originalFileName = path.parse(file.originalname).name;

		const options: UploadApiOptions = {
			folder: 'CANDRA',
			public_id: originalFileName,
			type: 'private',
			overwrite: false,
			unique_filename: false,
		};

		const response: ResponseApi = await new Promise((resolve, reject) => {
			const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
				if (error) reject(error);

				resolve({
					url: result?.secure_url!,
					filename: result?.display_name!,
				});
			});
			stream.end(file.buffer);
		});

		console.log('Cloudinary:', response);

		return response;
	} catch (error) {
    return null
  }
}
