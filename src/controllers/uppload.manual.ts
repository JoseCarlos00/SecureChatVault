import fs from 'fs/promises';
import path from 'path';
import { MessageModel } from '../models/message.models'
import { parseWhatsAppChat } from '../services/parser.service'

const textFilePath = path.resolve(process.cwd(), 'src', 'models', 'test.txt');


const uploadAndParseChat2 = async (chatContent: string) => {
	try {
		// El nombre de usuario para identificar los mensajes de 'me'.
		// Se puede enviar en el cuerpo de la solicitud o usar un valor fijo.
		const myUserName = 'Jose Carlos'; // <-- IMPORTANTE: Cambia esto a tu nombre de usuario de WhatsApp

		const parsedMessages = parseWhatsAppChat({chatContent, myUserName, mediaUrls: []});
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

testParseChat().then().catch((error) => {
	console.error('Error in testParseChat execution:', error);
});
