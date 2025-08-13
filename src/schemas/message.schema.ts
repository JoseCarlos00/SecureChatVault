import { Schema } from 'mongoose';

// Opciones comunes para todos los esquemas
const schemaOptions = {
	timestamps: false, // Automatically manage createdAt and updatedAt fields
	versionKey: false,
};

// Esquema base que contiene los campos comunes a todos los mensajes
export const BaseMessageSchema = new Schema(
	{
		sender: {
			type: String,
			enum: { values: ['me', 'other'], message: '{VALUE} no es un valor válido' },
			required: true,
		},
		timestamp: { type: Date, required: [true, 'El timestamp es obligatorio'] },
		replyTo: { type: Schema.Types.ObjectId, ref: 'Message', required: false },
		reactionEmoji: { type: String, required: false },
	},
	{ ...schemaOptions, discriminatorKey: 'type' } // Clave para diferenciar tipos de mensajes
);

// Esquema para mensajes de texto
export const TextMessageSchema = new Schema({
	content: { type: String, required: false, default: '' },
});

// Esquema para mensajes multimedia
export const MediaMessageSchema = new Schema({
	mediaUrl: { type: String, required: false },
	caption: { type: String },
	duration: { type: Number },
	thumbnailUrl: { type: String },
});
