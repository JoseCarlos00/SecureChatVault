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
			// Incluye desde el inicio del día de startDate (00:00:00 UTC)
			const start = new Date(startDate);
			start.setUTCHours(0, 0, 0, 0);
			baseQuery.timestamp.$gte = start;
		}
		if (endDate) {
			// Incluye hasta el final del día de endDate (23:59:59 UTC)
			const end = new Date(endDate);
			end.setUTCHours(23, 59, 59, 999);
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
