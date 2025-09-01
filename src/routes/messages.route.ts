import { Router } from 'express';
import {
	findMessages,
	updateReaction,
	updateReplyTo,
	findFirstMessageOnDate,
} from '../controllers/messages.controller';
import { checkAdminRole } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', findMessages);
router.get('/first-on-date', findFirstMessageOnDate);

router.patch('/:id/react', checkAdminRole, updateReaction);
router.patch('/:id/reply', checkAdminRole, updateReplyTo);

export default router;
