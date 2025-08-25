import { Router } from 'express';
import { login, refreshToken, logout, registerUser } from '../controllers/auth.controller';
import { checkAdminRole } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.post('/register', checkAdminRole, registerUser);

export default router;
