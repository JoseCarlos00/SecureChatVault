import fs from 'node:fs';

const messagesFilePath = 'src/models/messages.json';
let messages: any[] = [];

try {
	const data = fs.readFileSync(messagesFilePath, 'utf8');
	
	messages = JSON.parse(data);
	console.log('Mensajes cargados:', messages.length);
} catch (err) {
	console.error('Error al leer messages.json:', err);
	messages = [];
}

console.log('Mensajes iniciales:', messages);

export const getMessages = () => messages;

