import fs from 'node:fs';

const messagesFilePath = 'src/models/messages.json';
let messagesData: any[] = [];

try {
	const data = fs.readFileSync(messagesFilePath, 'utf8');
	
	messagesData = JSON.parse(data);
	console.log('Mensajes cargados:', messagesData.length);
} catch (err) {
	console.error('Error al leer messages.json:', err);
	messagesData = [];
}

console.log('Mensajes iniciales:', messagesData);

// getMessagesFromDB
export const loadMessagesFromFile = () => messagesData;

