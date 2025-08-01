import express from 'express';
import { login, refreshToken, logout } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.post('/register', (_req, res) => {
	res.send('Register');
});


export default router;
