import express, { Router, Request, Response } from 'express';

const router: Router = express.Router();

// Esta ruta GET /api/messages/ será protegida por el middleware verifyToken
// que se aplicará en el archivo principal (index.ts).
router.get('/', (req: Request, res: Response) => {
	// Gracias al middleware verifyToken, ahora tenemos acceso a req.user de forma segura.
	// Podemos usarlo para personalizar la respuesta o buscar mensajes específicos para ese usuario.
	const username = req.user?.username;

	console.log(req.cookies);
	

	res.json({
		message: `Hola, ${username}! Aquí están tus mensajes secretos.`,
		data: [{ id: 1, text: 'Este es el primer mensaje.' }, { id: 2, text: 'Recuerda comprar leche.' }],
	});
});

export default router;
