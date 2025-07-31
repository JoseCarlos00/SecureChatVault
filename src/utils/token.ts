// src/utils/token.ts
import jwt from 'jsonwebtoken';
import { config } from '../config/config';

interface Payload {
	username: string;
	role: string;
}

export const generateAccessToken = (payload: Payload): string => {
	return jwt.sign(payload, config.JWT_SECRET, {
		expiresIn: config.ACCESS_TOKEN_EXPIRE,
	});
};

export const generateRefreshToken = (payload: Payload): string => {
	return jwt.sign(payload, config.JWT_REFRESH_SECRET, {
		expiresIn: config.REFRESH_TOKEN_EXPIRE,
	});
};

export const verifyAccessToken = (token: string): Payload => {
	return jwt.verify(token, config.JWT_SECRET) as Payload;
};

export const verifyRefreshToken = (token: string): Payload => {
	return jwt.verify(token, config.JWT_REFRESH_SECRET) as Payload;
};
