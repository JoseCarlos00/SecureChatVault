// src/index.ts
import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';

import loginRouter from './routes/login';
// import chatRouter from '../src/routes/chat';
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

app.get('/', verifyToken, (req: Request, res: Response) => {
	res.send('¡Hola, mundo con TypeScript!');
});

app.use('/api/login', loginRouter);
// app.use('/chat', chatRouter);

app.listen(port, () => {
	console.log(`[server]: Server is running at http://localhost:${port}`);
});
