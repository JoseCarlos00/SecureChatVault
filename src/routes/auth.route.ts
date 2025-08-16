import express from 'express';
import { login, refreshToken, logout } from '../controllers/auth.controller';
import { checkAdminRole } from '../middlewares/auth.middleware';

const router = express.Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

router.post('/register',checkAdminRole, (_req, res) => {
	res.send('Register');
});


export default router;
