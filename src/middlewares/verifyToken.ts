import {Request, Response, NextFunction} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

interface AuthPayload extends JwtPayload {
  username: string;
  role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.header('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return res.status(401).json({ error: 'Unauthorized' });
	}

	try {
		// Ahora tenemos la garantía de que JWT_SECRET existe gracias a la verificación en index.ts
		const decoded = jwt.verify(token, JWT_SECRET!) as AuthPayload;

		// Aseguramos que el payload del token tiene la estructura que esperamos
		if (typeof decoded !== 'object' || !decoded.username || !decoded.role) {
			return res.status(401).json({ error: 'Invalid token payload' });
		}

		req.user = { username: decoded.username, role: decoded.role };
		next();
	} catch (error) {
    // jwt.verify lanza un error para tokens inválidos o expirados, que capturamos aquí.
		return res.status(401).json({ error: 'Invalid or expired token' });
	}
};
