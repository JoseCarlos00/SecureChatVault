// src/index.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth'; // Rutas de autenticación
import loginRouter from './routes/login'; // Rutas públicas para login/registro
import messagesRouter from './routes/messages'; // Nuevas rutas protegidas para mensajes
import { verifyToken } from './middlewares/verifyToken';

dotenv.config();

// Es una buena práctica validar las variables de entorno críticas al arrancar.
// Esto hace que la aplicación falle rápido si la configuración es incorrecta,
// en lugar de fallar en tiempo de ejecución durante una petición.
if (!process.env.JWT_SECRET) {
	console.error('FATAL ERROR: JWT_SECRET is not defined in the .env file.');
	process.exit(1);
}

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json())
app.use(cookieParser());

app.use('/api/auth', authRoutes);

// Rutas protegida
app.get('/', verifyToken, (req: Request, res: Response) => {
	res.send('API de SecureChatVault está activa. Usa /api/login para autenticarse.');
});

// Las rutas de login y registro son PÚBLICAS, no necesitan token.
app.use('/api/login', loginRouter);

app.use('/api/messages', verifyToken, messagesRouter);

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
