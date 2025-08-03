import express, { Router, Request, Response } from 'express';
import { getAllMessages } from '../controllers/messages.controller';

const router: Router = express.Router();

router.get('/', getAllMessages);

export default router;
