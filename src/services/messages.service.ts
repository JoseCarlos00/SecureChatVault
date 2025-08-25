import { MessageModel } from '../models/message.models';
import mongoose from 'mongoose';

interface GetMessagesOptions {
	limit?: number;
	beforeId?: string;
	startDate?: string;
	endDate?: string;
}

export const getMessagesFromDB = async (options: GetMessagesOptions) => {
	const { limit = 20, beforeId, startDate, endDate } = options;

	const query: Record<string, any> = {};

	// Query para el conteo total, sin filtros de pagination
	const countQuery: Record<string, any> = {};

	if (startDate || endDate) {
		query.timestamp = {};
		countQuery.timestamp = {};
		if (startDate) {
			query.timestamp.$gte = new Date(startDate);
			countQuery.timestamp.$gte = new Date(startDate);
		}
		if (endDate) {
			const end = new Date(endDate);
			end.setDate(end.getDate() + 1);
			query.timestamp.$lt = end;
			countQuery.timestamp.$lt = end;
		}
	}

	// Si hay un beforeId, traer solo los mensajes más antiguos
	if (beforeId) {
		query._id = { $lt: new mongoose.Types.ObjectId(beforeId) };
	}

	const total = await MessageModel.countDocuments(countQuery);

	const messages = await MessageModel.find(query)
		.sort({ _id: -1 }) // más recientes primero
		.limit(limit)
		.populate('replyTo')
		.exec();

	return { messages: messages.reverse(), total };
};

export const updateReactionFromDB = async (id: string, reactionEmoji: string) => {
	return MessageModel.findByIdAndUpdate(id, { reactionEmoji }, { new: true });
};

export const updateReplyToFromDB = async (id: string, replyTo: string) => {
	return MessageModel.findByIdAndUpdate(id, { replyTo }, { new: true });
};
