import { model, Document } from 'mongoose';
import { MessageSchema } from '../schema/message.schema';
import { type Message } from '../types/message';

export interface MessageDocument extends Omit<Message, '_id'>, Document {}

export const MessageModel = model<MessageDocument>('Message', MessageSchema);
