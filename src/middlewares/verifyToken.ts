import {Request, Response, NextFunction} from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

interface AuthPayload extends JwtPayload {
  username: string;
  role: string;
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies?.refreshToken;

	console.log(req.cookies);
	

	if (!token) return res.status(401).json({ error: 'Token missing' });

	try {
		 const payload = jwt.verify(token, JWT_SECRET!) as AuthPayload;


		// Aseguramos que el payload del token tiene la estructura que esperamos
		if (typeof payload !== 'object' || !payload.username || !payload.role) {
			return res.status(401).json({ error: 'Invalid token payload' });
		}

		req.user = {
			username: payload.username,
			role: payload.role,
		};

		next();
	} catch (error) {
		 return res.status(403).json({ error: 'Invalid or expired token' });
	}
};


