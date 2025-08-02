// src/index.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth'; // Rutas de autenticación
import messagesRouter from './routes/messages'; // Nuevas rutas protegidas para mensajes
import { verifyToken } from './middlewares/verifyToken';

import { config } from "./config/config";

dotenv.config();

// Validar las variables de entorno críticas al arrancar.
if (!config.JWT_SECRET) {
	console.error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
	process.exit(1);
}


const app: Express = express();
const port = config.PORT;

app.use(
	cors({
		origin: 'http://127.0.0.1:5500',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true, // si estás usando cookies
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

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});

