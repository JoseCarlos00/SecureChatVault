import fs from 'node:fs';
import path from 'node:path';
import { Message } from '../types/message';

// Interfaz para la pagination y filtrado
interface GetMessagesOptions {
	limit?: number;
	offset?: number;
	startDate?: string;
	endDate?: string;
}

const messagesFilePath = path.resolve(process.cwd(), 'src', 'models', 'messages.json');
let messagesData: Message[] = [];

// Esta función se encarga de cargar los mensajes
export const loadMessages = () => {
	try {
		const data = fs.readFileSync(messagesFilePath, 'utf8');
		const parsedData = JSON.parse(data) as Message[];
		// Asegurarse de que los mensajes estén ordenados por fecha ascendente
		messagesData = parsedData.sort(
			(a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
		);
		console.log('Mensajes cargados y ordenados:', messagesData.length);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			console.log('Archivo messages.json no encontrado. Se iniciará con un array vacío.');
			messagesData = [];
		} else {
			console.error('Error al leer o parsear messages.json:', err);
			messagesData = [];
		}
	}
};

// Llama a la función de carga al iniciar el servicio
loadMessages();

export const getMessagesFromFile = (options: GetMessagesOptions) => {
	const { limit = 20, offset = 0, startDate, endDate } = options;

	// Invertimos una copia del array para que los más recientes estén primero.
	let filteredMessages = [...messagesData].reverse();

	if (startDate || endDate) {
		const start = startDate ? new Date(startDate) : null;
		const end = endDate ? new Date(endDate) : null;

		filteredMessages = filteredMessages.filter((message) => {
			const messageDate = new Date(message.timestamp);
			const isAfterStart = start ? messageDate >= start : true;
			const isBeforeEnd = end ? messageDate <= end : true;
			return isAfterStart && isBeforeEnd;
		});
	}

	const total = filteredMessages.length;
	const paginatedMessages = filteredMessages.slice(offset, offset + limit);

	return { messages: paginatedMessages, total };
};
