import { Request, Response } from 'express';

import { parseWhatsAppChat } from '../services/parser.service';
import { uploadToCloudService } from '../services/localStorage.service';

import { MessageModel } from '../models/message.models';


import fs from 'fs/promises';
import path from 'path';

const textFilePath = path.resolve(process.cwd(), 'src', 'models', 'test.txt');



export const uploadAndParseChat = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded. Please upload a .txt file.' });
		}

		// El nombre de usuario para identificar los mensajes de 'me'.
		// Se puede enviar en el cuerpo de la solicitud o usar un valor fijo.
		const myUserName = 'Jose Carlos'; // <-- IMPORTANTE: Cambia esto a tu nombre de usuario de WhatsApp

		const chatContent = req.file.buffer.toString('utf-8');
		const parsedMessages = parseWhatsAppChat(chatContent, myUserName);

		if (parsedMessages.length === 0) {
			return res.status(400).json({ message: 'Could not parse any messages from the file. Check the format.' });
		}

		// 1. Borra todos los mensajes anteriores para evitar duplicados.
		await MessageModel.deleteMany({});

		// 2. Inserta los nuevos mensajes parseados en la base de datos.
		await MessageModel.insertMany(parsedMessages);

		res.status(200).json({
			message: `Successfully parsed and saved ${parsedMessages.length} messages.`,
		});
	} catch (error) {
		console.error('Error processing chat file:', error);
		res.status(500).json({ message: 'Error processing chat file', error: (error as Error).message });
	}
};

const uploadAndParseChat2 = async (chatContent: string) => {
	try {
		// El nombre de usuario para identificar los mensajes de 'me'.
		// Se puede enviar en el cuerpo de la solicitud o usar un valor fijo.
		const myUserName = 'Jose Carlos'; // <-- IMPORTANTE: Cambia esto a tu nombre de usuario de WhatsApp

		const parsedMessages = parseWhatsAppChat(chatContent, myUserName);
		console.log({ parsedMessages });

		if (parsedMessages.length === 0) {
			console.log({ message: 'Could not parse any messages from the file. Check the format.' });
			return;
		}

		// 1. Borra todos los mensajes anteriores para evitar duplicados.
		await MessageModel.deleteMany({});

		// 2. Inserta los nuevos mensajes parseados en la base de datos.
		await MessageModel.insertMany(parsedMessages);

		// Sobrescribe el archivo messages.json existente.
		// await fs.writeFile(messagesFilePath, JSON.stringify(parsedMessages, null, 2), 'utf-8');

		// Recarga los mensajes en memoria en el servicio de mensajes.
		// loadMessages();
		console.log(`Successfully parsed and saved ${parsedMessages.length} messages.`);
	} catch (error) {
		console.error('Error processing chat file:', error);
	}
};

const getFileContent = async (filePath: string): Promise<string> => {
	try {
		const content = await fs.readFile(filePath, 'utf-8');
		return content;
	} catch (error) {
		console.error(`Error reading file ${filePath}:`, error);
		throw new Error(`Could not read file: ${filePath}`);
	}
};

 const testParseChat = async () => {
	try {
		const chatContent = await getFileContent(textFilePath);
		await uploadAndParseChat2(chatContent);
	} catch (error) {
		console.error('Error in testParseChat:', error);
	}
};

// testParseChat().then().catch((error) => {
// 	console.error('Error in testParseChat execution:', error);
// });


/**
 * Handles the upload of a single media file.
 * Saves the file locally and returns its URL and original filename.
 */
export const uploadMediaFile = (req: Request, res: Response) => {
	try {
		const file = req.file;
		if (!file) {
			return res.status(400).json({ message: 'No file uploaded.' });
		}

		// The file is saved to disk by multer's diskStorage.
		// Now, we get a URL for it using our service.
		const fileUrl = getUrl(file);

		// When you integrate Cloudinary/S3, this is where you would
		// upload the file (e.g., from file.path) and get the cloud URL.

		// We return the URL and the original filename. The frontend will use
		// the filename to match it with the message in the .txt file.
		res.status(200).json({
			message: 'File uploaded successfully',
			url: fileUrl,
			filename: file.originalname,
		});
	} catch (error) {
		console.error('Error uploading media file:', error);
		res.status(500).json({ message: 'Error uploading file.' });
	}
};

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

interface MediaURl {
	filename: string;
	url: string;
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
