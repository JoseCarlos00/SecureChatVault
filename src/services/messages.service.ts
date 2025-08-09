import { MessageModel } from '../models/message.models';

// Interfaz para la pagination y filtrado
interface GetMessagesOptions {
	limit?: number;
	offset?: number;
	startDate?: string;
	endDate?: string;
}

export const getMessagesFromDB = async (options: GetMessagesOptions) => {
	const { limit = 20, offset = 0, startDate, endDate } = options;

	// 1. Construir el objeto de consulta para el filtro de fechas
	const query: Record<string, any> = {};

	if (startDate || endDate) {
		query.timestamp = {};
		if (startDate) {
			query.timestamp.$gte = new Date(startDate);
		}
		if (endDate) {
			// Agregamos un día para incluir todo el día de endDate
			const end = new Date(endDate);
			end.setDate(end.getDate() + 1);
			query.timestamp.$lt = end;
		}
	}

	// 2. Obtener el total de documentos que coinciden con el filtro
	const total = await MessageModel.countDocuments(query);

	// 3. Obtener los mensajes paginados y ordenados
	const messages = await MessageModel.find(query)
		.sort({ _id: -1 })
		.skip(offset)
		.limit(limit)
		.exec();

	// Invertimos el array aquí. La consulta obtiene el bloque correcto (p. ej., los 30 más recientes),
	// y .reverse() los ordena de más antiguo a más nuevo dentro de ese bloque.
	// Esto simplifica enormemente la lógica del frontend.
	return { messages: messages.reverse(), total };
};
