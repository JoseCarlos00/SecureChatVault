import type { Message, TextMessage, MediaMessage } from '../types/message';

// Expresión regular mejorada para manejar el espacio después de la hora
const messageRegex = /^(\d{1,2}\/\d{1,2}\/\d{2,4}),\s(\d{1,2}:\d{2})\s?(am|pm)\s?-\s(.*?):\s(.*)/;

interface MediaURl {
	filename: string;
	url: string;
}

interface ParseWhatsAppChatOptions {
	myUserName: string;
	chatContent: string;
	mediaUrls: MediaURl[];
}



export const parseWhatsAppChat = ({ chatContent, myUserName, mediaUrls }: ParseWhatsAppChatOptions): Message[] => {
	console.log('Parsing WhatsApp chat content...');
	console.log(`Chat content length: ${chatContent.length} characters`);

	try {
		const lines = chatContent.split('\n');
		const messages: Message[] = [];
		let currentMessage: Message | null = null;

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

				const timestamp = new Date(combinedDateTimeStr);
				const senderName = sender.trim();

				// Crea el objeto Message
				currentMessage = createMessageObject(senderName, timestamp, content, myUserName, mediaUrls);
			} else if (currentMessage && line.trim() !== '') {
				// Lógica para manejar líneas que continúan el mensaje anterior
				// Agrega la línea al mensaje actual, ya sea como content o como caption
				if (currentMessage.type === 'text') {
					(currentMessage as TextMessage).content += `\n${line.trim().replace('<This message was edited>', '')}`;
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
	sender: string,
	timestamp: Date,
	content: string,
	myUserName: string,
	mediaUrls: MediaURl[]
): Message => {
	const commonProps = {
		sender: sender.toLowerCase() === myUserName.toLowerCase() ? ('me' as const) : ('other' as const),
		timestamp: timestamp,
	};

	const messageType = getMessageType(content);

	if (messageType === 'text') {
		let cleanContent = content
			.replace('<This message was edited>', '')
			.trim();

		// Si es un archivo adjunto, vacía el contenido
		if (cleanContent.endsWith('(file attached)')) {
			cleanContent = '';
		}

		return {
			...commonProps,
			type: 'text',
			content: cleanContent,
		} as TextMessage;
	} else {
		const filename = content.split(' ').slice(0, -2).join(' ');

		// Busca en el array `mediaUrls` para encontrar la URL que coincide
		const mediaUrlObject = mediaUrls.find((m) => m.filename.includes(filename));
		
		// Define la URL de tu imagen de reemplazo.
    // Asegúrate de que esta imagen esté accesible desde tu servidor.
    const placeholderUrl = 'https://localhost:3000/uploads/imagen-rota.webp';
		
    // Asigna la URL de la imagen de reemplazo si no se encuentra la URL real.
    const mediaUrl = mediaUrlObject ? mediaUrlObject.url : placeholderUrl;

		// console.log({ mediaUrl, placeholderUrl, filename });
		
		// const mediaUrl = mediaUrlObject ? mediaUrlObject.url : '';

		return {
			...commonProps,
			type: messageType as 'image' | 'audio' | 'video' | 'sticker',
			mediaUrl: mediaUrl,
			caption: content.replace(filename, '').replace('(file attached)', '').trim() || undefined,
			// Aquí se podría añadir lógica para duration y thumbnailUrl si se puede extraer
		} as MediaMessage;
	}
};
