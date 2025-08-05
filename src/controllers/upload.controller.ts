import { Request, Response } from 'express';
import { parseWhatsAppChat } from '../services/parser.service';
import { MessageModel } from '../models/message.models';

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
			return
		}

		// Sobrescribe el archivo messages.json existente.
		await fs.writeFile(messagesFilePath, JSON.stringify(parsedMessages, null, 2), 'utf-8');

		// Recarga los mensajes en memoria en el servicio de mensajes.
		loadMessages();

		
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

