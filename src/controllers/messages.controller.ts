import { Request, Response } from 'express';
import { getMessages } from '../services/messages.service';

export const getAllMessages = (_req: Request, res: Response) => {
	res.json(getMessages());
};
