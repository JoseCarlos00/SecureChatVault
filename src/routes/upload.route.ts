import { Router } from 'express';
import multer from 'multer';
import { uploadAndParseChat } from '../controllers/upload.controller';

const router = Router();

// Configura multer para almacenar archivos en memoria
const storage = multer.memoryStorage();
const upload = multer({
	storage: storage,
	fileFilter: (req, file, cb) => {
		if (file.mimetype === 'text/plain') {
			cb(null, true);
		} else {
			cb(new Error('Invalid file type. Only .txt files are allowed.'));
		}
	},
});

router.post('/', upload.single('chatfile'), uploadAndParseChat);

export default router;
