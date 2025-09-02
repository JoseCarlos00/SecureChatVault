import { MessageModel } from '../models/message.models';
import mongoose from 'mongoose';

interface GetMessagesOptions {
	limit?: number;
	beforeId?: string;
	startDate?: string;
	endDate?: string;
}

export const getMessagesFromDB = async (options: GetMessagesOptions) => {
	const { limit = 30, beforeId, startDate, endDate } = options;

	// 1. Construir la consulta base con los filtros que aplican tanto al conteo como a la búsqueda.
	// Esto evita duplicar la lógica de filtrado y sigue el principio DRY (Don't Repeat Yourself).
	const baseQuery: Record<string, any> = {};

	if (startDate || endDate) {
		baseQuery.timestamp = {};
		if (startDate) {
			// Asegura que la fecha se interprete en la zona horaria local del servidor
			// y no en UTC, para que coincida con la perspectiva del usuario.
			const start = new Date(`${startDate}T00:00:00`);
			baseQuery.timestamp.$gte = start;
		}
		if (endDate) {
			// Se establece el final del día en la zona horaria local.
			const end = new Date(`${endDate}T00:00:00`);
			end.setHours(23, 59, 59, 999);
			baseQuery.timestamp.$lte = end;
		}
	}

	// 2. Obtener el conteo total usando la consulta base.
	const total = await MessageModel.countDocuments(baseQuery);

	// 3. Crear la consulta para los mensajes y añadir filtros de paginación.
	const findQuery = { ...baseQuery };
	if (beforeId) {
		findQuery._id = { $lt: new mongoose.Types.ObjectId(beforeId) };
	}

	// 4. Ejecutar la consulta para obtener los mensajes.
	const messages = await MessageModel.find(findQuery)
		.sort({ _id: -1 }) // más recientes primero
		.limit(limit)
		.populate('replyTo')
		.exec();

	// 5. Devolver los mensajes en orden cronológico y el total.
	return { messages: messages.reverse(), total };
};

export const updateReactionFromDB = async (id: string, reactionEmoji: string) => {
	return MessageModel.findByIdAndUpdate(id, { reactionEmoji }, { new: true });
};

export const updateReplyToFromDB = async (id: string, replyTo: string) => {
	return MessageModel.findByIdAndUpdate(id, { replyTo }, { new: true });
};

export const findFirstMessageOnDateFromDB = async (date: string, contextLimit: number = 20) => {
	// 1. Construir el rango de fechas para la búsqueda.
	// Se interpreta la fecha en la zona horaria local del servidor.
	const startDate = new Date(`${date}T00:00:00`);
	const endDate = new Date(startDate);
	endDate.setHours(23, 59, 59, 999);

	// 2. Encontrar el primer mensaje en la fecha especificada.
	// Usamos .lean() para un mejor rendimiento, ya que solo necesitamos los datos.
	const firstMessage = await MessageModel.findOne({
		timestamp: {
			$gte: startDate,
			$lte: endDate,
		},
	})
		.sort({ timestamp: 1 }) // El más antiguo primero
		.lean()
		.exec();

	// 3. Si no se encuentra ningún mensaje, devolver un resultado vacío.
	if (!firstMessage) {
		return { messages: [], targetMessageId: null };
	}

	const targetMessageId = firstMessage._id;

	// 4. Obtener los mensajes ANTERIORES al mensaje encontrado.
	// Se buscan los `contextLimit` mensajes con un _id menor.
	const messagesBefore = await MessageModel.find({
		_id: { $lt: targetMessageId },
	})
		.sort({ _id: -1 }) // Orden descendente para obtener los más cercanos
		.limit(contextLimit)
		.populate('replyTo')
		.lean() // Usar lean() para consistencia y rendimiento
		.exec();

	// 5. Obtener el mensaje encontrado y los mensajes POSTERIORES.
	// Se buscan el mensaje target y los `contextLimit` mensajes con un _id mayor o igual.
	const messagesAfter = await MessageModel.find({
		_id: { $gte: targetMessageId },
	})
		.sort({ _id: 1 }) // Orden ascendente para obtener los siguientes
		.limit(contextLimit + 1) // +1 para incluir el mensaje target
		.populate('replyTo')
		.lean() // Usar lean() para consistencia y rendimiento
		.exec();

	// 6. Combinar los resultados.
	// `messagesBefore` está en orden inverso (del más nuevo al más antiguo),
	// por lo que se invierte para mantener el orden cronológico.
	const combinedMessages = [...messagesBefore.reverse(), ...messagesAfter];

	// 7. Devolver los mensajes y el ID del mensaje buscado.
	return { messages: combinedMessages, targetMessageId: targetMessageId.toString() };
};
