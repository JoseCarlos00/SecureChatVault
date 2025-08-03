import { Request, Response } from 'express';
import { loadMessagesFromFile } from '../services/messages.service';

export const findMessages = (_req: Request, res: Response) => {
	try {
		const messages = loadMessagesFromFile();
		res.status(200).json(messages);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching messages', error });
	}
};
