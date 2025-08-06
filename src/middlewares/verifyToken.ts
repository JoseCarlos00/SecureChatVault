import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';
import { type AuthPayload } from '../types/authPayload'

const JWT_SECRET = process.env.JWT_SECRET;


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.header('Authorization');
	const token = authHeader?.split(' ')[1];

	if (!token) return res.status(401).json({ error: 'Access token missing' });

	try { 
		 const payload = jwt.verify(token, JWT_SECRET!) as AuthPayload;

		// Aseguramos que el payload del token tiene la estructura que esperamos
		if (typeof payload !== 'object' || !payload.username || !payload.role) {
			return res.status(401).json({ error: 'Invalid token payload' });
		}

		req.user = {
			id: payload.id,
			name: payload.name,
			username: payload.username,
			role: payload.role,
		};

		next();
	} catch (error) {
		 // El token puede ser inválido o haber expirado. El cliente debería usar el refresh token en este punto.
		 return res.status(403).json({ error: 'Invalid or expired access token' });
	}
};
