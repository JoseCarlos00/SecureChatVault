import { Router } from 'express';
import multer from 'multer';
import { processUploads } from '../controllers/upload.controller';

const router = Router();

// Configura multer para almacenar archivos en memoria.
// Esto es crucial para poder procesar los buffers de los archivos
// antes de subirlos a un servicio en la nube como Cloudinary o S3.
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Define una sola ruta POST que acepta múltiples campos de archivo.
// 'chatfile': el archivo .txt de la conversación (solo 1)
// 'mediafiles': el array de archivos multimedia (hasta 50 en este ejemplo)
router.post(
	'/',
	upload.fields([
		{ name: 'chatfile', maxCount: 1 },
		{ name: 'mediafiles', maxCount: 50 },
	]),
	processUploads
);

export default router;
