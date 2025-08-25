import { Router } from 'express';
import { findMessages, updateReaction, updateReplyTo } from '../controllers/messages.controller';
import { checkAdminRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', findMessages);
router.patch('/:id/react', checkAdminRole, updateReaction);
router.patch('/:id/reply', checkAdminRole, updateReplyTo);

export default router;
