import  { Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testUser = {
	username: 'user1234',
	password: '$2a$12$AgvtP6p4iHNng/WIrbSNfuq1GCscOMDcsF8fq1IAzASHrzd3nSqC2',
};

const JWT_SECRET = process.env.JWT_SECRET;

const verifyUser = async (username: string, password: string) => {
	if (username !== testUser.username) {
		return false; // El usuario no existe
	}

	// Si el usuario existe, comparamos la contraseña
  const validePassword = await bcryptjs.compare(password, testUser.password);
	return validePassword;
};

export const login = async (req: Request, res: Response) => {
	try {
		// Ahora tenemos la garantía de que JWT_SECRET existe gracias a la verificación en index.ts
		const { username, password } = req.body;

		const userIsValid = await verifyUser(username, password);

		if (!userIsValid) {
			return res.status(401).json({ error: 'Invalid credentials' });
		}

    const token = jwt.sign({ username, role: 'user' }, JWT_SECRET!, { expiresIn: '1h' });

    res.json({ token });
	} catch (error) {
		console.error('Unexpected error during login:', error);
		res.status(500).json({ error: 'An unexpected error occurred' });
	}
};
