import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';

const users = [
	{
		username: 'user1234',
		password: '$2b$10$KQcjH4DOzlcseumlc0vEtu9SL5hXTr3RHrluY1AghX/jVzkxNXVlm',
	},
];

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

// createHashedPassword('password');

const verifyUser = async (username: string, password: string) => {
	const user = users.find((u) => u.username === username);
	if (!user) return false;

	const valid = await bcrypt.compare(password, user.password);
	if (!valid) return false;

	return true;
};

export const login = async (req: Request, res: Response) => {
	if (!req.body) {
		return res.status(400).json({ error: 'Request body is missing' });
	}
	
	const { username, password } = req.body;


	if (!username || !password) {
		return res.status(400).json({ error: 'Username and password are required' });
	}

	const valid = await verifyUser(username, password);
	if (!valid) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const payload = { username, role: 'user' };
	const accessToken = generateAccessToken(payload);
	const refreshToken = generateRefreshToken(payload);

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		sameSite: 'none',
		secure: true, // ⚠️ Esto requiere que tu backend se sirva sobre HTTPS.
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
	});

	res.json({ accessToken, payload, message: 'Inicio de sesión exitoso' });
};

export const refreshToken = (req: Request, res: Response) => {
	const token = req?.cookies?.refreshToken;
	if (!token) return res.status(401).json({ error: 'Refresh token missing' });

	try {
		const payload = verifyRefreshToken(token);
		const accessToken = generateAccessToken({ username: payload.username, role: payload.role });
		res.json({ accessToken });
	} catch (err) {
		res.status(401).json({ error: 'Invalid refresh token' });
	}
};

export const logout = (_req: Request, res: Response) => {
	res.clearCookie('refreshToken');
	res.json({ message: 'Logged out' });
};
