import fs from 'node:fs';

const messagesFilePath = 'src/models/messages.json';
let messagesData: any[] = [];

// Interfaz para la función del servicio
interface GetMessagesOptions {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
}

try {
	const data = fs.readFileSync(messagesFilePath, 'utf8');
	
	messagesData = JSON.parse(data);
	console.log('Mensajes cargados:', messagesData.length);
} catch (err) {
	console.error('Error al leer messages.json:', err);
	messagesData = [];
}


export const getMessagesFromFile = (options: GetMessagesOptions) => {
  const { limit = 20, offset = 0, startDate, endDate } = options;

  let filteredMessages = messagesData;

  // 1. Aplicar los filtros de fecha si se proporcionan
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    filteredMessages = filteredMessages.filter(message => {
      const messageDate = new Date(message.timestamp);
      const isAfterStart = start ? messageDate >= start : true;
      const isBeforeEnd = end ? messageDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
  }

  // 2. Obtener el número total de mensajes después de filtrar
  const total = filteredMessages.length;
  
  // 3. Aplicar la pagination
  const paginatedMessages = filteredMessages.slice(offset, offset + limit);

  return { messages: paginatedMessages, total };
};
