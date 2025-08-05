import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import https from 'node:https';
import fs from 'node:fs';

import authRoutes from './routes/auth.route'; 
import messagesRouter from './routes/messages.route'; 
import uploadRouter from './routes/upload.route'; // Rutas para subir y parsear chats

import { connectToDatabase, disconnectFromDatabase } from './lib/mongodb';
import { verifyToken } from './middlewares/verifyToken';
import { config } from './config/config';

dotenv.config();

// Validar las variables de entorno críticas al arrancar.
if (!config.JWT_SECRET) {
	console.error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
	process.exit(1);
}

if (!config.JWT_REFRESH_SECRET) {
	console.error('FATAL ERROR: JWT_REFRESH_SECRET is not defined in the .env file.');
	process.exit(1);
}

if (!config.MONGODB_URI) {
	console.error('FATAL ERROR: MONGODB_URI is not defined in the .env file.');
	process.exit(1);
}

// Crear la instancia de Express
const app: Express = express();
const PORT = config.PORT;

// Middlewares Usados en todas las rutas
app.use(
	cors({
		origin: config.FRONTEND_URL,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	})
);

app.use(cookieParser());
app.use(express.json());


// Rutas PÚBLICAS, no necesitan token.
app.use('/api/auth', authRoutes);

// Rutas protegida
app.get('/', verifyToken, (req: Request, res: Response) => {
	res.send('API de SecureChatVault está activa. Usa /api/auth/login para autenticarse.');
});

app.use('/api/messages', verifyToken, messagesRouter);
app.use('/api/upload', verifyToken, uploadRouter);


// Cargar los certificados
const httpsOptions = {
	key: fs.readFileSync('./localhost+1-key.pem'),
	cert: fs.readFileSync('./localhost+1.pem'),
};

const startServer = async () => {
	await connectToDatabase();

	const server = https.createServer(httpsOptions, app).listen(PORT, () => {
		console.log(`Servidor API corriendo en https://localhost:${PORT}`);
	});

	// Graceful shutdown
	const gracefulShutdown = async (signal: string) => {
		console.log(`\nReceived ${signal}. Shutting down gracefully...`);
		server.close(async () => {
			console.log('HTTP server closed.');
			await disconnectFromDatabase();
			process.exit(0);
		});
	};

	process.on('SIGINT', () => gracefulShutdown('SIGINT'));
	process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
};

startServer();
