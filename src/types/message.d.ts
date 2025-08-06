export interface BaseMessage {
	sender: 'me' | 'other';
	timestamp: Date;
	replyTo?: string; // Optional reference to another message's _id
	reactionEmoji?: string; // Optional emoji reaction
}

export interface TextMessage extends BaseMessage {
	type: 'text';
	content: string;
}

export interface MediaMessage extends BaseMessage {
	type: 'image' | 'audio' | 'video' | 'sticker';
	mediaUrl: string;
	caption?: string; // Optional for images/videos
	duration?: number; // Optional for audio/video
	thumbnailUrl?: string; // Optional for videos
}

// Finalmente, crea un tipo de unión para todos los tipos de mensajes posibles
export type Message = TextMessage | MediaMessage;
