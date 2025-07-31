import express, { Router, Request, Response } from 'express';

import { login } from '../services/login';

const router: Router = express.Router();

router.post('/', login);

router.post('/register', (req: Request, res: Response) => {
	res.send('Register');
});

export default router;
