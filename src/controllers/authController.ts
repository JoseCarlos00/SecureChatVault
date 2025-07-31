import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token';

const users = [
	{
		username: 'user1234',
		password: '$2b$10$tIEmXBwKkI6kqqvwNpgg2emZy.w6z452EHQSvh/CnA3jlR9RS5Rum', // 1234
	},
];

const verifyUser = async (username: string, password: string) => {
	const user = users.find((u) => u.username === username);
	if (!user) return false;

	return await bcrypt.compare(password, user.password);
};

export const login = async (req: Request, res: Response) => {
	const { username, password } = req.body;

	const valid = await verifyUser(username, password);
	if (!valid) {
		return res.status(401).json({ error: 'Invalid credentials' });
	}

	const payload = { username, role: 'user' };
	const accessToken = generateAccessToken(payload);
	const refreshToken = generateRefreshToken(payload);

	res.cookie('refreshToken', refreshToken, {
		httpOnly: true,
		sameSite: 'strict',
		secure: true,
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
	});

	res.json({ accessToken });
};

export const refreshToken = (req: Request, res: Response) => {
	const token = req.cookies.refreshToken;
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
