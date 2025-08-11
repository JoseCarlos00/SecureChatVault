import { Request, Response } from 'express';
import { getMessagesFromDB } from '../services/messages.service';

export const findMessages = async (req: Request, res: Response) => {
	try {
		// 1. Obtener los query parameters de la URL y convertirlos a números
		const limit = parseInt(req.query.limit as string) || 30; // Default a 20 mensajes
		const beforeId = req.query.offset as string; 
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
