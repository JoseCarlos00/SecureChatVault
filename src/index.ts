// src/index.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import https from 'node:https';
import fs from 'node:fs';

import authRoutes from './routes/auth.route'; // Rutas de autenticación
import messagesRouter from './routes/messages.route'; // Nuevas rutas protegidas para mensajes
import { verifyToken } from './middlewares/verifyToken';

import { config } from "./config/config";

dotenv.config();

// Validar las variables de entorno críticas al arrancar.
if (!config.JWT_SECRET) {
	console.error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
	process.exit(1);
}


const app: Express = express();
const PORT = config.PORT;

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

// app.listen(PORT, () => {
// 	console.log(`Servidor API corriendo en http://localhost:${PORT}`);
// 	});
	
	// Cargar los certificados
	const httpsOptions = {
		key: fs.readFileSync('./localhost+1-key.pem'),
		cert: fs.readFileSync('./localhost+1.pem'),
	};


	// Levantar el servidor HTTPS
	https.createServer(httpsOptions, app).listen(PORT, () => {
		console.log(`Servidor API corriendo en http://localhost:${PORT}`);
});

