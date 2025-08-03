import express, { Router, Request, Response } from 'express';
import { findMessages } from '../controllers/messages.controller';

const router: Router = express.Router();

router.get('/', findMessages);

export default router;
