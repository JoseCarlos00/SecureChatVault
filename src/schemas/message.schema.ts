import { Schema } from 'mongoose';

export const MessageSchema = new Schema(
	{
		sender: {
			type: String,
			enum: {
				values: ['me', 'other'],
				message: '{VALUE} is not supported',
			},
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
			enum: {
				values: ['text', 'image', 'video', 'audio', 'file'],
				message: '{VALUE} is not supported',
			},
			required: true,
		},
		content: {
			type: String,
			required: false,
			default: '',
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
