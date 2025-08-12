import express, { Router, Request, Response } from 'express';
import { findMessages } from '../controllers/messages.controller';
import { updateReaction, updateReplyTo } from '../controllers/upload.controller';

const router: Router = express.Router();

router.get('/', findMessages);
router.patch('/:id/react', updateReaction);
router.patch('/:id/reply', updateReplyTo);

export default router;
