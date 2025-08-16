import express, { Router, Request, Response } from 'express';
import { findMessages } from '../controllers/messages.controller';
import { updateReaction, updateReplyTo } from '../controllers/upload.controller';
import { checkAdminRole } from '../middlewares/auth.middleware';

const router: Router = express.Router();

router.get('/', findMessages);
router.patch('/:id/react',checkAdminRole, updateReaction);
router.patch('/:id/reply',checkAdminRole, updateReplyTo);

export default router;
