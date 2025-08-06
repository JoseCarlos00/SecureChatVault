import { model, Document, Model } from 'mongoose';
import { type BaseMessage, type TextMessage, type MediaMessage } from '../types/message';
import { BaseMessageSchema, TextMessageSchema, MediaMessageSchema } from '../schemas/message.schema';
 
// 1. Crea una interfaz base para el documento que extiende la BaseMessage y Document de Mongoose.
export interface BaseMessageDocument extends BaseMessage, Document {}

// 2. Crea interfaces específicas para cada tipo de mensaje, extendiendo la interfaz base.
export interface TextMessageDocument extends TextMessage, BaseMessageDocument {}
export interface MediaMessageDocument extends MediaMessage, BaseMessageDocument {}

// 3. Crea un tipo de unión para los documentos. Esto es lo que usará el modelo principal.
export type MessageDocument = TextMessageDocument | MediaMessageDocument;

// Se crea el modelo base a partir del BaseMessageSchema
export const MessageModel: Model<MessageDocument> = model<MessageDocument>('Message', BaseMessageSchema);

// Se registran los discriminadores para los tipos de mensaje específicos
export const TextMessageModel = MessageModel.discriminator<TextMessageDocument>('text', TextMessageSchema);
export const ImageMessageModel = MessageModel.discriminator<MediaMessageDocument>('image', MediaMessageSchema);
export const AudioMessageModel = MessageModel.discriminator<MediaMessageDocument>('audio', MediaMessageSchema);
export const VideoMessageModel = MessageModel.discriminator<MediaMessageDocument>('video', MediaMessageSchema);
export const StickerMessageModel = MessageModel.discriminator<MediaMessageDocument>('sticker', MediaMessageSchema);
