import { Schema } from 'mongoose';
import { type Message } from '../types/message';

export const messageSchema = new Schema<Message>(
	{
		sender: {
			type: String,
			required: true,
		},
		timestamp: {
			type: Date,
			required: true,
		},
		replyTo: {
			type: String,
			required: false,
		},
		reactionEmoji: {
			type: String,
			required: false,
		},
		type: {
			type: String,
			required: true,
		},
		content: {
			type: String,
			required: false,
      default: ''
		},
		mediaUrl: {
			type: String,
			required: false,
		},
		caption: {
			type: String,
			required: false,
		},
		duration: {
			type: Number,
			required: false,
		},
		thumbnailUrl: {
			type: String,
			required: false,
		},
	},
	{
		timestamps: true, // Automatically manage createdAt and updatedAt fields
	}
);
