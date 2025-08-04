import { Request, Response } from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { parseWhatsAppChat } from '../services/parser.service';
import { loadMessages } from '../services/messages.service';

const messagesFilePath = path.resolve(process.cwd(), 'src', 'models', 'messages.json');

export const uploadAndParseChat = async (req: Request, res: Response) => {
	try {
		if (!req.file) {
			return res.status(400).json({ message: 'No file uploaded. Please upload a .txt file.' });
		}

		// El nombre de usuario para identificar los mensajes de 'me'.
		// Se puede enviar en el cuerpo de la solicitud o usar un valor fijo.
		const myUserName = req.body.myUserName || 'Carlos'; // <-- IMPORTANTE: Cambia esto a tu nombre de usuario de WhatsApp

		const chatContent = req.file.buffer.toString('utf-8');
		const parsedMessages = parseWhatsAppChat(chatContent, myUserName);

		if (parsedMessages.length === 0) {
			return res.status(400).json({ message: 'Could not parse any messages from the file. Check the format.' });
		}

		// Sobrescribe el archivo messages.json existente.
		await fs.writeFile(messagesFilePath, JSON.stringify(parsedMessages, null, 2), 'utf-8');

		// Recarga los mensajes en memoria en el servicio de mensajes.
		loadMessages();

		res.status(200).json({
			message: `Successfully parsed and saved ${parsedMessages.length} messages.`,
		});
	} catch (error) {
		console.error('Error processing chat file:', error);
		res.status(500).json({ message: 'Error processing chat file', error: (error as Error).message });
	}
};

