import { Request, Response } from 'express';

import { parseWhatsAppChat } from '../services/parser.service';
import { uploadToCloudService } from '../services/cloudinary.service';

import { MessageModel } from '../models/message.models';

interface MediaURl {
	filename: string;
	url: string;
}

async function saveMessages(parsedMessages: any[]) {
	// Asegúrate de que parsedMessages es un array de mensajes válidos.
	if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
		throw new Error('No messages to save.');
	}

	// 1. Borra todos los mensajes anteriores para evitar duplicados.
	await MessageModel.deleteMany({});

	// 2. Inserta los nuevos mensajes parseados en la base de datos.
	await MessageModel.insertMany(parsedMessages);
}


export const processUploads = async (req: Request, res: Response) => {
	try {
		const files = req.files as {
			[fieldname: string]: Express.Multer.File[];
		};

		// Asegúrate de que se envió el archivo .txt
		if (!files.chatfile || files.chatfile.length === 0) {
			return res.status(400).json({ message: 'No se encontró el archivo de chat (.txt).' });
		}

		const chatFile = files.chatfile[0];
		const mediaFiles = files.mediafiles || [];

		// --- PASO 1: Subir archivos multimedia y obtener URLs ---
		// Este array almacenará las URLs de los archivos multimedia
		const mediaUrls:MediaURl[] = [];

		// Deberás implementar la lógica para subir cada archivo y obtener su URL
		// Por ahora, usamos un marcador de posición
		for (const file of mediaFiles) {
			const url = await uploadToCloudService(file);
			if (url) {
				mediaUrls.push({ filename: file.originalname, url });
			} else {
				console.error(`Error uploading file: ${file.originalname}`);
			}
		}

		// --- PASO 2: Procesar el archivo .txt con las URLs ---
		const chatContent = chatFile.buffer.toString('utf-8');
		const myUserName = req.body.myUserName || 'Jose Carlos';

		// Tu parser debe aceptar ahora un array de URLs para asociar
		const parsedMessages = parseWhatsAppChat({chatContent, myUserName, mediaUrls});

		// --- PASO 3: Guardar en la base de datos ---
		await saveMessages(parsedMessages);

		res.status(200).json({
			message: `Conversación y ${mediaFiles.length} archivos multimedia procesados y guardados con éxito.`,
		});
	} catch (error) {
		console.error('Error al procesar la subida:', error);
		res.status(500).json({ message: 'Error interno del servidor.' });
	}
};
