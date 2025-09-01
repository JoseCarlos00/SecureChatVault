import { Request, Response } from 'express';
import { getMessagesFromDB, updateReactionFromDB, updateReplyToFromDB } from '../services/messages.service';

export const findMessages = async (req: Request, res: Response) => {
	try {
		// 1. Obtener y validar los query parameters de la URL.
		const { beforeId, startDate, endDate } = req.query as { beforeId?: string; startDate?: string; endDate?: string };

		// Validación más robusta para 'limit'
		let limit = 30;
		
		if (req.query.limit && typeof req.query.limit === 'string') {
			const parsedLimit = parseInt(req.query.limit, 10);
			if (!isNaN(parsedLimit) && parsedLimit > 0) {
				limit = parsedLimit;
			}
		}

		// 2. Llamar al servicio, pasándole los parámetros
		const { messages, total } = await getMessagesFromDB({ limit, beforeId, startDate, endDate });

		res.status(200).json({
			messages,
			total,
			limit,
			beforeId,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error fetching messages', error: (error as Error).message });
	}
};

export const updateReaction = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { reactionEmoji } = req.body;

		const updatedMessage = await updateReactionFromDB(id, reactionEmoji)

		if (!updatedMessage) {
			return res.status(404).json({ message: 'Mensaje no encontrado' });
		}

		res.status(200).json(updatedMessage);
	} catch (error) {
		console.error('Error al actualizar la reacción:', error);
		res.status(500).json({ message: 'Error interno del servidor' });
	}
};

export const updateReplyTo = async (req: Request, res: Response) => {
	try {
		const { id } = req.params;
		const { replyTo } = req.body;

		const updatedMessage = await updateReplyToFromDB(id, replyTo)

		if (!updatedMessage) {
			return res.status(404).json({ message: 'Mensaje no encontrado' });
		}

		res.status(200).json(updatedMessage);
	} catch (error) {
		console.error('Error al actualizar la referencia de respuesta:', error);
		res.status(500).json({ message: 'Error interno del servidor' });
	}
};
