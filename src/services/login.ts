import  { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const testUser = {
	username: 'user1234',
	password: '$2b$10$tIEmXBwKkI6kqqvwNpgg2emZy.w6z452EHQSvh/CnA3jlR9RS5Rum',
};

const JWT_SECRET = process.env.JWT_SECRET;

const verifyUser = async (username: string, password: string) => {
	if (username !== testUser.username) {
		return false; // El usuario no existe
	}

	// Si el usuario existe, comparamos la contraseña
  const validePassword = await bcrypt.compare(password, testUser.password);
	if (!validePassword) {
		return false; // La contraseña es incorrecta
	}

	return true; 
};

async function createHashedPassword(password: string) {
	const saltRounds = 10; // Recommended for production
	try {
		const hashedPassword = await bcrypt.hash(password, saltRounds);
		console.log('Hashed Password:', hashedPassword);
		return hashedPassword;
	} catch (error) {
		console.error('Error hashing password:', error);
	}
}

export const login = async (req: Request, res: Response) => {
	try {
		// Ahora tenemos la garantía de que JWT_SECRET existe gracias a la verificación en index.ts
		const { username, password } = req.body;

		console.log({ username, password });
		console.log({testUser});
		
		

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
