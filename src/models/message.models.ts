import { model } from 'mongoose';
import { messageSchema } from '../schemas/message.schemas';

export const Message = model('Message', messageSchema);
