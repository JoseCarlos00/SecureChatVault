import {Request, Response, NextFunction} from 'express';
import { verifyAccessToken } from '../utils/token'
import { findUserById } from '../services/user.service'

export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.header('Authorization');
	const token = authHeader?.split(' ')[1];

	if (!token) return res.status(401).json({ error: 'Access token missing' });

	try {
		const payload = verifyAccessToken(token);

		// Aseguramos que el payload del token tiene la estructura que esperamos
		if (typeof payload !== 'object' || !payload.username || !payload.role) {
			return res.status(401).json({ error: 'Invalid token payload' });
		}

		const getUser = await findUserById(payload.id);

		if (!getUser) {
			return res.status(400);
		}

		req.currentUser = {
			id: getUser._id.toString(),
			name: getUser.name,
			username: getUser.username,
			role: getUser.role,
		};

		// console.log({ payload, getUser, currentUser: req.currentUser });

		next();
	} catch (error: any) {
		console.error('Error al verificar el token:', error);
		 // El token puede ser inválido o haber expirado. El cliente debería usar el refresh token en este punto.
		 return res.status(403).json({ error: 'Invalid or expired access token' });
	}
};
