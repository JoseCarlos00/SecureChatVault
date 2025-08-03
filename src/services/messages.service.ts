import fs from 'node:fs';

const messagesFilePath = 'src/models/messages.json';

interface Message {
	id: string;
	text: string;
	timestamp: string;
	sender: string;
}

let messagesData: Message[] = [];

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
	// 2. Ordena los mensajes por fecha descendente (más nuevos primero) justo después de cargarlos.
	// Esta es la clave para un chat: el orden debe ser predecible.
	messagesData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	console.log('Mensajes cargados y ordenados:', messagesData.length);
} catch (err) {
	console.error('Error al leer o parsear messages.json:', err);
	messagesData = [];
}


export const getMessagesFromFile = (options: GetMessagesOptions) => {
  const { limit = 20, offset = 0, startDate, endDate } = options;

  let filteredMessages = messagesData;

  // Aplicar los filtros de fecha si se proporcionan.
  // La lista de mensajes ya está ordenada cronológicamente.
  if (startDate || endDate) {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null; // Se crea la fecha final

    // 3. Ajuste para asegurar que el filtro `endDate` incluya todo el día.
    if (end) end.setHours(23, 59, 59, 999);

    filteredMessages = filteredMessages.filter(message => {
      const messageDate = new Date(message.timestamp);
      const isAfterStart = start ? messageDate >= start : true; // La lógica de filtro es correcta
      const isBeforeEnd = end ? messageDate <= end : true;
      return isAfterStart && isBeforeEnd;
    });
  }

  // 2. Obtener el número total de mensajes después de filtrar
  const total = filteredMessages.length;
  
  // 3. Aplicar la paginación sobre la lista ya filtrada y ordenada
  const paginatedMessages = filteredMessages.slice(offset, offset + limit);

  return { messages: paginatedMessages, total };
};
