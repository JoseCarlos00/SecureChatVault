import { model, Model } from 'mongoose';
import { type Message, type TextMessage, type MediaMessage } from '../types/message';
import { BaseMessageSchema, TextMessageSchema, MediaMessageSchema } from '../schemas/message.schema';

// Se crea el modelo base a partir del BaseMessageSchema
export const MessageModel: Model<Message> = model<Message>('Message', BaseMessageSchema);

// Se registran los discriminadores para los tipos de mensaje específicos
export const TextMessageModel = MessageModel.discriminator<TextMessage>('text', TextMessageSchema);

export const ImageMessageModel = MessageModel.discriminator<MediaMessage>('image', MediaMessageSchema);
export const AudioMessageModel = MessageModel.discriminator<MediaMessage>('audio', MediaMessageSchema);
export const VideoMessageModel = MessageModel.discriminator<MediaMessage>('video', MediaMessageSchema);
export const StickerMessageModel = MessageModel.discriminator<MediaMessage>('sticker', MediaMessageSchema);
