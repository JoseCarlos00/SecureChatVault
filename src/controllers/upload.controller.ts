import { Request, Response } from 'express';

import { parseWhatsAppChat } from '../services/parser.service';
import { type Message } from '../types/message'; // Asumiendo que tienes un tipo para los mensajes
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

async function saveMessages2(parsedMessages: Message[]) {
	if (!Array.isArray(parsedMessages) || parsedMessages.length === 0) {
		throw new Error('No messages to save.');
	}

	// Usamos una transacción para asegurar la atomicidad de la operación.
	// O ambas operaciones (delete e insert) tienen éxito, o ninguna lo tiene.
	const session = await MessageModel.db.startSession();
	session.startTransaction();
	try {
		// 1. Borra todos los mensajes anteriores dentro de la transacción.
		await MessageModel.deleteMany({}, { session });

		// 2. Inserta los nuevos mensajes parseados en la base de datos dentro de la transacción.
		await MessageModel.insertMany(parsedMessages, { session });

		// Si todo fue bien, confirma la transacción.
		await session.commitTransaction();
	} catch (error) {
		// Si algo falla, revierte todos los cambios hechos en la transacción.
		await session.abortTransaction();
		console.error('Transaction aborted due to an error:', error);
		// Relanzamos el error para que sea capturado por el catch del controlador.
		throw new Error('Failed to save messages to the database.');
	} finally {
		// Siempre cierra la sesión al finalizar.
		session.endSession();
	}
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

		const { myUserName } = req.body;

		// Es mejor validar explícitamente los campos requeridos.
		if (!myUserName) {
			return res.status(400).json({ message: 'El campo "myUserName" es requerido en el cuerpo de la solicitud.' });
		}

		const chatFile = files.chatfile[0];
		const mediaFiles = files.mediafiles || [];

		// --- PASO 1: Subir archivos multimedia de forma robusta ---
		// Usamos Promise.allSettled para esperar a que todas las subidas terminen,
		// incluso si algunas fallan. Esto evita que un archivo corrupto detenga todo el proceso.
		const uploadPromises = mediaFiles.map(file => uploadToCloudService(file));
		const settledResults = await Promise.allSettled(uploadPromises);

		const mediaUrls: MediaURl[] = [];
		settledResults.forEach((result, index) => {
			if (result.status === 'fulfilled' && result.value) {
				mediaUrls.push(result.value);
			} else {
				// Registramos tanto promesas rechazadas como las que resolvieron a null/undefined.
				const reason = result.status === 'rejected' ? result.reason : 'upload returned null';
				console.error(`Error uploading file: ${mediaFiles[index].originalname}. Reason:`, reason);
			}
		});

		// --- PASO 2: Procesar el archivo .txt con las URLs ---
		const chatContent = chatFile.buffer.toString('utf-8');
		
		// Tu parser debe aceptar ahora un array de URLs para asociar
		const parsedMessages: Message[] = parseWhatsAppChat({ chatContent, myUserName, mediaUrls });

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
