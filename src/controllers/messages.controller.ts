import { Request, Response } from 'express';
import { getMessagesFromDB, updateReactionFromDB, updateReplyToFromDB } from '../services/messages.service';

export const findMessages = async (req: Request, res: Response) => {
	try {
		// 1. Obtener los query parameters de la URL y convertirlos a números
		const limit = parseInt(req.query.limit as string) || 30; // Default a 20 mensajes
		const beforeId = req.query.beforeId as string; 
		const startDate = req.query.startDate as string;
		const endDate = req.query.endDate as string;

		// console.log(req.query);

		// 2. Llamar al servicio, pasándole los parámetros
		const { messages, total } = await getMessagesFromDB({ limit, beforeId, startDate, endDate });

		// 3. Enviar la respuesta con los datos y la metadata de la pagination
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
