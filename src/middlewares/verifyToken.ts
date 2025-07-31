import {Request, Response, NextFunction} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

interface AuthPayload extends JwtPayload {
  username: string;
  role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1];

	if (!token) return res.status(401).json({ error: 'Token missing' });

	try {
		// Ahora tenemos la garantía de que JWT_SECRET existe gracias a la verificación en index.ts
		 const payload = jwt.verify(token, JWT_SECRET!) as AuthPayload;


		// Aseguramos que el payload del token tiene la estructura que esperamos
		if (typeof payload !== 'object' || !payload.username || !payload.role) {
			return res.status(401).json({ error: 'Invalid token payload' });
		}

		req.user = { username: payload.username, role: payload.role };
		next();
	} catch (error) {
    // jwt.verify lanza un error para tokens inválidos o expirados, que capturamos aquí.
		 return res.status(403).json({ error: 'Invalid or expired token' });
	}
};


