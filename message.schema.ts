import { Schema } from 'mongoose';

// Opciones comunes para todos los esquemas
const schemaOptions = {
	timestamps: false, // Ya tienes un campo 'timestamp'
	versionKey: false,
};

// Esquema base que contiene los campos comunes a todos los mensajes
export const BaseMessageSchema = new Schema(
	{
		sender: { type: String, enum: ['me', 'other'], required: true },
		timestamp: { type: Date, required: true },
		replyTo: { type: String, required: false },
		reactionEmoji: { type: String, required: false },
	},
	{ ...schemaOptions, discriminatorKey: 'type' } // Clave para diferenciar tipos de mensajes
);

// Esquema para mensajes de texto
export const TextMessageSchema = new Schema({
	content: { type: String, required: true },
});

// Esquema para mensajes multimedia
export const MediaMessageSchema = new Schema({
	mediaUrl: { type: String, required: true },
	caption: { type: String },
	duration: { type: Number },
	thumbnailUrl: { type: String },
});
