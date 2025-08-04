import { Message, TextMessage, MediaMessage } from '../types/message';

// Expresión regular mejorada para manejar el espacio después de la hora
const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s?(am|pm)\s?-\s(.*?):\s(.*)/;

// Esta expresión regular detecta líneas que no comienzan con un nuevo mensaje.
const multilineRegex = /^\s*(?!(\d{1,2}\/\d{1,2}\/\d{2,4}, \d{1,2}:\d{2}\s?(?:am|pm)?\s-\s.*?:\s))/;

export const parseWhatsAppChat = (chatContent: string, myUserName: string): Message[] => {
	console.log('Parsing WhatsApp chat content...');
	console.log(`Chat content length: ${chatContent.length} characters`);

	try {
		const lines = chatContent.split('\n');
		const messages: Message[] = [];
		let currentMessage: Message | null = null;
		const uuid = crypto.randomUUID();

		for (const line of lines) {
			const match = line.match(messageRegex);

			if (match) {
				// Si es el inicio de un nuevo mensaje, guarda el anterior si existe
				if (currentMessage) {
					messages.push(currentMessage);
				}

				// Construye la fecha de manera segura
				const [_fullMatch, date, time, ampm, sender, content] = match;

				// Asegúrate de que la fecha y hora estén en un formato válido
				const combinedDateTimeStr = `${date} ${time} ${ampm || ''}`.trim();

				if (combinedDateTimeStr === '') {
					console.error('Invalid date or time format:', line);
					continue; // Skip this line if the date/time is invalid
				}

				const timestamp = new Date(combinedDateTimeStr).toISOString();

				const senderName = sender.trim();

				// Crea el objeto Message
				currentMessage = createMessageObject(uuid, senderName, timestamp, content, myUserName);

			} else if (currentMessage && line.trim() !== '') {
				// Lógica para manejar líneas que continúan el mensaje anterior
				// Agrega la línea al mensaje actual, ya sea como content o como caption
				if (currentMessage.type === 'text') {
					(currentMessage as TextMessage).content += `\n${line.trim()}`;
				} else if (currentMessage.caption) {
					(currentMessage as MediaMessage).caption += `\n${line.trim()}`;
				} else {
					(currentMessage as MediaMessage).caption = line.trim();
				}
			}
		}

		// Asegúrate de agregar el último mensaje
		if (currentMessage) {
			messages.push(currentMessage);
		}

		// Aquí puedes implementar la lógica para manejar las respuestas (replyTo) si es necesario.
		// Por ahora, el parser no lo detecta en el formato .txt estándar.

		return messages;
	} catch (error) {
		console.error('Error parsing WhatsApp chat:', error);
		return [];
	}
};

// Función para determinar el tipo de mensaje basado en su contenido
const getMessageType = (content: string) => {
	if (content.toLowerCase().endsWith('(file attached)')) {
		const filename = content.split(' ').slice(0, -2).join(' ').toLowerCase();
		if (filename.endsWith('.webp')) return 'sticker';
		if (filename.endsWith('.opus') || filename.endsWith('.mp3')) return 'audio';
		if (filename.endsWith('.jpg') || filename.endsWith('.jpeg') || filename.endsWith('.png')) return 'image';
		if (filename.endsWith('.mp4') || filename.endsWith('.mov')) return 'video';
	}
	return 'text';
};

// Función que crea el objeto mensaje con el tipo correcto
const createMessageObject = (
	id: string,
	sender: string,
	timestamp: string,
	content: string,
	myUserName: string
): Message => {
	const commonProps = {
		_id: id,
		sender: sender.toLowerCase() === myUserName.toLowerCase() ? 'me' : 'other',
		timestamp: timestamp,
	};

	const messageType = getMessageType(content);

	if (messageType === 'text') {
		// Elimina el sufijo "(file attached)" si existe
		const cleanContent = content.endsWith('(file attached)') ? '' : content;
		return {
			...commonProps,
			type: 'text',
			content: cleanContent,
		} as TextMessage;
	} else {
		const filename = content.split(' ').slice(0, -2).join(' ');
		return {
			...commonProps,
			type: messageType as 'image' | 'audio' | 'video' | 'sticker',
			mediaUrl: `uploads/${filename}`, // Usamos un placeholder temporal
			caption: content.replace(filename, '').replace('(file attached)', '').trim() || undefined,
			// Aquí se podría añadir lógica para duration y thumbnailUrl si se puede extraer
		} as MediaMessage;
	}
};
