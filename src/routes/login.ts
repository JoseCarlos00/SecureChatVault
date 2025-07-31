import express, { Router, Request, Response } from 'express';

import { login } from '../services/login';
import { verifyToken } from '../middlewares/verifyToken';


const router: Router = express.Router();

router.get('/', (req: Request, res: Response)=> {
	res.send('Login');
});

router.post('/', login);

router.get('/register', (req: Request, res: Response) => {
	res.send('Register');
});

export default router;
