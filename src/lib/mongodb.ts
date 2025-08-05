import mongoose from 'mongoose';
import { config } from '../config/config';

if (!config.MONGODB_URI) {
	throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

export const connectToDatabase = async () => {
	try {
		await mongoose.connect(config.MONGODB_URI);
		console.log('Successfully connected to MongoDB using Mongoose!');
	} catch (error) {
		console.error('Could not connect to MongoDB using Mongoose', error);
		// Exit the process if the DB connection fails on startup
		process.exit(1);
	}
};

export const disconnectFromDatabase = async (): Promise<void> => {
	if (mongoose.connection.readyState !== 0) {
		await mongoose.disconnect();
		console.log('Disconnected from MongoDB.');
	}
};
